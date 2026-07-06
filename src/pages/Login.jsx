import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer.jsx';
import { isDemoMode } from '../lib/api';

export default function Login() {
  const demoMode = isDemoMode();
  const [email, setEmail] = useState(demoMode ? 'demo@supercheck.local' : '');
  const [password, setPassword] = useState(demoMode ? 'demo' : '');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendOk, setBackendOk] = useState(true);

  const appName =
    window.localStorage.getItem('supermercado_pos_app_name') ||
    import.meta.env.VITE_APP_NAME ||
    'SuperCheck';
  const appTagline =
    window.localStorage.getItem('supermercado_pos_app_tagline') ||
    'Gestion de caja y stock';
  const footerName =
    window.localStorage.getItem('supermercado_pos_footer_legal_name') ||
    import.meta.env.VITE_COMPANY_LEGAL ||
    appName;

  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();

  const params = new URLSearchParams(loc.search || '');
  const nextParam = params.get('next');
  const from = nextParam || loc.state?.from?.pathname || '/';

  useEffect(() => {
    if (demoMode) {
      setBackendOk(true);
      return undefined;
    }
    (async () => {
      try {
        const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const pingUrl = `${base}/api/ping/`;
        const res = await fetch(pingUrl, {
          method: 'GET',
          credentials: 'omit',
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Ping failed: ${res.status}`);
        setBackendOk(true);
      } catch {
        setBackendOk(false);
      }
    })();
  }, [demoMode]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      nav(from, { replace: true });
    } catch (error) {
      const msg = error?.message || 'Credenciales inválidas';
      if (!backendOk) {
        setErr('Backend no disponible en /api. Verificá que la API esté levantada y accesible en esta URL.');
      } else {
        setErr(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-6xl items-center px-4 py-8">
        <div className="grid w-full gap-5 lg:grid-cols-[1.1fr_1fr]">
          <section className="hidden rounded-lg border border-neutral-200 bg-[#111111] p-8 text-neutral-50 shadow-xl lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex rounded-lg border border-white/10 px-4 py-3 text-sm font-bold uppercase">
                {appName}
              </div>
              <h1 className="text-3xl font-bold leading-tight">{appName}</h1>
              <p className="max-w-md text-sm leading-relaxed text-neutral-300">
                Caja agil, stock confiable por producto y operacion preparada para supermercado.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-neutral-200">
              Acceso para admin, encargados, cajeros y deposito.
            </div>
          </section>

          <section className="card rounded-lg p-6 md:p-8">
            <div className="mb-5 rounded-lg bg-black p-3">
              <div className="text-center text-sm font-bold uppercase text-white">
                {appName}
              </div>
            </div>

            {!backendOk && !demoMode ? (
              <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800">
                Backend no disponible.
              </div>
            ) : null}

            {demoMode ? (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-2 text-sm text-blue-800">
                Modo demo web: los cambios quedan guardados en este navegador.
              </div>
            ) : null}

            <h2 className="h1 mb-1">Ingreso al sistema</h2>
            <p className="mb-5 text-sm text-neutral-500">{appTagline}</p>

            <form className="space-y-3" onSubmit={onSubmit}>
              <div>
                <label className="label" htmlFor="email">Usuario</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="Usuario o email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {err ? (
                <div className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700">
                  {err}
                </div>
              ) : null}

              <button className="btn w-full" type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Entrar'}
              </button>

              <Link to="/recuperar" className="inline-block text-sm font-semibold text-[#d9584b] hover:text-[#be4c41]">
                ¿Olvidaste tu contraseña?
              </Link>
            </form>
          </section>
        </div>
      </main>

      <Footer legalName={footerName} />
    </div>
  );
}
