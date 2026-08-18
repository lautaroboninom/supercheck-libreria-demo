import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { can, PERMISSION_CODES } from '../lib/permissions';
import { GUIDE_MODULES, ROUTE_GUIDES } from '../lib/userGuide';
import UPDATE_NOTICE from '../updateNotice';

/* ── Permissions map ── */
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

function hasAccess(user, moduleKey) {
  const permission = MODULE_PERMISSIONS[moduleKey];
  return permission ? can(user, permission) : true;
}

/* ── Accordion component ── */
function Accordion({ title, subtitle, children, defaultOpen = false, icon }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:bg-neutral-50 px-1"
      >
        {icon && <span className="text-lg shrink-0 w-6 text-center">{icon}</span>}
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-semibold text-neutral-900">{title}</span>
          {subtitle && <span className="ml-2 text-sm text-neutral-500">{subtitle}</span>}
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[2000px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-1 pl-10">{children}</div>
      </div>
    </div>
  );
}

/* ── Step flow visual component ── */
function FlowStep({ number, title, description, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
          {number}
        </span>
        {!isLast && <div className="mt-1 w-px flex-1 bg-neutral-200" />}
      </div>
      <div className={`${isLast ? '' : 'pb-5'}`}>
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

export default function GuiaPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('start');

  const tabs = [
    { id: 'start', label: 'Primeros pasos' },
    { id: 'products', label: 'Carga de productos' },
    { id: 'modules', label: 'Módulos' },
    { id: 'updates', label: 'Novedades' },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <section className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 text-white shadow-sm">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold md:text-3xl">
            Guía del sistema
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
            Todo lo que necesitás saber para operar: cómo cargar productos, vender, controlar stock y más.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/pos" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 transition-colors">
              Ir al POS
            </Link>
            <Link to="/productos" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Ir a productos
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tab navigation ── */}
      <nav className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Tab: Primeros pasos ── */}
      {activeTab === 'start' && (
        <section className="card">
          <Accordion title="Flujo diario recomendado" icon="📋" defaultOpen>
            <div className="space-y-0">
              <FlowStep
                number={1}
                title="Inicio del día"
                description="Entrar al sistema, revisar pendientes y abrir caja con el efectivo inicial."
              />
              <FlowStep
                number={2}
                title="Operación"
                description="Vender desde POS, escanear productos, elegir cobro y confirmar ventas. Registrar compras cuando entra mercadería."
              />
              <FlowStep
                number={3}
                title="Control"
                description="Consultar ventas del día, resolver cambios o devoluciones y revisar reportes."
              />
              <FlowStep
                number={4}
                title="Cierre"
                description="Cerrar caja, documentar incidencias y preparar reposición para el día siguiente."
                isLast
              />
            </div>
          </Accordion>

          <Accordion title="Ayuda dentro del sistema" icon="💡">
            <p className="text-sm leading-relaxed text-neutral-600">
              En la esquina inferior derecha de cada pantalla aparece el botón <strong>Guía</strong>. Ese panel cambia según
              la pantalla abierta y muestra pasos concretos para usar ese módulo, sin necesidad de leer manuales externos.
            </p>
          </Accordion>

          <Accordion title="Cuidados antes de operar" icon="⚠️">
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-neutral-400">•</span>
                <span>Los usuarios con menos permisos ven menos acciones. Eso es esperado y protege operaciones sensibles.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-neutral-400">•</span>
                <span>Para una demo realista, cargá primero 2 o 3 productos con precio, stock y código de barra.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-neutral-400">•</span>
                <span>Si el cliente opera con facturación, validá cuentas ARCA antes de confirmar ventas reales.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-neutral-400">•</span>
                <span>La guía es informativa: no modifica datos ni ejecuta acciones por sí sola.</span>
              </li>
            </ul>
          </Accordion>
        </section>
      )}

      {/* ── Tab: Carga de productos ── */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <section className="card">
            <h2 className="text-lg font-bold text-neutral-900">¿Cómo se cargan los productos?</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              El sistema ofrece tres formas de dar de alta un producto, de la más rápida a la más manual.
              El objetivo es que la mayor parte de la información se complete automáticamente.
            </p>
          </section>

          {/* Step 1: Automatic */}
          <section className="card border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">1</span>
              <div>
                <h3 className="text-[15px] font-bold text-neutral-900">Búsqueda automática por código</h3>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Más rápido</span>
              </div>
            </div>
            <div className="mt-3 ml-11">
              <p className="text-sm leading-relaxed text-neutral-600">
                Escaneá o ingresá el <strong>ISBN/EAN</strong> del producto. El sistema consulta
                automáticamente en múltiples bases de datos públicas buscando información asociada
                a ese código (título, autor, editorial, imagen, categoría, etc.).
              </p>
              <div className="mt-3 rounded-lg bg-neutral-50 p-3">
                <p className="text-xs font-semibold uppercase text-neutral-500 mb-2">¿Qué pasa según el resultado?</p>
                <ul className="space-y-1.5 text-sm text-neutral-600">
                  <li className="flex gap-2">
                    <span className="shrink-0 text-emerald-500">✓</span>
                    <span><strong>Código encontrado:</strong> se muestra la información obtenida y podés crear el producto con un clic.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 text-emerald-500">✓</span>
                    <span><strong>Ya existe en tu sistema:</strong> te muestra el producto existente con accesos directos para editarlo.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 text-amber-500">→</span>
                    <span><strong>No encontrado:</strong> pasá al paso 2 (búsqueda manual en la web).</span>
                  </li>
                </ul>
              </div>
              <p className="mt-3 text-xs text-neutral-400">
                El producto se crea en estado pendiente hasta que le fijes un precio de venta. Recién ahí queda habilitado para la caja.
              </p>
            </div>
          </section>

          {/* Step 2: Web fallback */}
          <section className="card border-l-4 border-l-amber-400">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
              <div>
                <h3 className="text-[15px] font-bold text-neutral-900">Búsqueda manual en la web</h3>
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Si el código no se encontró</span>
              </div>
            </div>
            <div className="mt-3 ml-11">
              <p className="text-sm leading-relaxed text-neutral-600">
                Si las bases de datos no devuelven resultados, el sistema ofrece un botón
                para <strong>buscar el código directamente en la web</strong>. Se abre una pestaña externa
                donde podés encontrar la información del producto y copiarla al formulario.
              </p>
              <div className="mt-3 rounded-lg bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  💡 Revisá el título, marca y categoría en el sitio externo y copialos al formulario de carga del sistema.
                </p>
              </div>
            </div>
          </section>

          {/* Step 3: Fully manual */}
          <section className="card border-l-4 border-l-neutral-400">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600">3</span>
              <div>
                <h3 className="text-[15px] font-bold text-neutral-900">Carga completamente manual</h3>
                <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">Control total</span>
              </div>
            </div>
            <div className="mt-3 ml-11">
              <p className="text-sm leading-relaxed text-neutral-600">
                Desde la pestaña <strong>Herramientas avanzadas</strong> en Productos podés crear
                cualquier producto desde cero: nombre, marca, categoría, IVA, precios, presentaciones
                con stock, códigos de barra y atributos personalizados. También hay un generador
                masivo de variantes para artículos con varias combinaciones (color, tamaño, etc.).
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-700">Producto base</p>
                  <p className="mt-0.5 text-xs text-neutral-500">Nombre, marca, rubro, IVA, precios sugeridos e imagen.</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-700">Presentación / SKU</p>
                  <p className="mt-0.5 text-xs text-neutral-500">Formato vendible, código EAN, stock, precio y atributos.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-center pt-1">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Ir a productos
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* ── Tab: Módulos ── */}
      {activeTab === 'modules' && (
        <section className="card">
          <p className="text-sm text-neutral-500 mb-4">
            El acceso depende del usuario actual. Los módulos marcados como "requiere permiso" se ven pero no se operan sin el rol habilitado.
          </p>
          <div className="space-y-0">
            {GUIDE_MODULES.map((module) => {
              const allowed = hasAccess(user, module.key);
              return (
                <Accordion
                  key={module.key}
                  title={module.title}
                  subtitle={module.role}
                  icon={allowed ? '🟢' : '🟡'}
                >
                  <p className="text-sm text-neutral-600 leading-relaxed">{module.outcome}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {module.checklist.map((check) => (
                      <span
                        key={check}
                        className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                        {check}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={module.to}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
                  >
                    Abrir módulo
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </Accordion>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Tab: Novedades ── */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          {/* Latest updates from updateNotice */}
          {UPDATE_NOTICE && (
            <section className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-full bg-neutral-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    Última actualización
                  </span>
                  <h2 className="mt-2 text-lg font-bold text-neutral-900">{UPDATE_NOTICE.title}</h2>
                  {UPDATE_NOTICE.subtitle && (
                    <p className="text-sm text-neutral-500">{UPDATE_NOTICE.subtitle}</p>
                  )}
                </div>
              </div>
              {UPDATE_NOTICE.intro && (
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{UPDATE_NOTICE.intro}</p>
              )}
              {UPDATE_NOTICE.sections?.map((section) => (
                <div key={section.title} className="mt-4">
                  <h3 className="text-sm font-semibold text-neutral-900">{section.title}</h3>
                  <ul className="mt-2 space-y-1.5">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-neutral-600">
                        <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-neutral-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {UPDATE_NOTICE.actions?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                  {UPDATE_NOTICE.actions.map((action, i) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        i === 0
                          ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                          : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Recent feature highlights */}
          <section className="card">
            <h2 className="text-lg font-bold text-neutral-900">Mejoras recientes</h2>
            <div className="mt-3 space-y-0">
              <Accordion title="Ingreso rápido por código de barras" icon="📦">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  La pestaña "Ingreso por código" permite escanear o tipear un ISBN/EAN y el sistema
                  busca automáticamente la información del producto en múltiples bases de datos.
                  Si se encuentra, se puede crear el producto pendiente con un clic.
                </p>
              </Accordion>
              <Accordion title="Múltiples fuentes de datos" icon="🔍">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  El sistema consulta distintas fuentes según el tipo de artículo (libros, alimentos,
                  papelería, bazar, etc.) para maximizar la cobertura. Si un código no aparece
                  en ninguna fuente, se ofrece búsqueda manual en la web.
                </p>
              </Accordion>
              <Accordion title="Carga manual de imagen" icon="🖼️">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Ahora se puede subir una imagen del producto manualmente o pegarla desde una URL.
                  La imagen se guarda junto con el producto para facilitar la identificación visual.
                </p>
              </Accordion>
              <Accordion title="Estado de fuentes en el lookup" icon="📡">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Al buscar un código, el sistema informa el estado de cada fuente consultada
                  (éxito, sin resultado, error) para que sepas exactamente qué pasó con la búsqueda.
                </p>
              </Accordion>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
