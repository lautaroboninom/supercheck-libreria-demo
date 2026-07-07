const UPDATE_NOTICE = {
  id: '2026-06-22-supercheck-professional-ops-upgrade',
  title: 'Consola profesional SuperCheck',
  subtitle: 'POS, productos, compras e inventario',
  intro:
    'Esta actualizacion integra las ultimas mejoras utiles de RetailHub y las adapta al flujo de librería: caja rapida, catalogo claro, codigos, proveedores y control operativo.',
  sections: [
    {
      title: 'Productos',
      items: [
        'La lista de presentaciones muestra proveedor, articulo, codigos, precios y stock sin agrandar cada renglon.',
        'Cada presentacion tiene un detalle completo con proveedor destacado, ultima compra, barcodes y datos online disponibles.',
        'Los atributos reutilizan selectores unificados para evitar duplicados por mayusculas, acentos o tipeos parecidos.',
      ],
    },
    {
      title: 'Compras e inventario',
      items: [
        'Las mejoras de proveedor y articulo ayudan a identificar reposiciones y etiquetas con menos carga manual.',
        'Se conservan las funciones de SuperCheck para PLU, productos pesables, stock minimo/maximo, lotes, mermas y ubicaciones.',
      ],
    },
    {
      title: 'Operacion',
      items: [
        'Los controles quedan orientados a caja y gestion diaria: menos ruido visual, acciones mas visibles y permisos mas precisos.',
        'Los costos y acciones sensibles siguen respetando permisos de encargado, repositor, auditor y administrador.',
      ],
    },
  ],
  actions: [
    {
      label: 'Ir a productos',
      to: '/productos',
    },
    {
      label: 'Ir a compras',
      to: '/compras',
    },
    {
      label: 'Ir a inventario',
      to: '/inventario',
    },
  ],
};

export default UPDATE_NOTICE;
