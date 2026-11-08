import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger';
  loading?: boolean;
}

export function Button({ variant = 'default', loading = false, disabled, className, children, ...rest }: ButtonProps) {
  const classes = ['btn', variant !== 'default' && `btn--${variant}`, className].filter(Boolean).join(' ');
  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
