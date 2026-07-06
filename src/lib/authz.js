export const ROLES = {
  ADMIN: 'admin',
  ENCARGADO: 'encargado',
  CAJERO: 'cajero',
  REPOSITOR: 'repositor',
  AUDITOR: 'auditor',
  EMPLEADO: 'empleado',
};

export const normalizeRole = (r) => {
  const role = (r ?? '').toString().trim().toLowerCase();
  return role === ROLES.EMPLEADO ? ROLES.CAJERO : role;
};

export const hasAnyRole = (user, roles) => roles.includes(normalizeRole(user?.rol));

export const isAdmin = (u) => normalizeRole(u?.rol) === ROLES.ADMIN;
export const isEmpleado = (u) => normalizeRole(u?.rol) === ROLES.CAJERO;
