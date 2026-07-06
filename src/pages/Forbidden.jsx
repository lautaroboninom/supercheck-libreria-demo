import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-xl text-center">
        <div className="mx-auto mb-5 inline-flex rounded-lg border border-neutral-200 bg-neutral-950 px-4 py-3 text-sm font-bold uppercase text-white">
          SuperCheck
        </div>
        <h1 className="h1 mb-2">Acceso denegado</h1>
        <p className="mb-6 text-sm text-neutral-600">
          No tenés permisos para acceder a esta sección.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link className="btn-secondary" to="/">Ir al inicio</Link>
          <Link className="btn" to="/login">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
