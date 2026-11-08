import type { ReactNode } from 'react';

export function Spinner() {
  return <div className="spinner" role="status" aria-label="Loading" />;
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'success' | 'info'; children: ReactNode }) {
  return <div className={`alert alert--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>;
}

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="row">{actions}</div>
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="card">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

export function StatusBadge({ active }: { active: boolean | null | undefined }) {
  return <span className={`badge ${active ? 'badge--ok' : 'badge--off'}`}>{active ? 'Active' : 'Inactive'}</span>;
}
