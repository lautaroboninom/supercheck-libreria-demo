import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getRouteGuide } from '../lib/userGuide';

export default function GuideDrawer() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const guide = getRouteGuide(location.pathname);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-full border border-[#ef6f61]/30 bg-[#111111] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(17,17,17,0.28)] transition hover:-translate-y-0.5 hover:bg-neutral-800"
        aria-label="Abrir guia de uso"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ef6f61] text-xs font-bold">
          ?
        </span>
        Guia
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-black/35" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-drawer-title"
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col overflow-hidden border-l border-neutral-200 bg-white shadow-2xl"
          >
            <div className="border-b border-neutral-200 bg-[#fcfbf7] px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#ef6f61]">
                    {guide.eyebrow}
                  </p>
                  <h2 id="guide-drawer-title" className="mt-1 text-xl font-bold text-neutral-950">
                    {guide.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{guide.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 hover:bg-white"
                  aria-label="Cerrar guia"
                >
                  X
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <section>
                <h3 className="text-sm font-semibold uppercase text-neutral-500">Pasos recomendados</h3>
                <ol className="mt-3 space-y-3">
                  {guide.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-neutral-700">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ef6f61]/12 text-xs font-bold text-[#b94439]">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {guide.tips?.length ? (
                <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-amber-950">Consejo operativo</h3>
                  <div className="mt-2 space-y-2 text-sm leading-6 text-amber-900">
                    {guide.tips.map((tip) => (
                      <p key={tip}>{tip}</p>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <h3 className="text-sm font-semibold text-neutral-900">Para mostrarle al cliente</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Abri la guia completa para ver el recorrido diario, modulos disponibles y checklist de demo.
                </p>
              </section>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                Cerrar
              </button>
              <Link
                to="/guia"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Ver guia completa
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
