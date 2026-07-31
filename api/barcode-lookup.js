// Funcion serverless de Vercel: resuelve metadata de un codigo de barras
// consultando fuentes externas servidor-a-servidor. Esto evita el bloqueo de
// CORS que sufre Open Library al llamarse directo desde el navegador (no
// envia cabecera Access-Control-Allow-Origin) y centraliza Google Books /
// Open Food Facts para el modo demo.

const BOOK_EAN_PREFIXES = ['978', '979'];
const isBookCode = (code) => BOOK_EAN_PREFIXES.some((prefix) => code.startsWith(prefix));

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
    if (!res.ok) return { metadata: null, error: true };
    const data = await res.json();
    const info = data.items?.[0]?.volumeInfo;
    if (!info?.title) return { metadata: null, error: false };
    return {
      error: false,
      metadata: {
        name: info.title,
        authors: Array.isArray(info.authors) ? info.authors : [],
        publisher: info.publisher || '',
        brand: info.publisher || '',
        subcategory: info.categories?.[0] || 'Libro',
        image_url: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '',
      },
    };
  } catch {
    return { metadata: null, error: true };
  }
}

async function lookupOpenLibrary(isbn) {
  try {
    const res = await fetchWithTimeout(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
    );
    if (!res.ok) return { metadata: null, error: true };
    const data = await res.json();
    const book = data[`ISBN:${isbn}`];
    if (!book?.title) return { metadata: null, error: false };
    return {
      error: false,
      metadata: {
        name: book.title,
        authors: (book.authors || []).map((a) => a.name),
        publisher: book.publishers?.[0]?.name || '',
        brand: book.publishers?.[0]?.name || '',
        subcategory: book.subjects?.[0]?.name || 'Libro',
        image_url: book.cover?.medium || book.cover?.small || '',
      },
    };
  } catch {
    return { metadata: null, error: true };
  }
}

// Open Food Facts, Open Products Facts (no-food) y Open Beauty Facts (cosmetica)
// son proyectos hermanos con la misma forma de API (Open*Facts, v3), asi que
// comparten el mismo parser. Entre los tres cubren bastante mas que solo
// alimentos: papeleria, juguetes, cosmetica, bazar, lo tipico de una libreria.
async function lookupOpenFactsFamily(baseUrl, code) {
  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/v3/product/${encodeURIComponent(code)}`);
    // Estas APIs responden 404 (no un error de servidor) cuando el codigo
    // simplemente no esta en su base: es un "no encontrado" legitimo.
    if (res.status === 404) return { metadata: null, error: false };
    if (!res.ok) return { metadata: null, error: true };
    const data = await res.json();
    const product = data?.product;
    // La API v3 devuelve status como string ("success"/"failure"), no el 0/1 numerico de v0/v2.
    if (data?.status !== 'success' || !product?.product_name) return { metadata: null, error: false };
    return {
      error: false,
      metadata: {
        name: product.product_name,
        authors: [],
        publisher: product.brands || '',
        brand: product.brands || '',
        subcategory: (product.categories_tags?.[0] || '').replace(/^\w+:/, ''),
        image_url: product.image_front_small_url || product.image_url || '',
      },
    };
  } catch {
    return { metadata: null, error: true };
  }
}

const lookupOpenFoodFacts = (code) => lookupOpenFactsFamily('https://world.openfoodfacts.org', code);
const lookupOpenProductsFacts = (code) => lookupOpenFactsFamily('https://world.openproductsfacts.org', code);
const lookupOpenBeautyFacts = (code) => lookupOpenFactsFamily('https://world.openbeautyfacts.org', code);

async function lookupUpcItemDb(code) {
  try {
    const res = await fetchWithTimeout(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`);
    if (!res.ok) return { metadata: null, error: true };
    const data = await res.json();
    const item = Array.isArray(data.items) ? data.items[0] : null;
    if (!item?.title) return { metadata: null, error: false };
    return {
      error: false,
      metadata: {
        name: item.title,
        authors: [],
        publisher: item.brand || '',
        brand: item.brand || '',
        subcategory: item.category || '',
        image_url: Array.isArray(item.images) ? item.images[0] || '' : '',
      },
    };
  } catch {
    return { metadata: null, error: true };
  }
}

export default async function handler(req, res) {
  const code = String(req.query?.code || '').trim();
  if (!code) {
    res.status(200).json({ metadata: null, failed: false });
    return;
  }

  if (isBookCode(code)) {
    // Open Library primero: sin limite de cuota. Google Books queda de
    // respaldo (su cuota anonima es global y puede estar saturada).
    const openLibrary = await lookupOpenLibrary(code);
    if (openLibrary.metadata) {
      res.status(200).json({ metadata: openLibrary.metadata, failed: false });
      return;
    }
    const googleBooks = await lookupGoogleBooks(code);
    res.status(200).json({ metadata: googleBooks.metadata, failed: openLibrary.error || googleBooks.error });
    return;
  }

  // No-libro: se consultan las 4 fuentes en paralelo (no en cadena) para no
  // sumar sus timeouts uno atras del otro y quedarse sin tiempo de funcion.
  const providers = [lookupOpenFoodFacts, lookupOpenProductsFacts, lookupOpenBeautyFacts, lookupUpcItemDb];
  const results = await Promise.all(providers.map((run) => run(code)));
  const found = results.find((r) => r.metadata);
  if (found) {
    res.status(200).json({ metadata: found.metadata, failed: false });
    return;
  }
  res.status(200).json({ metadata: null, failed: results.some((r) => r.error) });
}
