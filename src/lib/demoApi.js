const DEMO_STORAGE_KEY = 'supercheck_libreria_demo_state_v1';
const DEMO_MODE_KEY = 'supercheck_libreria_demo_mode';
const DEMO_VERSION = 2;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function nextId(state, key) {
  const current = Number(state.nextIds?.[key] || 1);
  state.nextIds[key] = current + 1;
  return current;
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function lower(value) {
  return normalizeText(value).toLowerCase();
}

function parseBool(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function readPayload(body) {
  if (!body) return {};
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const out = {};
    body.forEach((value, key) => {
      if (typeof File !== 'undefined' && value instanceof File) return;
      out[key] = value;
    });
    return out;
  }
  if (typeof body === 'object') return body;
  return {};
}

function makeError(status, message, data = null) {
  const err = new Error(`${status} Demo: ${message}`);
  err.status = status;
  err.data = data || { detail: message };
  return err;
}

export function isDemoMode() {
  const envEnabled = import.meta.env.VITE_DEMO_MODE === '1' || import.meta.env.VITE_DEMO_MODE === 'true';
  try {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('demo') === '1') {
      window.localStorage.setItem(DEMO_MODE_KEY, '1');
      return true;
    }
    if (params.get('demo') === '0') {
      window.localStorage.removeItem(DEMO_MODE_KEY);
      return envEnabled;
    }
    return envEnabled || window.localStorage.getItem(DEMO_MODE_KEY) === '1';
  } catch {
    return envEnabled;
  }
}

function maybeResetDemoState() {
  try {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('demo_reset') === '1') {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    }
  } catch {
    // Sin acceso a query/localStorage, se usa estado en memoria inicial.
  }
}

function baseProducts() {
  return [
    {
      id: 1,
      name: 'Cuaderno universitario',
      sku_prefix: 'CUAD',
      brand: 'Ledesma',
      description: 'Cuadernos espiralados para clases, apuntes y uso diario.',
      subcategory: 'Cuadernos y carpetas',
      unit_of_measure: 'unidad',
      iva_rate_pct: 21,
      usual_supplier_id: 1,
      default_price_store_ars: 3200,
      default_price_online_ars: 3200,
      default_cost_ars: 1900,
      active: true,
    },
    {
      id: 2,
      name: 'Lapicera gel',
      sku_prefix: 'LAPGEL',
      brand: 'Faber-Castell',
      description: 'Lapiceras gel para escritura escolar, oficina y regalos.',
      subcategory: 'Escritura',
      unit_of_measure: 'unidad',
      iva_rate_pct: 21,
      usual_supplier_id: 1,
      default_price_store_ars: 950,
      default_price_online_ars: 950,
      default_cost_ars: 520,
      active: true,
    },
    {
      id: 3,
      name: 'Resma A4',
      sku_prefix: 'RESMA',
      brand: 'Boreal',
      description: 'Papel A4 para impresiones, fotocopias y uso administrativo.',
      subcategory: 'Papeleria',
      unit_of_measure: 'unidad',
      iva_rate_pct: 21,
      usual_supplier_id: 1,
      default_price_store_ars: 7800,
      default_price_online_ars: 7800,
      default_cost_ars: 5200,
      active: true,
    },
    {
      id: 4,
      name: 'Libros de lectura escolar',
      sku_prefix: 'LIBESC',
      brand: 'Editorial escolar',
      description: 'Lecturas clasicas y material escolar para primaria y secundaria.',
      subcategory: 'Libros escolares',
      unit_of_measure: 'unidad',
      iva_rate_pct: 21,
      usual_supplier_id: 2,
      default_price_store_ars: 16500,
      default_price_online_ars: 16500,
      default_cost_ars: 11000,
      active: true,
    },
    {
      id: 5,
      name: 'Marcadores y resaltadores',
      sku_prefix: 'MARC',
      brand: 'Trabi',
      description: 'Marcadores, fibras y resaltadores para estudio y oficina.',
      subcategory: 'Arte y escritura',
      unit_of_measure: 'unidad',
      iva_rate_pct: 21,
      usual_supplier_id: 1,
      default_price_store_ars: 1800,
      default_price_online_ars: 1800,
      default_cost_ars: 1050,
      active: true,
    },
    {
      id: 6,
      name: 'Mochila escolar',
      sku_prefix: 'MOCH',
      brand: 'Mooving',
      description: 'Mochilas y cartucheras para temporada escolar.',
      subcategory: 'Mochilas y cartucheras',
      unit_of_measure: 'unidad',
      iva_rate_pct: 21,
      usual_supplier_id: 3,
      default_price_store_ars: 42000,
      default_price_online_ars: 42000,
      default_cost_ars: 28500,
      active: true,
    },
  ];
}

function makeVariant(row) {
  const stock = Number(row.stock_on_hand || 0);
  const optionRows = row.option_rows || [];
  const optionValues = row.option_values || optionRows.map((option, idx) => ({
    attribute_code: option.attribute_code,
    attribute_name: option.attribute_name || (option.attribute_code === 'presentacion' ? 'Presentacion' : option.attribute_code),
    option_value: option.value,
    sort_order: idx + 1,
  }));
  return {
    supplier_id: row.supplier_id || null,
    supplier_name: row.supplier_name || '',
    stock_reserved: Number(row.stock_reserved || 0),
    stock_available: Math.max(0, stock - Number(row.stock_reserved || 0)),
    active: row.active !== false,
    barcodes: row.barcodes || [
      {
        id: row.id * 10,
        barcode: row.barcode_internal,
        is_primary: true,
        supplier_id: row.supplier_id || null,
        supplier_name: row.supplier_name || '',
      },
    ],
    option_rows: optionRows,
    option_values: optionValues,
    ...row,
    precio_local: Number(row.price_store_ars || 0),
  };
}

function baseVariants() {
  return [
    makeVariant({
      id: 101,
      product_id: 1,
      producto: 'Cuaderno universitario',
      product_name: 'Cuaderno universitario',
      display_name: 'A4 80 hojas rayado',
      option_signature: 'A4 80 hojas rayado',
      sku: 'CUAD-A4R-80',
      barcode_internal: '7790001000079',
      price_store_ars: 3200,
      price_online_ars: 3200,
      cost_avg_ars: 1900,
      stock_on_hand: 60,
      stock_min: 12,
      stock_max: 120,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'A4 80 hojas rayado' }],
    }),
    makeVariant({
      id: 102,
      product_id: 1,
      producto: 'Cuaderno universitario',
      product_name: 'Cuaderno universitario',
      display_name: 'A4 80 hojas cuadriculado',
      option_signature: 'A4 80 hojas cuadriculado',
      sku: 'CUAD-A4C-80',
      barcode_internal: '7790001000086',
      price_store_ars: 3400,
      price_online_ars: 3400,
      cost_avg_ars: 2050,
      stock_on_hand: 44,
      stock_min: 10,
      stock_max: 100,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'A4 80 hojas cuadriculado' }],
    }),
    makeVariant({
      id: 103,
      product_id: 1,
      producto: 'Cuaderno universitario',
      product_name: 'Cuaderno universitario',
      display_name: 'A5 60 hojas rayado',
      option_signature: 'A5 60 hojas rayado',
      sku: 'CUAD-A5R-60',
      barcode_internal: '7790001000017',
      price_store_ars: 2200,
      price_online_ars: 2200,
      cost_avg_ars: 1350,
      stock_on_hand: 36,
      stock_min: 8,
      stock_max: 80,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'A5 60 hojas rayado' }],
    }),
    makeVariant({
      id: 104,
      product_id: 1,
      producto: 'Cuaderno universitario',
      product_name: 'Cuaderno universitario',
      display_name: 'Pack 5 A4 rayado',
      option_signature: 'Pack 5 A4 rayado',
      sku: 'CUAD-A4R-P5',
      barcode_internal: '7790001000093',
      price_store_ars: 15200,
      price_online_ars: 15200,
      cost_avg_ars: 9400,
      stock_on_hand: 12,
      stock_min: 3,
      stock_max: 30,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Pack 5 A4 rayado' }],
    }),
    makeVariant({
      id: 201,
      product_id: 2,
      producto: 'Lapicera gel',
      product_name: 'Lapicera gel',
      display_name: 'Azul 0.7mm',
      option_signature: 'Azul 0.7mm',
      sku: 'LAPGEL-AZ-07',
      barcode_internal: '7790001000024',
      price_store_ars: 950,
      price_online_ars: 950,
      cost_avg_ars: 520,
      stock_on_hand: 48,
      stock_min: 12,
      stock_max: 120,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Azul 0.7mm' }],
    }),
    makeVariant({
      id: 202,
      product_id: 2,
      producto: 'Lapicera gel',
      product_name: 'Lapicera gel',
      display_name: 'Negra 0.7mm',
      option_signature: 'Negra 0.7mm',
      sku: 'LAPGEL-NE-07',
      barcode_internal: '7790001000109',
      price_store_ars: 950,
      price_online_ars: 950,
      cost_avg_ars: 520,
      stock_on_hand: 52,
      stock_min: 12,
      stock_max: 120,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Negra 0.7mm' }],
    }),
    makeVariant({
      id: 203,
      product_id: 2,
      producto: 'Lapicera gel',
      product_name: 'Lapicera gel',
      display_name: 'Pack 10 azul',
      option_signature: 'Pack 10 azul',
      sku: 'LAPGEL-AZ-P10',
      barcode_internal: '7790001000130',
      price_store_ars: 8500,
      price_online_ars: 8500,
      cost_avg_ars: 4800,
      stock_on_hand: 18,
      stock_min: 6,
      stock_max: 50,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Pack 10 azul' }],
    }),
    makeVariant({
      id: 301,
      product_id: 3,
      producto: 'Resma A4',
      product_name: 'Resma A4',
      display_name: '75g 500 hojas',
      option_signature: '75g 500 hojas',
      sku: 'RESMA-A4-75',
      barcode_internal: '7790001000031',
      price_store_ars: 7800,
      price_online_ars: 7800,
      cost_avg_ars: 5200,
      stock_on_hand: 30,
      stock_min: 6,
      stock_max: 60,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: '75g 500 hojas' }],
    }),
    makeVariant({
      id: 302,
      product_id: 3,
      producto: 'Resma A4',
      product_name: 'Resma A4',
      display_name: 'Caja 5 resmas',
      option_signature: 'Caja 5 resmas',
      sku: 'RESMA-A4-C5',
      barcode_internal: '7790001000116',
      price_store_ars: 36900,
      price_online_ars: 36900,
      cost_avg_ars: 24800,
      stock_on_hand: 10,
      stock_min: 3,
      stock_max: 30,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Caja 5 resmas' }],
    }),
    makeVariant({
      id: 401,
      product_id: 4,
      producto: 'Libros de lectura escolar',
      product_name: 'Libros de lectura escolar',
      display_name: 'El Principito - tapa blanda',
      option_signature: 'El Principito - tapa blanda',
      sku: 'LIBESC-PRINCIPITO',
      barcode_internal: '7790001000048',
      price_store_ars: 12500,
      price_online_ars: 12500,
      cost_avg_ars: 8200,
      stock_on_hand: 22,
      stock_min: 5,
      stock_max: 50,
      unit_of_measure: 'unidad',
      supplier_id: 2,
      supplier_name: 'Editorial Escolar Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'El Principito - tapa blanda' }],
    }),
    makeVariant({
      id: 402,
      product_id: 4,
      producto: 'Libros de lectura escolar',
      product_name: 'Libros de lectura escolar',
      display_name: 'Cuentos de la selva',
      option_signature: 'Cuentos de la selva',
      sku: 'LIBESC-SELVA',
      barcode_internal: '7790001000123',
      price_store_ars: 14800,
      price_online_ars: 14800,
      cost_avg_ars: 9800,
      stock_on_hand: 16,
      stock_min: 4,
      stock_max: 40,
      unit_of_measure: 'unidad',
      supplier_id: 2,
      supplier_name: 'Editorial Escolar Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Cuentos de la selva' }],
    }),
    makeVariant({
      id: 403,
      product_id: 4,
      producto: 'Libros de lectura escolar',
      product_name: 'Libros de lectura escolar',
      display_name: 'Antologia secundaria',
      option_signature: 'Antologia secundaria',
      sku: 'LIBESC-ANTO-SEC',
      barcode_internal: '7790001000178',
      price_store_ars: 16500,
      price_online_ars: 16500,
      cost_avg_ars: 11000,
      stock_on_hand: 14,
      stock_min: 4,
      stock_max: 40,
      unit_of_measure: 'unidad',
      supplier_id: 2,
      supplier_name: 'Editorial Escolar Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Antologia secundaria' }],
    }),
    makeVariant({
      id: 501,
      product_id: 5,
      producto: 'Marcadores y resaltadores',
      product_name: 'Marcadores y resaltadores',
      display_name: 'Marcadores fibra x12',
      option_signature: 'Marcadores fibra x12',
      sku: 'MARC-FIBRA-X12',
      barcode_internal: '7790001000055',
      price_store_ars: 6200,
      price_online_ars: 6200,
      cost_avg_ars: 3800,
      stock_on_hand: 20,
      stock_min: 5,
      stock_max: 50,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Marcadores fibra x12' }],
    }),
    makeVariant({
      id: 502,
      product_id: 5,
      producto: 'Marcadores y resaltadores',
      product_name: 'Marcadores y resaltadores',
      display_name: 'Resaltador amarillo',
      option_signature: 'Resaltador amarillo',
      sku: 'MARC-RES-AM',
      barcode_internal: '7790001000161',
      price_store_ars: 1800,
      price_online_ars: 1800,
      cost_avg_ars: 1050,
      stock_on_hand: 25,
      stock_min: 5,
      stock_max: 50,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Resaltador amarillo' }],
    }),
    makeVariant({
      id: 503,
      product_id: 5,
      producto: 'Marcadores y resaltadores',
      product_name: 'Marcadores y resaltadores',
      display_name: 'Set resaltadores x4',
      option_signature: 'Set resaltadores x4',
      sku: 'MARC-RES-X4',
      barcode_internal: '7790001000185',
      price_store_ars: 5600,
      price_online_ars: 5600,
      cost_avg_ars: 3250,
      stock_on_hand: 19,
      stock_min: 6,
      stock_max: 50,
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Distribuidora Papelera Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Set resaltadores x4' }],
    }),
    makeVariant({
      id: 601,
      product_id: 6,
      producto: 'Mochila escolar',
      product_name: 'Mochila escolar',
      display_name: 'Mochila 18L',
      option_signature: 'Mochila 18L',
      sku: 'MOCH-18L',
      barcode_internal: '7790001000147',
      price_store_ars: 42000,
      price_online_ars: 42000,
      cost_avg_ars: 28500,
      stock_on_hand: 9,
      stock_min: 3,
      stock_max: 25,
      unit_of_measure: 'unidad',
      supplier_id: 3,
      supplier_name: 'Librería Mayorista Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Mochila 18L' }],
    }),
    makeVariant({
      id: 602,
      product_id: 6,
      producto: 'Mochila escolar',
      product_name: 'Mochila escolar',
      display_name: 'Cartuchera 2 cierres',
      option_signature: 'Cartuchera 2 cierres',
      sku: 'MOCH-CART-2C',
      barcode_internal: '7790001000062',
      price_store_ars: 12500,
      price_online_ars: 12500,
      cost_avg_ars: 7800,
      stock_on_hand: 24,
      stock_min: 6,
      stock_max: 72,
      unit_of_measure: 'unidad',
      supplier_id: 3,
      supplier_name: 'Librería Mayorista Demo',
      option_rows: [{ attribute_code: 'presentacion', value: 'Cartuchera 2 cierres' }],
    }),
  ];
}

function baseSuppliers() {
  return [
    { id: 1, name: 'Distribuidora Papelera Demo', cuit: '30-70000001-2', phone: '011-5555-1000', email: 'compras@papelera-demo.local', notes: 'Papeleria, escritura y utiles escolares', active: true },
    { id: 2, name: 'Editorial Escolar Demo', cuit: '30-70000002-0', phone: '011-5555-2000', email: 'editorial@demo.local', notes: 'Libros de lectura y textos escolares', active: true },
    { id: 3, name: 'Librería Mayorista Demo', cuit: '30-70000003-9', phone: '011-5555-3000', email: 'mayorista@demo.local', notes: 'Mochilas, cartucheras y temporada escolar', active: true },
  ];
}

function basePaymentAccounts() {
  return [
    { code: 'cash', label: 'Caja', payment_method: 'cash', price_modifier_pct: -10, active: true, sort_order: 10 },
    { code: 'payway', label: 'Payway', payment_method: 'credit', price_modifier_pct: 10, active: true, sort_order: 20 },
    { code: 'debit_pos', label: 'Debito POS', payment_method: 'debit', price_modifier_pct: 0, active: true, sort_order: 30 },
    { code: 'transfer_1', label: 'Transferencia Cuenta 1', payment_method: 'transfer', price_modifier_pct: 0, active: true, sort_order: 40 },
    { code: 'wallet', label: 'QR / Billetera', payment_method: 'wallet', price_modifier_pct: 0, active: true, sort_order: 50 },
    { code: 'store_credit', label: 'Credito tienda', payment_method: 'store_credit', price_modifier_pct: 0, active: true, sort_order: 60 },
  ];
}

function cashSummary(session, sales = []) {
  const opening = Number(session?.opening_amount_cash_ars || 0);
  const sessionSales = sales.filter((sale) => Number(sale.cash_session_id || 0) === Number(session?.id || 0));
  const cashTotal = sessionSales
    .filter((sale) => sale.payment_method === 'cash')
    .reduce((acc, sale) => acc + Number(sale.total_ars || 0), 0);
  const nonCashTotal = sessionSales
    .filter((sale) => sale.payment_method !== 'cash')
    .reduce((acc, sale) => acc + Number(sale.total_ars || 0), 0);
  return {
    opening_amount_cash_ars: opening,
    expected_total_ars: round2(opening + cashTotal),
    net_non_cash_ars: round2(nonCashTotal),
    rows: [
      { label: 'Apertura', amount_ars: opening },
      { label: 'Ventas efectivo', amount_ars: round2(cashTotal) },
      { label: 'Ventas no efectivo', amount_ars: round2(nonCashTotal) },
    ],
  };
}

function decorateCashSession(state, session) {
  if (!session) return null;
  return { ...session, summary: cashSummary(session, state.sales || []) };
}

function variantById(state, id) {
  return state.variants.find((row) => Number(row.id) === Number(id));
}

function findVariantByCode(state, code) {
  const term = lower(code);
  return state.variants.find((row) => {
    const codes = [
      row.sku,
      row.barcode_internal,
      row.plu,
      ...(row.barcodes || []).map((barcode) => barcode.barcode),
    ];
    return codes.some((item) => lower(item) === term);
  });
}

function listVariants(state, params = {}) {
  const q = lower(params.get('q'));
  const productId = Number(params.get('product_id') || 0);
  const activeParam = params.get('active');
  const limit = Number(params.get('limit') || 0);
  let rows = state.variants || [];
  if (activeParam !== null) {
    const wantActive = parseBool(activeParam, true);
    rows = rows.filter((row) => (row.active !== false) === wantActive);
  }
  if (productId) rows = rows.filter((row) => Number(row.product_id) === productId);
  if (q) {
    rows = rows.filter((row) => lower(`${row.producto} ${row.display_name} ${row.sku} ${row.barcode_internal} ${row.option_signature}`).includes(q));
  }
  rows = rows.map((row) => ({ ...row, precio_local: Number(row.price_store_ars || 0), stock_available: Math.max(0, Number(row.stock_on_hand || 0) - Number(row.stock_reserved || 0)) }));
  return limit > 0 ? rows.slice(0, limit) : rows;
}

function listProducts(state, params = {}) {
  const q = lower(params.get('q'));
  const activeParam = params.get('active');
  const limit = Number(params.get('limit') || 0);
  let rows = state.products || [];
  if (activeParam !== null) {
    const wantActive = parseBool(activeParam, true);
    rows = rows.filter((row) => (row.active !== false) === wantActive);
  }
  if (q) rows = rows.filter((row) => lower(`${row.name} ${row.sku_prefix} ${row.brand} ${row.subcategory}`).includes(q));
  const decorated = rows.map((row) => ({
    ...row,
    variantes: (state.variants || []).filter((variant) =>
      Number(variant.product_id) === Number(row.id) && variant.active !== false
    ).length,
  }));
  return limit > 0 ? decorated.slice(0, limit) : decorated;
}

function quoteSale(state, payload = {}) {
  const paymentAccount = (state.paymentAccounts || []).find((row) => row.code === payload.payment_account_code);
  const paymentModifierPct = Number(paymentAccount?.price_modifier_pct || 0);
  const items = (payload.items || []).map((item, index) => {
    const variant = variantById(state, item.variant_id);
    if (!variant) throw makeError(404, 'Producto no encontrado');
    const quantity = Math.max(0.001, Number(item.quantity || 1));
    const unitBase = item.unit_price_override_ars != null ? Number(item.unit_price_override_ars) : Number(variant.price_store_ars || 0);
    const subtotal = round2(unitBase * quantity);
    return {
      line_key: `L${index + 1}`,
      variant_id: variant.id,
      product_id: variant.product_id,
      sku: variant.sku,
      producto: variant.producto,
      option_signature: variant.option_signature,
      quantity,
      unit_price_ars: unitBase,
      unit_price_final_ars: unitBase,
      subtotal_ars: subtotal,
      discount_ars: 0,
      total_ars: subtotal,
    };
  });
  const subtotal = round2(items.reduce((acc, item) => acc + Number(item.subtotal_ars || 0), 0));
  const discountPct = activePromoPct(state, payload);
  const discounts = round2(subtotal * (discountPct / 100));
  const subtotalAfterPromos = round2(subtotal - discounts);
  const modifier = round2(subtotalAfterPromos * (paymentModifierPct / 100));
  const total = round2(subtotalAfterPromos + modifier);
  return {
    channel: payload.channel || 'local',
    items,
    subtotal_ars: subtotal,
    promotion_discount_total_ars: discounts,
    discounts_ars: discounts,
    subtotal_after_promotions_ars: subtotalAfterPromos,
    payment_modifier_pct: paymentModifierPct,
    payment_modifier_ars: modifier,
    total_ars: total,
    total_due_ars: total,
    invoice_arca_account_id: state.arcaAccounts?.[0]?.id || null,
    invoice_default: {
      arca_account_id: state.arcaAccounts?.[0]?.id || null,
      label: state.arcaAccounts?.[0]?.label || 'Demo ARCA',
    },
  };
}

function activePromoPct(state, payload = {}) {
  const coupons = new Set((payload.coupon_codes || []).map((code) => lower(code)));
  const promo = (state.promotions || []).find((row) => {
    if (row.active === false) return false;
    if (row.promo_type !== 'percent_off') return false;
    if (row.activation_mode === 'coupon') return coupons.has(lower(row.coupon_code));
    return row.applies_to_all_products !== false;
  });
  return Number(promo?.discount_pct || 0);
}

function saleFromQuote(state, quote, payload = {}) {
  const id = nextId(state, 'sale');
  const account = (state.paymentAccounts || []).find((row) => row.code === payload.payment_account_code) || {};
  const arca = state.arcaAccounts?.[0] || {};
  const sale = {
    id,
    sale_number: `V-${String(id).padStart(6, '0')}`,
    created_at: nowIso(),
    channel: payload.channel || 'local',
    status: 'confirmed',
    payment_method: payload.payment_method || 'cash',
    payment_account_code: payload.payment_account_code || account.code || 'cash',
    payment_account_label: account.label || payload.payment_account_code || 'Caja',
    total_ars: quote.total_ars,
    subtotal_ars: quote.subtotal_ars,
    subtotal_after_promotions_ars: quote.subtotal_after_promotions_ars,
    promotion_discount_total_ars: quote.promotion_discount_total_ars,
    customer_name: payload.customer_name || 'Consumidor final',
    customer_doc: payload.customer_doc || '',
    notes: payload.notes || '',
    invoice_status: 'pending',
    arca_account_label: arca.label || 'Demo ARCA',
    arca_account_code: arca.code || 'demo',
    issuer_cuit: arca.cuit || '30-00000000-0',
    cash_session_id: state.cashSession?.open ? state.cashSession.id : null,
    items: quote.items.map((item, idx) => ({
      id: id * 100 + idx + 1,
      sale_item_id: id * 100 + idx + 1,
      variant_id: item.variant_id,
      product_id: item.product_id,
      sku: item.sku,
      producto: item.producto,
      option_signature: item.option_signature,
      quantity: item.quantity,
      returned_qty: 0,
      unit_price_ars: item.unit_price_ars,
      unit_price_final_ars: item.unit_price_final_ars,
      subtotal_ars: item.subtotal_ars,
      total_ars: item.total_ars,
    })),
    promotions: quote.promotion_discount_total_ars > 0 ? [{ name: 'Promo demo', discount_ars: quote.promotion_discount_total_ars }] : [],
    returns: [],
    exchanges: [],
    warranty: {
      size: { active: true, until: daysAgoIso(-30) },
      breakage: { active: true, until: daysAgoIso(-7) },
    },
  };
  sale.items.forEach((item) => {
    const variant = variantById(state, item.variant_id);
    if (variant) {
      variant.stock_on_hand = round2(Number(variant.stock_on_hand || 0) - Number(item.quantity || 0));
    }
  });
  state.sales.unshift(sale);
  return sale;
}

function initialSales(state) {
  const sale1 = saleFromQuote(
    state,
    quoteSale(state, {
      payment_method: 'cash',
      payment_account_code: 'cash',
      items: [
        { variant_id: 101, quantity: 2 },
        { variant_id: 201, quantity: 1 },
      ],
    }),
    { payment_method: 'cash', payment_account_code: 'cash', customer_name: 'Consumidor final' },
  );
  sale1.created_at = daysAgoIso(1) + 'T15:42:00.000Z';
  const sale2 = saleFromQuote(
    state,
    quoteSale(state, {
      payment_method: 'transfer',
      payment_account_code: 'transfer_1',
      items: [
        { variant_id: 301, quantity: 1 },
        { variant_id: 401, quantity: 2 },
        { variant_id: 502, quantity: 3 },
      ],
    }),
    { payment_method: 'transfer', payment_account_code: 'transfer_1', customer_name: 'Cliente Demo', customer_doc: '30111222' },
  );
  sale2.created_at = daysAgoIso(3) + 'T18:10:00.000Z';
}

function initialState() {
  const state = {
    version: DEMO_VERSION,
    sessionActive: true,
    nextIds: {
      product: 7,
      variant: 700,
      supplier: 4,
      sale: 1001,
      draft: 1,
      purchaseOrder: 1,
      purchase: 1,
      count: 1,
      transfer: 1,
      waste: 1,
      promotion: 3,
      alert: 3,
      risk: 3,
      user: 10,
      barcode: 7000,
    },
    users: [
      { id: 1, email: 'demo@supercheck.local', nombre: 'Demo Librería', rol: 'admin', activo: true },
      { id: 2, email: 'caja@supercheck.local', nombre: 'Caja Librería', rol: 'cajero', activo: true },
      { id: 3, email: 'deposito@supercheck.local', nombre: 'Stock Librería', rol: 'repositor', activo: true },
    ],
    products: baseProducts(),
    variants: baseVariants(),
    suppliers: baseSuppliers(),
    attributes: [
      { id: 1, name: 'Presentacion', code: 'presentacion', sort_order: 10, active: true },
    ],
    attributeValues: [
      { id: 1, attribute_id: 1, attribute_code: 'presentacion', value: 'A4 80 hojas rayado', active: true },
      { id: 2, attribute_id: 1, attribute_code: 'presentacion', value: 'A4 80 hojas cuadriculado', active: true },
      { id: 3, attribute_id: 1, attribute_code: 'presentacion', value: 'A5 60 hojas rayado', active: true },
      { id: 4, attribute_id: 1, attribute_code: 'presentacion', value: 'Pack 5 A4 rayado', active: true },
      { id: 5, attribute_id: 1, attribute_code: 'presentacion', value: 'Azul 0.7mm', active: true },
      { id: 6, attribute_id: 1, attribute_code: 'presentacion', value: 'Negra 0.7mm', active: true },
      { id: 7, attribute_id: 1, attribute_code: 'presentacion', value: 'Pack 10 azul', active: true },
      { id: 8, attribute_id: 1, attribute_code: 'presentacion', value: '75g 500 hojas', active: true },
      { id: 9, attribute_id: 1, attribute_code: 'presentacion', value: 'Caja 5 resmas', active: true },
      { id: 10, attribute_id: 1, attribute_code: 'presentacion', value: 'El Principito - tapa blanda', active: true },
      { id: 11, attribute_id: 1, attribute_code: 'presentacion', value: 'Cuentos de la selva', active: true },
      { id: 12, attribute_id: 1, attribute_code: 'presentacion', value: 'Antologia secundaria', active: true },
      { id: 13, attribute_id: 1, attribute_code: 'presentacion', value: 'Marcadores fibra x12', active: true },
      { id: 14, attribute_id: 1, attribute_code: 'presentacion', value: 'Resaltador amarillo', active: true },
      { id: 15, attribute_id: 1, attribute_code: 'presentacion', value: 'Set resaltadores x4', active: true },
      { id: 16, attribute_id: 1, attribute_code: 'presentacion', value: 'Mochila 18L', active: true },
      { id: 17, attribute_id: 1, attribute_code: 'presentacion', value: 'Cartuchera 2 cierres', active: true },
    ],
    paymentAccounts: basePaymentAccounts(),
    arcaAccounts: [
      { id: 1, code: 'demo', label: 'Demo ARCA mock', cuit: '30-00000000-0', env: 'homolog', active: true, is_default: true },
    ],
    settings: {
      business_name: 'SuperCheck Librería',
      legal_name: 'SuperCheck Librería',
      cuit: '30-00000000-0',
      address: 'Sucursal librería demo',
      phone: '',
      email: '',
      arca_mock_enabled: true,
      tiendanube_enabled: false,
    },
    pageSettings: {
      app_name: 'SuperCheck Librería',
      app_tagline: 'Demo de librería sin backend',
      footer_legal_name: 'SuperCheck Librería',
      sidebar_section_title: 'Demo',
      default_route: '/guia',
      nav_labels: {},
      page_titles: {},
    },
    cashSession: {
      id: 1,
      open: true,
      opened_at: nowIso(),
      opened_by_name: 'Demo Admin',
      opening_amount_cash_ars: 35000,
    },
    cashHistory: [],
    sales: [],
    drafts: [],
    purchaseOrders: [],
    purchases: [],
    inventoryCounts: [],
    stockTransfers: [],
    wasteEvents: [],
    promotions: [
      { id: 1, name: '10% efectivo demo', promo_type: 'percent_off', active: true, channel_scope: 'local', activation_mode: 'automatic', coupon_code: '', priority: 10, combinable: true, discount_pct: 10, applies_to_all_products: true, product_ids: [], variant_ids: [] },
      { id: 2, name: 'Cupon BIENVENIDO', promo_type: 'percent_off', active: true, channel_scope: 'both', activation_mode: 'coupon', coupon_code: 'BIENVENIDO', priority: 20, combinable: true, discount_pct: 15, applies_to_all_products: true, product_ids: [], variant_ids: [] },
    ],
    alerts: [
      { id: 1, title: 'Stock bajo en mochilas', severity: 'high', status: 'open', action_required: 'Reponer o generar compra', detail: 'Quedan pocas unidades antes de temporada escolar.' },
      { id: 2, title: 'Caja demo abierta', severity: 'medium', status: 'open', action_required: 'Cerrar al finalizar el recorrido', detail: 'Ejemplo para mostrar controles diarios.' },
    ],
    riskEvents: [
      { id: 1, title: 'Anulacion de item con autorizacion', detail: 'Evento demo generado para auditoria POS.', severity: 'medium', source: 'pos', status: 'open', created_at: nowIso() },
      { id: 2, title: 'Diferencia de stock', detail: 'Controlar conteo de cuadernos y resmas.', severity: 'low', source: 'inventario', status: 'open', created_at: nowIso() },
    ],
    fulfillmentOrders: [
      { id: 1, fulfillment_order_id: 'TN-1001', status: 'pending', customer_name: 'Cliente online demo', total_ars: 26300, created_at: nowIso(), items_count: 4 },
    ],
    storeCredits: [
      { id: 1, customer_doc: '30111222', balance_ars: 2500, status: 'active', expires_at: daysAgoIso(-60), reason: 'Devolucion demo' },
    ],
  };
  initialSales(state);
  state.inventoryCounts = [buildInventoryCount(state, { scope: 'low_stock', reason: 'Conteo demo inicial' }, false)];
  return state;
}

function loadState() {
  maybeResetDemoState();
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === DEMO_VERSION) {
        if (!parsed.sessionActive) {
          parsed.sessionActive = true;
          saveState(parsed);
        }
        return parsed;
      }
    }
  } catch {
    // Si localStorage falla, se reinicia el demo.
  }
  const state = initialState();
  saveState(state);
  return state;
}

function saveState(state) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // La demo sigue funcionando durante la sesion aunque no pueda persistir.
  }
}

function currentUser(state) {
  return state.users.find((user) => user.id === 1);
}

function buildInventoryCount(state, payload = {}, saveIds = true) {
  const id = saveIds ? nextId(state, 'count') : 1;
  const variants = payload.scope === 'custom' && Array.isArray(payload.variant_ids)
    ? state.variants.filter((row) => payload.variant_ids.map(Number).includes(Number(row.id)))
    : state.variants.filter((row) => row.active !== false && (payload.scope !== 'low_stock' || Number(row.stock_on_hand || 0) <= Number(row.stock_min || 0)));
  const items = variants.map((variant, idx) => ({
    id: id * 1000 + idx + 1,
    variant_id: variant.id,
    sku: variant.sku,
    producto: variant.producto,
    option_signature: variant.option_signature,
    expected_qty: Math.max(0, Math.round(Number(variant.stock_on_hand || 0))),
    counted_qty: Math.max(0, Math.round(Number(variant.stock_on_hand || 0))),
    adjustment_reason: '',
  }));
  return {
    id,
    code: `INV-${String(id).padStart(4, '0')}`,
    scope: payload.scope || 'low_stock',
    reason: payload.reason || 'Conteo demo',
    status: 'in_progress',
    created_by_name: 'Demo Admin',
    started_at: nowIso(),
    closed_at: null,
    items,
    items_total: items.length,
    items_counted: items.length,
    items_with_diff: 0,
  };
}

function closeInventoryCount(state, id, payload = {}) {
  const count = state.inventoryCounts.find((row) => Number(row.id) === Number(id));
  if (!count) throw makeError(404, 'Conteo no encontrado');
  const itemRows = Array.isArray(payload.items) ? payload.items : [];
  let diffUnits = 0;
  let adjustedItems = 0;
  count.items = count.items.map((item) => {
    const edit = itemRows.find((row) => Number(row.count_item_id) === Number(item.id));
    if (!edit) return item;
    const counted = Math.max(0, Number(edit.counted_qty || 0));
    const diff = counted - Number(item.expected_qty || 0);
    if (diff !== 0) {
      diffUnits += diff;
      adjustedItems += 1;
      if (payload.apply_adjustments !== false) {
        const variant = variantById(state, item.variant_id);
        if (variant) variant.stock_on_hand = counted;
      }
    }
    return { ...item, counted_qty: counted, adjustment_reason: edit.adjustment_reason || item.adjustment_reason || '' };
  });
  count.status = 'closed';
  count.closed_at = nowIso();
  count.items_counted = count.items.length;
  count.items_with_diff = adjustedItems;
  count.close_summary = {
    adjusted_items: adjustedItems,
    diff_units_total: diffUnits,
    incidents_created: payload.create_incidents === false ? 0 : adjustedItems,
  };
  return count;
}

function replenishmentRows(state, limit = 25) {
  return (state.variants || [])
    .filter((row) => row.active !== false)
    .map((row) => {
      const stock = Number(row.stock_on_hand || 0);
      const min = Number(row.stock_min || 0);
      const target = Number(row.stock_max || min * 3 || 20);
      return {
        variant_id: row.id,
        producto: row.producto,
        option_signature: row.option_signature,
        sku: row.sku,
        stock_on_hand: stock,
        available_to_sell: Math.max(0, stock - Number(row.stock_reserved || 0)),
        stock_min: min,
        target_stock: target,
        target_units: target,
        suggested_qty: Math.max(0, Math.ceil(target - stock)),
        est_days_to_break: stock <= 0 ? 0 : round2(stock / 2.5),
        severity: stock <= min ? 'high' : 'low',
        supplier_id: row.supplier_id,
        supplier_name: row.supplier_name,
      };
    })
    .filter((row) => row.suggested_qty > 0)
    .slice(0, limit);
}

function createProduct(state, payload = {}) {
  const id = nextId(state, 'product');
  const row = {
    id,
    name: normalizeText(payload.name) || `Producto demo ${id}`,
    sku_prefix: normalizeText(payload.sku_prefix) || `P${id}`,
    brand: normalizeText(payload.brand),
    subcategory: normalizeText(payload.subcategory),
    unit_of_measure: payload.unit_of_measure || 'unidad',
    iva_rate_pct: Number(payload.iva_rate_pct || 21),
    usual_supplier_id: payload.usual_supplier_id ? Number(payload.usual_supplier_id) : null,
    default_price_online_ars: Number(payload.default_price_online_ars || 0),
    default_cost_ars: Number(payload.default_cost_ars || 0),
    active: payload.active !== false,
  };
  state.products.push(row);
  return row;
}

function patchProduct(state, id, payload = {}) {
  const row = state.products.find((item) => Number(item.id) === Number(id));
  if (!row) throw makeError(404, 'Producto no encontrado');
  Object.assign(row, {
    ...payload,
    usual_supplier_id: payload.usual_supplier_id === '' ? null : payload.usual_supplier_id ?? row.usual_supplier_id,
  });
  state.variants.forEach((variant) => {
    if (Number(variant.product_id) === Number(id)) {
      variant.producto = row.name;
      variant.product_name = row.name;
    }
  });
  return row;
}

function createVariant(state, payload = {}) {
  const product = state.products.find((row) => Number(row.id) === Number(payload.product_id));
  if (!product) throw makeError(404, 'Producto no encontrado');
  const id = nextId(state, 'variant');
  const supplier = state.suppliers.find((row) => Number(row.id) === Number(payload.supplier_id || product.usual_supplier_id));
  const optionSignature = (payload.option_rows || []).map((row) => row.value).filter(Boolean).join(' / ');
  const row = makeVariant({
    id,
    product_id: product.id,
    producto: product.name,
    product_name: product.name,
    display_name: normalizeText(payload.display_name) || `${product.name} ${optionSignature}`.trim(),
    option_signature: optionSignature || normalizeText(payload.option_signature),
    sku: normalizeText(payload.sku) || `${product.sku_prefix}-${id}`,
    barcode_internal: normalizeText(payload.barcode_internal) || `200000${id}`,
    price_store_ars: Number(payload.price_store_ars || product.default_price_online_ars || 0),
    price_online_ars: Number(payload.price_online_ars || payload.price_store_ars || product.default_price_online_ars || 0),
    cost_avg_ars: Number(payload.cost_avg_ars || product.default_cost_ars || 0),
    stock_on_hand: Number(payload.stock_on_hand || 0),
    stock_min: Number(payload.stock_min || 0),
    stock_max: Number(payload.stock_max || 0),
    unit_of_measure: payload.unit_of_measure || product.unit_of_measure || 'unidad',
    is_weighted: !!payload.is_weighted,
    plu: payload.plu || '',
    supplier_id: supplier?.id || null,
    supplier_name: supplier?.name || '',
    option_rows: payload.option_rows || [],
    active: payload.active !== false,
  });
  state.variants.push(row);
  return row;
}

function patchVariant(state, id, payload = {}) {
  const row = variantById(state, id);
  if (!row) throw makeError(404, 'Variante no encontrada');
  const supplier = state.suppliers.find((item) => Number(item.id) === Number(payload.supplier_id));
  Object.assign(row, payload);
  if (payload.price_store_ars !== undefined) row.precio_local = Number(payload.price_store_ars || 0);
  if (payload.stock_on_hand !== undefined) row.stock_available = Math.max(0, Number(payload.stock_on_hand || 0) - Number(row.stock_reserved || 0));
  if (supplier) {
    row.supplier_id = supplier.id;
    row.supplier_name = supplier.name;
  }
  return row;
}

function createPurchaseOrder(state, payload = {}) {
  const id = nextId(state, 'purchaseOrder');
  const supplier = state.suppliers.find((row) => Number(row.id) === Number(payload.supplier_id));
  const items = (payload.items || []).map((item, idx) => {
    const variant = variantById(state, item.variant_id);
    return {
      id: id * 100 + idx + 1,
      variant_id: item.variant_id,
      sku: variant?.sku || '',
      producto: variant?.producto || '',
      quantity: Number(item.quantity || item.qty || 1),
      unit_cost_ars: Number(item.unit_cost_ars || variant?.cost_avg_ars || 0),
    };
  });
  const row = {
    id,
    code: `OC-${String(id).padStart(4, '0')}`,
    status: 'open',
    supplier_id: supplier?.id || payload.supplier_id || null,
    supplier_name: supplier?.name || 'Proveedor demo',
    created_at: nowIso(),
    expected_at: payload.expected_at || '',
    notes: payload.notes || '',
    items,
    total_ars: round2(items.reduce((acc, item) => acc + item.quantity * item.unit_cost_ars, 0)),
  };
  state.purchaseOrders.unshift(row);
  return row;
}

function receivePurchaseOrder(state, id) {
  const row = state.purchaseOrders.find((item) => Number(item.id) === Number(id));
  if (!row) throw makeError(404, 'Orden no encontrada');
  row.status = 'received';
  row.received_at = nowIso();
  row.items.forEach((item) => {
    const variant = variantById(state, item.variant_id);
    if (variant) variant.stock_on_hand = round2(Number(variant.stock_on_hand || 0) + Number(item.quantity || 0));
  });
  return { ok: true, order: row };
}

function createPurchase(state, payload = {}) {
  const id = nextId(state, 'purchase');
  const items = (payload.items || []).map((item, idx) => {
    const variant = variantById(state, item.variant_id);
    const quantity = Number(item.quantity || item.qty || 1);
    const cost = Number(item.unit_cost_ars || item.cost_ars || variant?.cost_avg_ars || 0);
    if (variant) {
      variant.stock_on_hand = round2(Number(variant.stock_on_hand || 0) + quantity);
      if (cost > 0) variant.cost_avg_ars = cost;
    }
    return {
      id: id * 100 + idx + 1,
      variant_id: item.variant_id,
      sku: variant?.sku || '',
      producto: variant?.producto || '',
      quantity,
      unit_cost_ars: cost,
    };
  });
  const row = { id, code: `COMP-${String(id).padStart(4, '0')}`, created_at: nowIso(), items, total_ars: round2(items.reduce((acc, item) => acc + item.quantity * item.unit_cost_ars, 0)) };
  state.purchases.unshift(row);
  return row;
}

function saleList(state, params = {}) {
  const q = lower(params.get('q'));
  const status = lower(params.get('status'));
  const channel = lower(params.get('channel'));
  const payment = lower(params.get('payment_method'));
  const limit = Number(params.get('limit') || 50);
  const offset = Number(params.get('offset') || 0);
  let rows = state.sales || [];
  if (q) rows = rows.filter((row) => lower(`${row.sale_number} ${row.customer_name} ${row.customer_doc}`).includes(q));
  if (status) rows = rows.filter((row) => lower(row.status) === status);
  if (channel) rows = rows.filter((row) => lower(row.channel) === channel);
  if (payment) rows = rows.filter((row) => lower(row.payment_method) === payment);
  return {
    rows: rows.slice(offset, offset + limit),
    paging: { limit, offset, total: rows.length },
  };
}

function issueInvoice(state, id) {
  const sale = state.sales.find((row) => Number(row.id) === Number(id));
  if (!sale) throw makeError(404, 'Venta no encontrada');
  sale.invoice_status = 'issued';
  sale.invoice = {
    status: 'issued',
    cae: `70${String(sale.id).padStart(12, '0')}`,
    cbte_nro: sale.id,
    issued_at: nowIso(),
    mock: true,
  };
  return sale;
}

function cancelSale(state, id, payload = {}) {
  const sale = state.sales.find((row) => Number(row.id) === Number(id));
  if (!sale) throw makeError(404, 'Venta no encontrada');
  sale.status = 'cancelled';
  sale.cancel_reason = payload.reason || 'Anulacion demo';
  return sale;
}

function returnSale(state, id, payload = {}) {
  const sale = state.sales.find((row) => Number(row.id) === Number(id));
  if (!sale) throw makeError(404, 'Venta no encontrada');
  const targetItems = Array.isArray(payload.items) && payload.items.length
    ? payload.items
    : sale.items.map((item) => ({ sale_item_id: item.id, quantity: item.quantity }));
  let refund = 0;
  targetItems.forEach((item) => {
    const saleItem = sale.items.find((row) => Number(row.id) === Number(item.sale_item_id));
    if (!saleItem) return;
    const qty = Math.min(Number(item.quantity || 0), Number(saleItem.quantity || 0) - Number(saleItem.returned_qty || 0));
    saleItem.returned_qty = round2(Number(saleItem.returned_qty || 0) + qty);
    refund += qty * Number(saleItem.unit_price_final_ars || 0);
  });
  sale.status = sale.items.every((item) => Number(item.returned_qty || 0) >= Number(item.quantity || 0)) ? 'returned' : 'partial_return';
  const ret = { return_id: nextId(state, 'sale'), sale_id: sale.id, day: todayIso(), total_refund_ars: round2(refund), reason: payload.reason || 'Devolucion demo' };
  sale.returns.push(ret);
  return { sale, returns: [ret], total_refund_ars: ret.total_refund_ars };
}

function exchangeSale(state, id, payload = {}) {
  const sale = state.sales.find((row) => Number(row.id) === Number(id));
  if (!sale) throw makeError(404, 'Venta no encontrada');
  const ex = {
    id: nextId(state, 'sale'),
    created_at: nowIso(),
    reason: payload.reason || 'Cambio demo',
    items: (payload.items || []).map((item) => ({ ...item })),
  };
  sale.exchanges.push(ex);
  return { sale, exchanges: [ex] };
}

function reportsSummary(state) {
  const sales = state.sales.filter((row) => row.status !== 'cancelled');
  const total = round2(sales.reduce((acc, row) => acc + Number(row.total_ars || 0), 0));
  const cost = round2(sales.flatMap((sale) => sale.items || []).reduce((acc, item) => {
    const variant = variantById(state, item.variant_id);
    return acc + Number(item.quantity || 0) * Number(variant?.cost_avg_ars || 0);
  }, 0));
  const units = round2(sales.flatMap((sale) => sale.items || []).reduce((acc, item) => acc + Number(item.quantity || 0), 0));
  return {
    summary: {
      ventas_brutas_ars: total,
      descuentos_ars: round2(sales.reduce((acc, row) => acc + Number(row.promotion_discount_total_ars || 0), 0)),
      ventas_netas_ars: total,
      margen_bruto_ars: round2(total - cost),
      tickets: sales.length,
      unidades: units,
      ticket_promedio_ars: sales.length ? round2(total / sales.length) : 0,
    },
  };
}

function reportProducts(state) {
  const map = new Map();
  state.sales.filter((sale) => sale.status !== 'cancelled').forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const variant = variantById(state, item.variant_id);
      const current = map.get(item.variant_id) || {
        variant_id: item.variant_id,
        producto: item.producto,
        option_signature: item.option_signature,
        sku: item.sku,
        unidades: 0,
        ventas_netas_ars: 0,
        costo_ars: 0,
      };
      current.unidades += Number(item.quantity || 0);
      current.ventas_netas_ars += Number(item.total_ars || item.subtotal_ars || 0);
      current.costo_ars += Number(item.quantity || 0) * Number(variant?.cost_avg_ars || 0);
      map.set(item.variant_id, current);
    });
  });
  return {
    rows: Array.from(map.values()).map((row) => {
      const margen = round2(row.ventas_netas_ars - row.costo_ars);
      return {
        ...row,
        ventas_netas_ars: round2(row.ventas_netas_ars),
        costo_ars: round2(row.costo_ars),
        margen_ars: margen,
        margen_pct: row.ventas_netas_ars ? round2((margen / row.ventas_netas_ars) * 100) : 0,
        rotacion_idx: round2(row.unidades / 30),
        labels: margen > 2000 ? ['mas_ganancia'] : ['rotador'],
      };
    }),
  };
}

function reportSuppliers(state) {
  return {
    rows: state.suppliers.map((supplier, idx) => {
      const variants = state.variants.filter((variant) => Number(variant.supplier_id) === Number(supplier.id));
      const costo = variants.reduce((acc, variant) => acc + Number(variant.cost_avg_ars || 0) * Number(variant.stock_on_hand || 0), 0);
      return {
        supplier_id: supplier.id,
        proveedor: supplier.name,
        variantes: variants.length,
        ganancia_potencial_ars: round2(variants.reduce((acc, variant) => acc + (Number(variant.price_store_ars || 0) - Number(variant.cost_avg_ars || 0)) * Number(variant.stock_on_hand || 0), 0)),
        margen_promedio_pct: 34 + idx * 3,
        margen_ponderado_pct: 31 + idx * 2,
        consistencia_stddev_pct: 7 + idx,
        dependencia_pct_costo: 20 + idx * 8,
        costo_total_ars: round2(costo),
        conviene_trabajar_mas: idx < 2,
        rank: idx + 1,
      };
    }),
  };
}

function lowStockRows(state) {
  return state.variants
    .filter((row) => Number(row.stock_on_hand || 0) <= Number(row.stock_min || 0))
    .map((row) => ({ id: row.id, producto: row.producto, sku: row.sku, stock_on_hand: row.stock_on_hand, stock_min: row.stock_min }));
}

function dashboard(state) {
  const today = todayIso();
  const salesToday = state.sales.filter((sale) => String(sale.created_at || '').slice(0, 10) === today && sale.status !== 'cancelled');
  const total = round2(salesToday.reduce((acc, sale) => acc + Number(sale.total_ars || 0), 0));
  return {
    kpis: {
      sales_count: salesToday.length,
      sales_total_ars: total,
      margin_ars: round2(total * 0.32),
      cash_difference_total_ars: 0,
    },
    sales_by_hour: [9, 10, 11, 12, 17, 18].map((hour, idx) => ({
      hour_slot: hour,
      sales_count: idx + 1,
      total_ars: round2((idx + 1) * 3500),
      margin_ars: round2((idx + 1) * 1100),
    })),
  };
}

function routeDemo(state, method, pathname, params, payload) {
  if (pathname === '/api/ping/') return { ok: true, demo: true };
  if (pathname === '/api/auth/csrf/') return { ok: true, csrfToken: 'demo' };
  if (pathname === '/api/auth/session/') {
    if (!state.sessionActive) {
      state.sessionActive = true;
      saveState(state);
    }
    return { user: currentUser(state), features: { demo: true } };
  }
  if (pathname === '/api/auth/login/') {
    state.sessionActive = true;
    saveState(state);
    return { user: currentUser(state), features: { demo: true } };
  }
  if (pathname === '/api/auth/logout/') {
    state.sessionActive = true;
    saveState(state);
    return { ok: true };
  }
  if (pathname === '/api/auth/forgot/' || pathname === '/api/auth/reset/') return { ok: true, demo: true };
  if (pathname === '/api/system/update/status/' || pathname === '/api/system/update/check/') return { pending: false, demo: true, last_error: '' };
  if (pathname === '/api/system/update/restart/') return { ok: false, scheduled: false, last_error: 'No aplica en demo web.' };

  if (pathname === '/api/usuarios/' && method === 'GET') return state.users;
  if (pathname === '/api/usuarios/' && method === 'POST') {
    const row = { id: nextId(state, 'user'), email: payload.email || `usuario${Date.now()}@demo.local`, nombre: payload.nombre || payload.name || 'Usuario demo', rol: payload.rol || 'cajero', activo: true };
    state.users.push(row);
    saveState(state);
    return row;
  }
  let match = pathname.match(/^\/api\/usuarios\/(\d+)\/activar\/$/);
  if (match) {
    const row = state.users.find((user) => Number(user.id) === Number(match[1]));
    if (row) row.activo = payload.activo !== false;
    saveState(state);
    return row || { ok: true };
  }
  match = pathname.match(/^\/api\/usuarios\/(\d+)\/roleperm\/$/);
  if (match) {
    const row = state.users.find((user) => Number(user.id) === Number(match[1]));
    if (row && payload.rol) row.rol = payload.rol;
    saveState(state);
    return row || { ok: true };
  }
  match = pathname.match(/^\/api\/usuarios\/(\d+)\/reset-pass\/$/);
  if (match) return { ok: true, password: 'Demo1234!' };
  match = pathname.match(/^\/api\/usuarios\/(\d+)\/supervisor-code\/$/);
  if (match) return { ok: true, code: '980000123456' };
  match = pathname.match(/^\/api\/usuarios\/(\d+)\/permisos\/$/);
  if (match && method === 'GET') return { user_id: Number(match[1]), overrides: {} };
  if (match && method === 'PUT') return { user_id: Number(match[1]), overrides: payload.overrides || {} };
  match = pathname.match(/^\/api\/usuarios\/(\d+)\/permisos\/reset\/$/);
  if (match) return { user_id: Number(match[1]), overrides: {} };
  match = pathname.match(/^\/api\/usuarios\/(\d+)\/$/);
  if (match && method === 'DELETE') {
    state.users = state.users.filter((user) => Number(user.id) !== Number(match[1]));
    saveState(state);
    return { ok: true };
  }
  if (pathname === '/api/permisos/catalogo/') return { rows: [] };

  if (pathname === '/api/retail/productos/') {
    if (method === 'GET') return listProducts(state, params);
    if (method === 'POST') {
      const row = createProduct(state, payload);
      saveState(state);
      return row;
    }
  }
  match = pathname.match(/^\/api\/retail\/productos\/(\d+)\/$/);
  if (match) {
    const row = patchProduct(state, match[1], payload);
    saveState(state);
    return row;
  }
  if (pathname === '/api/retail/productos/ajuste-precios/') {
    const pct = Number(payload.percentage || 0);
    const rows = state.variants.map((variant) => ({
      variant_id: variant.id,
      sku: variant.sku,
      old_price_ars: variant.price_store_ars,
      new_price_ars: round2(Number(variant.price_store_ars || 0) * (1 + pct / 100)),
    }));
    if (payload.mode === 'apply') {
      rows.forEach((row) => {
        const variant = variantById(state, row.variant_id);
        if (variant) variant.price_store_ars = row.new_price_ars;
      });
      saveState(state);
    }
    return { count: rows.length, rows, total_old_ars: round2(rows.reduce((acc, row) => acc + row.old_price_ars, 0)), total_new_ars: round2(rows.reduce((acc, row) => acc + row.new_price_ars, 0)) };
  }

  if (pathname === '/api/retail/variantes/') {
    if (method === 'GET') return listVariants(state, params);
    if (method === 'POST') {
      const row = createVariant(state, payload);
      saveState(state);
      return row;
    }
  }
  match = pathname.match(/^\/api\/retail\/variantes\/escanear\/(.+)\/$/);
  if (match) {
    const row = findVariantByCode(state, decodeURIComponent(match[1]));
    if (!row || row.active === false) throw makeError(404, 'Codigo no encontrado');
    return row;
  }
  match = pathname.match(/^\/api\/retail\/variantes\/(\d+)\/barcodes\/$/);
  if (match) {
    const variant = variantById(state, match[1]);
    if (!variant) throw makeError(404, 'Variante no encontrada');
    return { variant, barcodes: variant.barcodes || [] };
  }
  match = pathname.match(/^\/api\/retail\/variantes\/(\d+)\/barcodes\/generate\/$/);
  if (match) {
    const variant = variantById(state, match[1]);
    if (!variant) throw makeError(404, 'Variante no encontrada');
    const barcode = { id: nextId(state, 'barcode'), barcode: `779000${variant.id}${Date.now().toString().slice(-3)}`, is_primary: !(variant.barcodes || []).length };
    variant.barcodes = [...(variant.barcodes || []), barcode];
    if (barcode.is_primary) variant.barcode_internal = barcode.barcode;
    saveState(state);
    return { variant, barcodes: variant.barcodes };
  }
  match = pathname.match(/^\/api\/retail\/variantes\/(\d+)\/barcodes\/associate\/$/);
  if (match) {
    const variant = variantById(state, match[1]);
    if (!variant) throw makeError(404, 'Variante no encontrada');
    const barcode = { id: nextId(state, 'barcode'), barcode: payload.barcode || payload.code || `779${Date.now()}`, is_primary: !(variant.barcodes || []).length };
    variant.barcodes = [...(variant.barcodes || []), barcode];
    if (barcode.is_primary) variant.barcode_internal = barcode.barcode;
    saveState(state);
    return { variant, barcodes: variant.barcodes };
  }
  match = pathname.match(/^\/api\/retail\/variantes\/(\d+)\/barcodes\/primary\/$/);
  if (match) {
    const variant = variantById(state, match[1]);
    if (!variant) throw makeError(404, 'Variante no encontrada');
    variant.barcodes = (variant.barcodes || []).map((barcode) => ({ ...barcode, is_primary: Number(barcode.id) === Number(payload.barcode_id) }));
    const primary = variant.barcodes.find((barcode) => barcode.is_primary);
    if (primary) variant.barcode_internal = primary.barcode;
    saveState(state);
    return { variant, barcodes: variant.barcodes };
  }
  match = pathname.match(/^\/api\/retail\/variantes\/(\d+)\/$/);
  if (match && method === 'PATCH') {
    const row = patchVariant(state, match[1], payload);
    saveState(state);
    return row;
  }
  if (match && method === 'DELETE') {
    state.variants = state.variants.filter((row) => Number(row.id) !== Number(match[1]));
    saveState(state);
    return { ok: true, mode: 'hard' };
  }

  if (pathname === '/api/retail/atributos/') {
    if (method === 'GET') return state.attributes;
    if (method === 'POST') {
      const row = { id: nextId(state, 'barcode'), name: payload.name || 'Atributo demo', code: payload.code || `attr_${Date.now()}`, sort_order: 100, active: true };
      state.attributes.push(row);
      saveState(state);
      return row;
    }
  }
  match = pathname.match(/^\/api\/retail\/atributos\/(\d+)\/$/);
  if (match && method === 'PATCH') {
    const row = state.attributes.find((item) => Number(item.id) === Number(match[1]));
    if (row) Object.assign(row, payload);
    saveState(state);
    return row || { ok: true };
  }
  if (match && method === 'DELETE') {
    state.attributes = state.attributes.filter((row) => Number(row.id) !== Number(match[1]));
    saveState(state);
    return { ok: true };
  }
  if (pathname === '/api/retail/atributos/valores/') return state.attributeValues;

  if (pathname === '/api/retail/compras/config/') return { default_location_code: 'deposito', locations: [{ code: 'deposito', label: 'Deposito' }, { code: 'salon', label: 'Salon' }] };
  if (pathname === '/api/retail/compras/proveedores/') {
    const q = lower(params.get('q'));
    return q ? state.suppliers.filter((row) => lower(row.name).includes(q)) : state.suppliers;
  }
  if (pathname === '/api/retail/compras/ordenes/') {
    if (method === 'GET') return { rows: state.purchaseOrders, paging: { total: state.purchaseOrders.length } };
    const row = createPurchaseOrder(state, payload);
    saveState(state);
    return row;
  }
  match = pathname.match(/^\/api\/retail\/compras\/ordenes\/(\d+)\/recepcionar\/$/);
  if (match) {
    const row = receivePurchaseOrder(state, match[1]);
    saveState(state);
    return row;
  }
  if (pathname === '/api/retail/compras/' && method === 'POST') {
    const row = createPurchase(state, payload);
    saveState(state);
    return row;
  }
  match = pathname.match(/^\/api\/retail\/compras\/(\d+)\/$/);
  if (match) return state.purchases.find((row) => Number(row.id) === Number(match[1])) || {};

  if (pathname === '/api/retail/caja/actual/') return { open: !!state.cashSession?.open, session: state.cashSession?.open ? decorateCashSession(state, state.cashSession) : null };
  if (pathname === '/api/retail/caja/cuentas/') return state.paymentAccounts;
  if (pathname === '/api/retail/caja/apertura/') {
    state.cashSession = { id: Date.now(), open: true, opened_at: nowIso(), opened_by_name: 'Demo Admin', opening_amount_cash_ars: Number(payload.opening_amount_cash_ars || 0) };
    saveState(state);
    return decorateCashSession(state, state.cashSession);
  }
  if (pathname === '/api/retail/caja/cierre/' || pathname === '/api/retail/caja/cierre-asistido/') {
    if (state.cashSession) {
      const closed = decorateCashSession(state, state.cashSession);
      closed.open = false;
      closed.closed_at = nowIso();
      closed.closing_counted_total_ars = payload.closing_counted_total_ars;
      closed.difference_total_ars = round2(Number(payload.closing_counted_total_ars || closed.summary.expected_total_ars) - Number(closed.summary.expected_total_ars || 0));
      state.cashHistory.unshift(closed);
      state.cashSession.open = false;
    }
    saveState(state);
    return { ok: true };
  }
  match = pathname.match(/^\/api\/retail\/caja\/(\d+)\/$/);
  if (match) return decorateCashSession(state, state.cashSession) || state.cashHistory.find((row) => Number(row.id) === Number(match[1])) || {};
  if (pathname === '/api/retail/operacion/pendientes/') return { rows: state.alerts.filter((row) => row.status === 'open') };
  match = pathname.match(/^\/api\/retail\/operacion\/incidencias\/(\d+)\/resolver\/$/);
  if (match) {
    state.alerts = state.alerts.map((row) => Number(row.id) === Number(match[1]) ? { ...row, status: 'resolved' } : row);
    saveState(state);
    return { ok: true };
  }

  if (pathname === '/api/retail/ventas/cotizar/') return quoteSale(state, payload);
  if (pathname === '/api/retail/ventas/confirmar/') {
    const sale = saleFromQuote(state, quoteSale(state, payload), payload);
    saveState(state);
    return sale;
  }
  if (pathname === '/api/retail/ventas/') return saleList(state, params);
  match = pathname.match(/^\/api\/retail\/ventas\/(\d+)\/$/);
  if (match) return state.sales.find((row) => Number(row.id) === Number(match[1])) || {};
  match = pathname.match(/^\/api\/retail\/facturacion\/(\d+)\/emitir\/$/);
  if (match) {
    const sale = issueInvoice(state, match[1]);
    saveState(state);
    return sale;
  }
  match = pathname.match(/^\/api\/retail\/facturacion\/(\d+)\/$/);
  if (match) return state.sales.find((row) => Number(row.id) === Number(match[1]))?.invoice || null;
  match = pathname.match(/^\/api\/retail\/facturacion\/(\d+)\/nota-credito\/$/);
  if (match) return { ok: true, credit_note: { status: 'issued', mock: true, issued_at: nowIso() } };
  match = pathname.match(/^\/api\/retail\/ventas\/(\d+)\/anular\/$/);
  if (match) {
    const sale = cancelSale(state, match[1], payload);
    saveState(state);
    return sale;
  }
  match = pathname.match(/^\/api\/retail\/ventas\/(\d+)\/devolver\/$/);
  if (match) {
    const resp = returnSale(state, match[1], payload);
    saveState(state);
    return resp;
  }
  match = pathname.match(/^\/api\/retail\/ventas\/(\d+)\/cambiar\/$/);
  if (match) {
    const resp = exchangeSale(state, match[1], payload);
    saveState(state);
    return resp;
  }
  match = pathname.match(/^\/api\/retail\/ventas\/(\d+)\/solicitudes\/$/);
  if (match) return { ok: true, sent: true, demo: true };
  if (pathname === '/api/retail/pos/authorizations/void-line/') return { ok: true, status: 'approved' };

  if (pathname === '/api/retail/pos/drafts/') {
    if (method === 'GET') return { rows: state.drafts.filter((row) => row.status !== 'confirmed') };
    const id = nextId(state, 'draft');
    const row = { id, draft_number: `BOR-${String(id).padStart(4, '0')}`, name: payload.name || `Borrador ${id}`, status: 'open', payload: payload.payload || {}, quote_snapshot: payload.quote_snapshot || null, updated_at: nowIso() };
    state.drafts.unshift(row);
    saveState(state);
    return row;
  }
  match = pathname.match(/^\/api\/retail\/pos\/drafts\/(\d+)\/$/);
  if (match && method === 'GET') return state.drafts.find((row) => Number(row.id) === Number(match[1])) || {};
  if (match && method === 'PATCH') {
    const row = state.drafts.find((item) => Number(item.id) === Number(match[1]));
    if (row) Object.assign(row, { name: payload.name || row.name, payload: payload.payload || row.payload, quote_snapshot: payload.quote_snapshot || row.quote_snapshot, updated_at: nowIso() });
    saveState(state);
    return row || {};
  }
  match = pathname.match(/^\/api\/retail\/pos\/drafts\/(\d+)\/confirm\/$/);
  if (match) {
    const row = state.drafts.find((item) => Number(item.id) === Number(match[1]));
    const sale = saleFromQuote(state, quoteSale(state, payload.payload || {}), payload.payload || {});
    if (row) row.status = 'confirmed';
    saveState(state);
    return { sale };
  }

  if (pathname === '/api/retail/store-credits/') {
    const doc = normalizeText(params.get('customer_doc'));
    return { rows: state.storeCredits.filter((row) => !doc || row.customer_doc === doc) };
  }
  match = pathname.match(/^\/api\/retail\/store-credits\/(\d+)\/consume\/$/);
  if (match) return { ok: true };
  match = pathname.match(/^\/api\/retail\/garantias\/ticket\/(.+)\/$/);
  if (match) {
    const term = decodeURIComponent(match[1]);
    const sale = state.sales.find((row) => row.sale_number === term || String(row.id) === term);
    if (!sale) throw makeError(404, 'Ticket no encontrado');
    return sale;
  }
  if (pathname === '/api/retail/garantias/activas/') return { rows: state.sales.filter((sale) => sale.status === 'confirmed'), paging: { total: state.sales.length } };

  if (pathname === '/api/retail/inventario/conteos/') {
    if (method === 'GET') {
      const status = lower(params.get('status'));
      return { rows: status ? state.inventoryCounts.filter((row) => lower(row.status) === status) : state.inventoryCounts };
    }
    const row = buildInventoryCount(state, payload, true);
    state.inventoryCounts.unshift(row);
    saveState(state);
    return row;
  }
  match = pathname.match(/^\/api\/retail\/inventario\/conteos\/(\d+)\/$/);
  if (match) return state.inventoryCounts.find((row) => Number(row.id) === Number(match[1])) || {};
  match = pathname.match(/^\/api\/retail\/inventario\/conteos\/(\d+)\/cerrar\/$/);
  if (match) {
    const row = closeInventoryCount(state, match[1], payload);
    saveState(state);
    return row;
  }
  if (pathname === '/api/retail/reposicion/sugerida/') return { rows: replenishmentRows(state, Number(params.get('limit') || 25)) };
  if (pathname === '/api/retail/stock/locations/') {
    return {
      rows: state.variants.slice(0, Number(params.get('limit') || 20)).map((row) => ({
        variant_id: row.id,
        producto: row.producto,
        sku: row.sku,
        stock_reserved: row.stock_reserved || 0,
        balances: [
          { location_code: 'deposito', qty: Math.max(0, Math.floor(Number(row.stock_on_hand || 0) * 0.65)) },
          { location_code: 'salon', qty: Math.max(0, Math.ceil(Number(row.stock_on_hand || 0) * 0.35)) },
        ],
      })),
    };
  }
  if (pathname === '/api/retail/stock/transfers/' && method === 'GET') return { rows: state.stockTransfers };
  if (pathname === '/api/retail/stock/transfers/' && method === 'POST') {
    const id = nextId(state, 'transfer');
    const row = { id, code: `TR-${String(id).padStart(4, '0')}`, created_at: nowIso(), from_location_code: payload.from_location_code, to_location_code: payload.to_location_code, reason: payload.reason, lines_snapshot: payload.items || [] };
    state.stockTransfers.unshift(row);
    saveState(state);
    return row;
  }
  if (pathname === '/api/retail/lotes/alerts/') {
    return { rows: state.variants.slice(0, 3).map((row, idx) => ({ id: idx + 1, batch_code: `L-${row.id}`, producto: row.producto, sku: row.sku, expires_at: daysAgoIso(-(idx + 4)), days_to_expire: idx + 4, available_qty: Math.max(1, Math.round(Number(row.stock_on_hand || 0) / 4)) })) };
  }
  if (pathname === '/api/retail/inventario/mermas/') {
    if (method === 'GET') return { rows: state.wasteEvents };
    const variant = variantById(state, payload.variant_id);
    const row = { id: nextId(state, 'waste'), created_at: nowIso(), variant_id: payload.variant_id, producto: variant?.producto || '', sku: variant?.sku || '', reason: payload.reason, qty: payload.quantity, location_code: payload.location_code, note: payload.note || '' };
    state.wasteEvents.unshift(row);
    if (variant) variant.stock_on_hand = Math.max(0, Number(variant.stock_on_hand || 0) - Number(payload.quantity || 0));
    saveState(state);
    return row;
  }

  if (pathname === '/api/retail/promociones/') {
    if (method === 'GET') {
      const onlyActive = params.get('active');
      const q = lower(params.get('q'));
      return state.promotions.filter((row) => (onlyActive === null || (row.active !== false) === parseBool(onlyActive)) && (!q || lower(`${row.name} ${row.coupon_code}`).includes(q)));
    }
    const row = { id: nextId(state, 'promotion'), ...payload };
    state.promotions.unshift(row);
    saveState(state);
    return row;
  }
  match = pathname.match(/^\/api\/retail\/promociones\/(\d+)\/$/);
  if (match) {
    const row = state.promotions.find((item) => Number(item.id) === Number(match[1]));
    if (!row) throw makeError(404, 'Promocion no encontrada');
    if (method === 'GET') return { ...row, variants: state.variants.filter((variant) => (row.variant_ids || []).map(Number).includes(Number(variant.id))) };
    Object.assign(row, payload);
    saveState(state);
    return { ...row, variants: state.variants.filter((variant) => (row.variant_ids || []).map(Number).includes(Number(variant.id))) };
  }

  if (pathname === '/api/retail/config/settings/') {
    if (method === 'GET') return state.settings;
    state.settings = { ...state.settings, ...payload };
    saveState(state);
    return state.settings;
  }
  if (pathname === '/api/retail/config/arca-accounts/') {
    if (method === 'GET') return { accounts: state.arcaAccounts };
    state.arcaAccounts = payload.accounts || state.arcaAccounts;
    saveState(state);
    return { accounts: state.arcaAccounts };
  }
  if (pathname === '/api/retail/config/payment-accounts/') {
    if (method === 'GET') return { accounts: state.paymentAccounts };
    state.paymentAccounts = payload.accounts || state.paymentAccounts;
    saveState(state);
    return { accounts: state.paymentAccounts };
  }
  if (pathname === '/api/retail/config/page-settings/') {
    if (method === 'GET') return state.pageSettings;
    state.pageSettings = { ...state.pageSettings, ...payload };
    saveState(state);
    return state.pageSettings;
  }
  if (pathname === '/api/retail/online/oauth/reauthorize-url/') return { url: '#demo-online-oauth', demo: true };
  if (pathname === '/api/retail/online/oauth/apply-token/') return { ok: true, demo: true };

  if (pathname === '/api/retail/online/jobs/failed-summary/') return { failed_total: 0, by_type: { import_catalogo: 0, sync_catalogo: 0, sync_stock: 0 }, items: [] };
  if (pathname === '/api/retail/online/import/catalogo/') return { ok: true, demo: true, imported: state.variants.length };
  if (pathname === '/api/retail/online/sync/catalogo/') return { ok: true, demo: true, synced_catalog: state.variants.length };
  if (pathname === '/api/retail/online/sync/stock/') return { ok: true, demo: true, synced_stock: state.variants.length };
  if (pathname === '/api/retail/online/jobs/retry-failed/') return { ok: true, demo: true, retried: 0 };
  if (pathname === '/api/retail/online/jobs/process/') return { ok: true, demo: true, processed: 0 };
  if (pathname === '/api/retail/fulfillment/') {
    if (method === 'GET') return { rows: state.fulfillmentOrders };
    const row = state.fulfillmentOrders.find((item) => item.fulfillment_order_id === payload.fulfillment_order_id);
    if (row) row.status = payload.status || row.status;
    saveState(state);
    return row || { ok: true };
  }

  if (pathname === '/api/retail/reportes/resumen-comercial/') return reportsSummary(state);
  if (pathname === '/api/retail/reportes/analisis-productos/') return reportProducts(state);
  if (pathname === '/api/retail/reportes/analisis-proveedores/') return reportSuppliers(state);
  if (pathname === '/api/retail/reportes/bajo-stock/') return lowStockRows(state);
  if (pathname === '/api/retail/reportes/rentabilidad/') return reportProducts(state);
  if (pathname === '/api/retail/reportes/ventas-por-medio/') return { rows: state.paymentAccounts.map((row) => ({ payment_method: row.payment_method, total_ars: 10000, count: 2 })) };
  if (pathname === '/api/retail/reportes/cierre-caja/') return { rows: state.cashHistory };
  if (pathname === '/api/retail/reportes/devoluciones/') return { rows: state.sales.flatMap((sale) => sale.returns || []) };
  if (pathname === '/api/retail/reportes/autorizaciones-pos/') return { rows: [], summary: [], by_cashier: [], by_supervisor: [] };
  if (pathname === '/api/retail/dashboard/operativo/') return dashboard(state);
  if (pathname === '/api/retail/alertas/') return { rows: state.alerts.filter((row) => !params.get('status') || row.status === params.get('status')) };
  match = pathname.match(/^\/api\/retail\/alertas\/(\d+)\/ack\/$/);
  if (match) {
    state.alerts = state.alerts.map((row) => Number(row.id) === Number(match[1]) ? { ...row, status: payload.status || 'acknowledged' } : row);
    saveState(state);
    return { ok: true };
  }
  if (pathname === '/api/retail/risk/events/') {
    if (method === 'GET') return { rows: state.riskEvents.filter((row) => !params.get('status') || row.status === params.get('status')) };
    const event = state.riskEvents.find((row) => Number(row.id) === Number(payload.event_id));
    if (event) event.status = payload.status || event.status;
    saveState(state);
    return event || { ok: true };
  }

  return { ok: true, demo: true, rows: [] };
}

export async function demoHttp(path, { method = 'GET', body } = {}) {
  const state = loadState();
  const url = new URL(path, window.location.origin);
  const payload = readPayload(body);
  const result = routeDemo(state, String(method || 'GET').toUpperCase(), url.pathname, url.searchParams, payload);
  return clone(result);
}

export function getDemoBarcodeLabelsUrl(variantId, params = {}) {
  const state = loadState();
  const variant = variantById(state, variantId);
  const code = params.code || variant?.barcode_internal || variant?.sku || `VAR-${variantId}`;
  const copies = Math.max(1, Number(params.copies || 1));
  const labels = Array.from({ length: copies }, () => `<div class="label"><strong>${variant?.display_name || variant?.producto || 'Producto demo'}</strong><span>${code}</span></div>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Etiquetas demo</title><style>body{font-family:Arial,sans-serif;padding:24px}.label{display:inline-flex;flex-direction:column;gap:8px;width:180px;height:92px;border:1px solid #111;margin:8px;padding:10px;justify-content:center}.label span{font-family:monospace;font-size:18px}</style></head><body>${labels}<script>window.print()</script></body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}
