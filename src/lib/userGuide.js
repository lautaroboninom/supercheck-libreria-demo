export const USER_GUIDE_VERSION = '2026-06-client-guide-v1';

export const ROUTE_GUIDES = {
  '/pos': {
    eyebrow: 'Caja y venta',
    title: 'Como vender en el mostrador',
    summary: 'Usa esta pantalla para abrir caja, escanear productos, elegir cobro y confirmar la venta.',
    steps: [
      'Abri la caja con el importe inicial antes de vender.',
      'Escanea el producto o buscalo manualmente y revisa cantidad/precio.',
      'Elegi medio de pago, cuenta de cobro y datos del cliente si corresponde.',
      'Confirma la venta cuando el total este correcto.',
    ],
    tips: ['F2 enfoca el scanner, F8 guarda borrador y F9 confirma cuando la venta esta lista.'],
    to: '/pos',
  },
  '/productos': {
    eyebrow: 'Catalogo',
    title: 'Como cargar productos',
    summary: 'Administra productos, presentaciones, precios, stock minimo y codigos de barra.',
    steps: [
      'Crea el producto base con nombre, marca, rubro, IVA y precios sugeridos.',
      'Agrega una presentacion para cada formato que se venda o escanee.',
      'Asocia o genera el codigo EAN-13 para poder vender rapido en POS.',
      'Actualiza precios masivamente cuando cambian listas de proveedor.',
    ],
    tips: ['Si el producto es pesable, activa esa opcion y define PLU/unidad antes de venderlo.'],
    to: '/productos',
  },
  '/compras': {
    eyebrow: 'Abastecimiento',
    title: 'Como registrar compras',
    summary: 'Carga proveedores, recepciones de mercaderia y costos para mantener stock y margenes.',
    steps: [
      'Selecciona proveedor y fecha de la compra.',
      'Agrega productos recibidos con cantidad, costo y lote si aplica.',
      'Confirma la compra para actualizar stock y costos promedio.',
      'Revisa alertas de reposicion si necesitas planificar nuevos pedidos.',
    ],
    tips: ['Registrar compras antes de vender mejora reportes de rentabilidad y reposicion.'],
    to: '/compras',
  },
  '/ventas': {
    eyebrow: 'Postventa',
    title: 'Como consultar ventas y resolver reclamos',
    summary: 'Busca comprobantes, revisa facturacion y gestiona anulaciones, cambios o devoluciones.',
    steps: [
      'Filtra por fecha, estado, canal, medio de pago o numero de venta.',
      'Selecciona una venta para ver detalle, garantia y estado de factura.',
      'Carga motivo operativo antes de anular, devolver o cambiar productos.',
      'Emite o reintenta factura/nota de credito cuando el permiso lo permita.',
    ],
    tips: ['Las operaciones bloqueadas pueden solicitarse por mail si el rol no tiene permiso directo.'],
    to: '/ventas',
  },
  '/promociones': {
    eyebrow: 'Promos',
    title: 'Como activar descuentos',
    summary: 'Define promociones para aplicar descuentos automaticamente al cotizar ventas.',
    steps: [
      'Crea la promocion con nombre, vigencia y tipo de descuento.',
      'Asocia los productos o presentaciones alcanzadas.',
      'Verifica que este activa y dentro de fecha.',
      'Prueba una venta en POS para validar el descuento.',
    ],
    tips: ['Mantene nombres claros para que luego aparezcan entendibles en reportes y detalle de venta.'],
    to: '/promociones',
  },
  '/garantias': {
    eyebrow: 'Garantias',
    title: 'Como usar postventa',
    summary: 'Consulta reglas de cambio, incidencia y credito tienda para resolver reclamos.',
    steps: [
      'Busca el ticket o venta relacionada.',
      'Revisa si la ventana de cambio/incidencia sigue vigente.',
      'Elige cambio, devolucion o credito tienda segun el caso.',
      'Registra siempre el motivo para dejar trazabilidad.',
    ],
    tips: ['Si la garantia vencio, solo un usuario autorizado puede aplicar override.'],
    to: '/garantias',
  },
  '/inventario': {
    eyebrow: 'Stock',
    title: 'Como controlar inventario',
    summary: 'Ejecuta conteos ciclicos, reposicion sugerida, transferencias y registro de merma.',
    steps: [
      'Crea un conteo por bajo stock, catalogo completo o presentaciones puntuales.',
      'Carga cantidades contadas y motivo cuando haya diferencia.',
      'Cierra el conteo para aplicar ajustes y generar incidencias.',
      'Usa reposicion sugerida, transferencias y merma para mantener stock limpio.',
    ],
    tips: ['Toda diferencia con ajuste necesita motivo para auditoria.'],
    to: '/inventario',
  },
  '/reportes': {
    eyebrow: 'Control',
    title: 'Como leer reportes',
    summary: 'Consulta ventas, rentabilidad, caja, stock y senales operativas para tomar decisiones.',
    steps: [
      'Selecciona rango de fechas y filtros relevantes.',
      'Revisa totales de ventas, medios de pago y productos principales.',
      'Contrasta ventas con costos si tu rol permite ver rentabilidad.',
      'Exporta o comparte los datos que necesite administracion.',
    ],
    tips: ['Los reportes son mas utiles si compras, stock y caja se cargan diariamente.'],
    to: '/reportes',
  },
  '/online': {
    eyebrow: 'Online',
    title: 'Como revisar integraciones',
    summary: 'Monitorea importaciones, sincronizacion de catalogo, stock y errores pendientes.',
    steps: [
      'Revisa el contador de pendientes o fallas.',
      'Abre cada job con error para ver causa y accion recomendada.',
      'Reintenta despues de corregir catalogo, credenciales o stock.',
      'Confirma que la tienda online reciba cambios de productos y stock.',
    ],
    tips: ['Si hay credenciales vencidas, revisa Configuracion antes de reintentar.'],
    to: '/online',
  },
  '/config': {
    eyebrow: 'Configuracion',
    title: 'Como dejar listo el sistema',
    summary: 'Ajusta datos generales, cuentas, reglas de facturacion, usuarios y parametros operativos.',
    steps: [
      'Carga datos del negocio y cuentas de cobro.',
      'Configura usuarios, roles y permisos segun responsabilidad real.',
      'Define cuentas ARCA y reglas de facturacion antes de operar formalmente.',
      'Guarda y prueba una venta completa con un usuario de caja.',
    ],
    tips: ['No compartas usuarios admin para operacion diaria; crea usuarios por persona o rol.'],
    to: '/config',
  },
  '/config/paginas': {
    eyebrow: 'Presentacion',
    title: 'Como personalizar la interfaz',
    summary: 'Cambia nombre de la app, etiquetas del menu, titulos y pantalla inicial.',
    steps: [
      'Edita nombre de aplicacion, subtitulo y footer legal.',
      'Renombra botones del menu segun el vocabulario del cliente.',
      'Define titulos por pantalla para que el sistema sea mas claro.',
      'Elige la ruta inicial; puedes usar /guia para una demo guiada.',
    ],
    tips: ['Estos cambios no alteran datos operativos, solo como se ve y nombra el sistema.'],
    to: '/config/paginas',
  },
  '/guia': {
    eyebrow: 'Guia rapida',
    title: 'Recorrido del sistema',
    summary: 'Usa esta guia para entender que se puede hacer, en que orden y con que cuidados.',
    steps: [
      'Lee el flujo diario recomendado.',
      'Abre el modulo que quieras probar desde las tarjetas.',
      'Usa el boton Guia en cualquier pantalla para ver ayuda contextual.',
      'Marca la guia como vista cuando ya no necesites el aviso inicial.',
    ],
    tips: ['La guia no cambia datos; solo orienta al usuario dentro del sistema.'],
    to: '/guia',
  },
};

export const GUIDE_MODULES = [
  {
    key: 'pos',
    title: 'Vender en caja',
    to: '/pos',
    role: 'Cajero / mostrador',
    outcome: 'Abrir caja, escanear productos, cobrar y confirmar venta.',
    checklist: ['Caja abierta', 'Productos con barcode/precio', 'Medio de pago elegido', 'Venta confirmada'],
  },
  {
    key: 'productos',
    title: 'Armar catalogo',
    to: '/productos',
    role: 'Admin / encargado',
    outcome: 'Crear productos, presentaciones, precios, stock minimo y codigos.',
    checklist: ['Producto base creado', 'Presentacion cargada', 'EAN asociado', 'Stock inicial revisado'],
  },
  {
    key: 'compras',
    title: 'Reponer mercaderia',
    to: '/compras',
    role: 'Compras / deposito',
    outcome: 'Registrar proveedores, compras, costos y entrada de stock.',
    checklist: ['Proveedor seleccionado', 'Cantidades recibidas', 'Costos cargados', 'Stock actualizado'],
  },
  {
    key: 'inventario',
    title: 'Controlar stock',
    to: '/inventario',
    role: 'Deposito / auditoria',
    outcome: 'Hacer conteos, transferencias, reposicion sugerida y merma.',
    checklist: ['Conteo creado', 'Diferencias justificadas', 'Conteo cerrado', 'Reposicion revisada'],
  },
  {
    key: 'ventas',
    title: 'Resolver postventa',
    to: '/ventas',
    role: 'Encargado / administracion',
    outcome: 'Buscar ventas, facturar, anular, cambiar o devolver.',
    checklist: ['Venta encontrada', 'Motivo cargado', 'Garantia revisada', 'Operacion registrada'],
  },
  {
    key: 'promociones',
    title: 'Activar promociones',
    to: '/promociones',
    role: 'Marketing / encargado',
    outcome: 'Crear descuentos, reglas 2x1/3x2 y promociones por producto o presentacion.',
    checklist: ['Vigencia definida', 'Productos asociados', 'Promo activa', 'Prueba en POS'],
  },
  {
    key: 'online',
    title: 'Supervisar online',
    to: '/online',
    role: 'Admin / ecommerce',
    outcome: 'Revisar importaciones, sincronizacion de catalogo, stock y errores.',
    checklist: ['Pendientes revisados', 'Errores corregidos', 'Jobs reintentados', 'Tienda validada'],
  },
  {
    key: 'reportes',
    title: 'Medir resultados',
    to: '/reportes',
    role: 'Administracion',
    outcome: 'Consultar ventas, caja, stock, costos y rendimiento.',
    checklist: ['Rango elegido', 'Filtros aplicados', 'Totales revisados', 'Acciones definidas'],
  },
  {
    key: 'config',
    title: 'Configurar negocio',
    to: '/config',
    role: 'Administrador',
    outcome: 'Definir datos del negocio, usuarios, permisos, cuentas, ARCA e integraciones.',
    checklist: ['Usuarios creados', 'Permisos revisados', 'Cuentas cargadas', 'Facturacion probada'],
  },
];

export const DAILY_FLOW = [
  {
    title: 'Inicio del dia',
    description: 'Entrar al sistema, revisar pendientes online/stock y abrir caja con el efectivo inicial.',
    links: ['/online', '/inventario', '/pos'],
  },
  {
    title: 'Operacion',
    description: 'Vender desde POS, guardar borradores si hace falta y registrar compras cuando entra mercaderia.',
    links: ['/pos', '/compras'],
  },
  {
    title: 'Control',
    description: 'Consultar ventas del dia, resolver cambios/devoluciones y revisar reportes basicos.',
    links: ['/ventas', '/reportes'],
  },
  {
    title: 'Cierre',
    description: 'Cerrar caja, dejar incidencias documentadas y preparar reposicion o conteos para el dia siguiente.',
    links: ['/pos', '/inventario'],
  },
];

export const FIRST_RUN_STORAGE_KEY = `supermercado_pos_user_guide_seen_${USER_GUIDE_VERSION}`;

export function getRouteGuide(pathname) {
  const path = String(pathname || '');
  if (ROUTE_GUIDES[path]) return ROUTE_GUIDES[path];
  if (path.startsWith('/config/')) return ROUTE_GUIDES['/config/paginas'];
  const base = `/${path.split('/').filter(Boolean)[0] || 'guia'}`;
  return ROUTE_GUIDES[base] || ROUTE_GUIDES['/guia'];
}
