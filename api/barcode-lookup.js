// Funcion serverless de Vercel: resuelve metadata de un codigo de barras
// consultando fuentes externas servidor-a-servidor. Esto evita el bloqueo de
// CORS que sufre Open Library al llamarse directo desde el navegador (no
// envia cabecera Access-Control-Allow-Origin) y centraliza Google Books /
// Open Food Facts para el modo demo.

const BOOK_EAN_PREFIXES = ['978', '979'];
const isBookCode = (code) => BOOK_EAN_PREFIXES.some((prefix) => code.startsWith(prefix));

// Cada proveedor devuelve uno de estos resultados. El `status` viaja despues en
// la respuesta (campo `sources`) para poder diagnosticar desde afuera cual
// fuente contesto y cual no: sin esto, una API key mal configurada es
// indistinguible de un codigo que realmente no existe.
const FOUND = (metadata) => ({ metadata, status: 'found' });
const NOT_FOUND = { metadata: null, status: 'not_found' };
const FAILED = { metadata: null, status: 'error' };
const NOT_CONFIGURED = { metadata: null, status: 'not_configured' };

async function fetchWithTimeout(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function lookupGoogleBooks(isbn) {
  try {
    const res = await fetchWithTimeout(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1&printType=books&projection=lite`
    );
    if (!res.ok) return FAILED;
    const data = await res.json();
    const info = data.items?.[0]?.volumeInfo;
    if (!info?.title) return NOT_FOUND;
    return FOUND({
      name: info.title,
      authors: Array.isArray(info.authors) ? info.authors : [],
      publisher: info.publisher || '',
      brand: info.publisher || '',
      subcategory: info.categories?.[0] || 'Libro',
      image_url: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '',
    });
  } catch {
    return FAILED;
  }
}

async function lookupOpenLibrary(isbn) {
  try {
    const res = await fetchWithTimeout(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
    );
    if (!res.ok) return FAILED;
    const data = await res.json();
    const book = data[`ISBN:${isbn}`];
    if (!book?.title) return NOT_FOUND;
    return FOUND({
      name: book.title,
      authors: (book.authors || []).map((a) => a.name),
      publisher: book.publishers?.[0]?.name || '',
      brand: book.publishers?.[0]?.name || '',
      subcategory: book.subjects?.[0]?.name || 'Libro',
      image_url: book.cover?.medium || book.cover?.small || '',
    });
  } catch {
    return FAILED;
  }
}

// Open Food Facts, Open Products Facts (no-food), Open Beauty Facts
// (cosmetica) y Open Pet Food Facts son proyectos hermanos con la misma forma
// de API (Open*Facts, v3), asi que comparten el mismo parser. Entre los cuatro
// cubren bastante mas que solo alimentos: papeleria, juguetes, cosmetica,
// bazar, lo tipico de una libreria.
async function lookupOpenFactsFamily(baseUrl, code) {
  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/v3/product/${encodeURIComponent(code)}`);
    // Estas APIs responden 404 (no un error de servidor) cuando el codigo
    // simplemente no esta en su base: es un "no encontrado" legitimo.
    if (res.status === 404) return NOT_FOUND;
    if (!res.ok) return FAILED;
    const data = await res.json();
    const product = data?.product;
    // La API v3 devuelve status como string ("success"/"failure"), no el 0/1 numerico de v0/v2.
    if (data?.status !== 'success' || !product?.product_name) return NOT_FOUND;
    return FOUND({
      name: product.product_name,
      authors: [],
      publisher: product.brands || '',
      brand: product.brands || '',
      subcategory: (product.categories_tags?.[0] || '').replace(/^\w+:/, ''),
      image_url: product.image_front_small_url || product.image_url || '',
    });
  } catch {
    return FAILED;
  }
}

const lookupOpenFoodFacts = (code) => lookupOpenFactsFamily('https://world.openfoodfacts.org', code);
const lookupOpenProductsFacts = (code) => lookupOpenFactsFamily('https://world.openproductsfacts.org', code);
const lookupOpenBeautyFacts = (code) => lookupOpenFactsFamily('https://world.openbeautyfacts.org', code);
const lookupOpenPetFoodFacts = (code) => lookupOpenFactsFamily('https://world.openpetfoodfacts.org', code);

async function lookupUpcItemDb(code) {
  try {
    const res = await fetchWithTimeout(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`);
    if (!res.ok) return FAILED;
    const data = await res.json();
    const item = Array.isArray(data.items) ? data.items[0] : null;
    if (!item?.title) return NOT_FOUND;
    return FOUND({
      name: item.title,
      authors: [],
      publisher: item.brand || '',
      brand: item.brand || '',
      subcategory: item.category || '',
      image_url: Array.isArray(item.images) ? item.images[0] || '' : '',
    });
  } catch {
    return FAILED;
  }
}

// EAN-Search.org: base comercial (no crowdsourced), cubre mas de 1200 millones
// de codigos internacionales, incluidos ~1,6 millones con prefijo argentino
// (779). Requiere una API key propia (registro en
// https://www.ean-search.org/ean-database-api.html) puesta en la variable de
// entorno EAN_SEARCH_API_TOKEN de Vercel (server-side, sin prefijo VITE_ para
// que no quede expuesta en el bundle del navegador).
async function lookupEanSearch(code) {
  const token = process.env.EAN_SEARCH_API_TOKEN;
  if (!token) return NOT_CONFIGURED;
  try {
    const res = await fetchWithTimeout(
      `https://api.ean-search.org/api?token=${encodeURIComponent(token)}&op=barcode-lookup&format=json&ean=${encodeURIComponent(code)}`
    );
    if (!res.ok) return FAILED;
    const data = await res.json();
    // La respuesta exitosa es un array (ej: [{ name, categoryName, ... }]).
    // Un codigo ausente devuelve [{ error: "Barcode not found" }], asi que hay
    // que mirar `name` y no la forma del array.
    const item = Array.isArray(data) ? data[0] : null;
    if (!item?.name) return NOT_FOUND;
    return FOUND({
      name: item.name,
      authors: [],
      publisher: '',
      brand: '',
      subcategory: item.categoryName || '',
      image_url: '',
    });
  } catch {
    return FAILED;
  }
}

// Orden de preferencia. Para libros manda Open Library (sin limite de cuota) y
// Google Books; para el resto se prueban todas en paralelo y gana la primera
// de esta lista que haya encontrado algo.
const BOOK_PROVIDERS = [
  { source: 'open-library', run: lookupOpenLibrary },
  { source: 'google-books', run: lookupGoogleBooks },
  { source: 'ean-search', run: lookupEanSearch },
];

// Las crowdsourced van primero porque devuelven imagen, marca y categoria;
// EAN-Search tiene mucha mas cobertura pero solo aporta el nombre, asi que
// cierra la lista como respaldo.
const PRODUCT_PROVIDERS = [
  { source: 'open-food-facts', run: lookupOpenFoodFacts },
  { source: 'open-products-facts', run: lookupOpenProductsFacts },
  { source: 'open-beauty-facts', run: lookupOpenBeautyFacts },
  { source: 'open-pet-food-facts', run: lookupOpenPetFoodFacts },
  { source: 'upcitemdb', run: lookupUpcItemDb },
  { source: 'ean-search', run: lookupEanSearch },
];

// `failed` marca "no sabemos", no "algo salio mal": solo es true cuando ninguna
// fuente llego a dar una respuesta concluyente. Con varias fuentes en paralelo,
// que una se caiga es esperable, y no tiene sentido pedirle al usuario que
// reintente cuando las demas ya contestaron que no lo tienen.
const summarize = (results) => ({
  metadata: results.find((result) => result.metadata)?.metadata || null,
  failed: !results.some((result) => result.status === 'found' || result.status === 'not_found'),
  sources: results.map(({ source, status }) => ({ source, status })),
});

// No-libro: se consultan en paralelo (no en cadena) para no sumar sus timeouts
// uno atras del otro y quedarse sin tiempo de funcion. La prioridad la define
// el orden de la lista, no cual conteste primero.
async function runProvidersParallel(providers, code) {
  return summarize(
    await Promise.all(providers.map(async ({ source, run }) => ({ source, ...(await run(code)) })))
  );
}

// Libros: en cadena, cortando apenas uno contesta. Aca la cuota importa mas que
// la latencia: Google Books tiene un limite anonimo global y EAN-Search cobra
// por consulta, asi que no conviene gastarlos cuando Open Library (sin cuota)
// ya resolvio el ISBN.
async function runProvidersSequential(providers, code) {
  const results = [];
  for (const { source, run } of providers) {
    if (results.some((result) => result.metadata)) {
      results.push({ source, metadata: null, status: 'skipped' });
      continue;
    }
    results.push({ source, ...(await run(code)) });
  }
  return summarize(results);
}

async function translateToSpanish(text) {
  if (!text || typeof text !== 'string') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetchWithTimeout(url, 2000);
    if (!res.ok) return text;
    const data = await res.json();
    let translated = '';
    if (Array.isArray(data[0])) {
      for (const part of data[0]) {
        if (part[0]) translated += part[0];
      }
    }
    return translated.trim() || text;
  } catch {
    return text;
  }
}

export default async function handler(req, res) {
  const code = String(req.query?.code || '').trim();
  if (!code) {
    res.status(200).json({ metadata: null, failed: false, sources: [] });
    return;
  }

  const result = isBookCode(code)
    ? await runProvidersSequential(BOOK_PROVIDERS, code)
    : await runProvidersParallel(PRODUCT_PROVIDERS, code);

  if (result.metadata) {
    if (result.metadata.name) {
      result.metadata.name = await translateToSpanish(result.metadata.name);
    }
    if (result.metadata.subcategory && result.metadata.subcategory !== 'Libro') {
      result.metadata.subcategory = await translateToSpanish(result.metadata.subcategory);
    }
  }

  res.status(200).json(result);
}
