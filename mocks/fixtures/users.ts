// ─────────────────────────────────────────────
// Seed users — matches spec §2
// Credentials are matched client-side; password is
// stored in plaintext on purpose because this is a
// demo with fabricated data only.
// ─────────────────────────────────────────────

export type DemoRole = 'resident' | 'clerk' | 'both';

export interface DemoUser {
  id: string;
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: DemoRole;
  /** Where to route after login. Dual-role sees chooser first. */
  redirect: '/portal/dashboard' | '/erp/dashboard' | '/choose-role';
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u_tendai',
    email: 'tendai@demo.bikita',
    phone: '+263771234567',
    password: 'Demo1234',
    fullName: 'Tendai Moyo',
    role: 'resident',
    redirect: '/portal/dashboard',
  },
  {
    id: 'u_clerk',
    email: 'clerk@demo.bikita',
    phone: '+263772345678',
    password: 'Demo1234',
    fullName: 'Mai Moyo',
    role: 'clerk',
    redirect: '/erp/dashboard',
  },
  {
    id: 'u_both',
    email: 'both@demo.bikita',
    phone: '+263773456789',
    password: 'Demo1234',
    fullName: 'Rutendo Chari',
    role: 'both',
    redirect: '/choose-role',
  },
];

export function findDemoUser(identifier: string, password: string): DemoUser | null {
  const lower = identifier.trim().toLowerCase();
  return (
    DEMO_USERS.find(
      (u) =>
        (u.email.toLowerCase() === lower || u.phone === identifier.trim()) &&
        u.password === password,
    ) ?? null
  );
}
