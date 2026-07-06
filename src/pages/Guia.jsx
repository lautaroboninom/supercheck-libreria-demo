import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { can, PERMISSION_CODES } from '../lib/permissions';
import { DAILY_FLOW, GUIDE_MODULES, ROUTE_GUIDES } from '../lib/userGuide';

const MODULE_PERMISSIONS = {
  pos: PERMISSION_CODES.PAGE_POS,
  productos: PERMISSION_CODES.PAGE_PRODUCTOS,
  compras: PERMISSION_CODES.PAGE_COMPRAS,
  inventario: PERMISSION_CODES.PAGE_INVENTARIO,
  ventas: PERMISSION_CODES.PAGE_VENTAS,
  promociones: PERMISSION_CODES.PAGE_PROMOCIONES,
  reportes: PERMISSION_CODES.PAGE_REPORTES,
  online: PERMISSION_CODES.PAGE_ONLINE,
  config: PERMISSION_CODES.PAGE_CONFIG,
};

const DEMO_STEPS = [
  'Entrar con usuario admin o encargado y abrir esta guia.',
  'Mostrar Configuracion para explicar usuarios, permisos, cuentas y datos del negocio.',
  'Mostrar Productos: producto base, presentacion, precio, stock y barcode.',
  'Abrir POS: caja, scanner/busqueda, medio de pago, cotizacion y venta.',
  'Entrar a Ventas: buscar ticket, factura, anulacion, cambio o devolucion.',
  'Cerrar con Inventario/Reportes para mostrar control diario y decision de reposicion.',
];

const CARE_POINTS = [
  'Los usuarios con menos permisos veran menos acciones. Eso es esperado y protege operaciones sensibles.',
  'Para una demo realista, carga primero 2 o 3 productos con precio, stock y codigo de barra.',
  'Si el cliente operara con facturacion, valida cuentas ARCA antes de confirmar ventas reales.',
  'La guia es informativa: no modifica datos ni ejecuta acciones por si sola.',
];

function hasAccess(user, moduleKey) {
  const permission = MODULE_PERMISSIONS[moduleKey];
  return permission ? can(user, permission) : true;
}

function routeLabel(path) {
  return ROUTE_GUIDES[path]?.title || path;
}

export default function GuiaPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-neutral-200 bg-[#111111] text-white shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="p-6 md:p-8">
            <p className="text-xs font-semibold uppercase text-[#ffb4a8]">Guia de uso para cliente</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold md:text-5xl">
              Que se puede hacer en el sistema y como empezar.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300">
              Esta pantalla sirve como recorrido inicial para entregar la version actual: explica el flujo diario,
              los modulos principales y los cuidados antes de operar con datos reales.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/pos" className="rounded-lg bg-[#ef6f61] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#dc5d50]">
                Empezar por POS
              </Link>
              <Link to="/config" className="rounded-lg border border-white/25 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">
                Revisar configuracion
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.06] p-6 lg:border-l lg:border-t-0 md:p-8">
            <h2 className="text-lg font-bold">Recorrido recomendado para mostrarlo</h2>
            <ol className="mt-4 space-y-3">
              {DEMO_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-neutral-200">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-neutral-950">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {DAILY_FLOW.map((item) => (
          <article key={item.title} className="card flex flex-col">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-neutral-600">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.links.map((path) => (
                <Link
                  key={`${item.title}-${path}`}
                  to={path}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  {routeLabel(path)}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="card">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase text-[#ef6f61]">Modulos disponibles</p>
            <h2 className="mt-1 text-2xl font-bold">Que puede hacer cada pantalla</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-neutral-600">
            El estado de acceso se calcula con el usuario actual. Si una tarjeta dice que requiere permiso, el cliente puede verla en la guia pero no operar sin rol habilitado.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {GUIDE_MODULES.map((module) => {
            const allowed = hasAccess(user, module.key);
            return (
              <article key={module.key} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-950">{module.title}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase text-neutral-500">{module.role}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      allowed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {allowed ? 'Disponible' : 'Requiere permiso'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{module.outcome}</p>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {module.checklist.map((check) => (
                    <div key={check} className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                      <span className="h-2 w-2 rounded-full bg-[#ef6f61]" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={module.to}
                  className="mt-4 inline-flex rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
                >
                  Abrir modulo
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="card">
          <h2 className="text-xl font-bold">Cuidados antes de entregar</h2>
          <div className="mt-3 space-y-3">
            {CARE_POINTS.map((point) => (
              <p key={point} className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700">
                {point}
              </p>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold">Ayuda dentro del sistema</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            En la esquina inferior derecha aparece el boton Guia. Ese panel cambia segun la pantalla abierta y muestra pasos concretos para usar ese modulo.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[#ef6f61]/25 bg-[#ef6f61]/10 p-4">
              <h3 className="font-semibold text-neutral-950">Para el cliente</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                Puede explorar sin leer manuales externos: entra al modulo, abre Guia y sigue los pasos.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="font-semibold text-neutral-950">Para la demo</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                Si queres que esta sea la pantalla inicial, anda a Configuracion &gt; Paginas y elegi /guia como ruta inicial.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
