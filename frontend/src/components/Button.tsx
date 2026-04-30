import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ className, variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button className={clsx('button', `button-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}
