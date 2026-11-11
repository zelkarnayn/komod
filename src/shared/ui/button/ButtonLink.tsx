import type { AnchorHTMLAttributes } from 'react';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'outline';

/**
 * Возвращает CSS-класс кнопки. Нужен, чтобы оформить как кнопку и обычную ссылку,
 * и `Link` из роутера, не дублируя стили.
 * @param variant - вид кнопки
 */
export function buttonClassName(variant: ButtonVariant = 'primary'): string {
  return `${styles.button} ${styles[variant]}`;
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
}

/** Ссылка, оформленная как кнопка. */
export function ButtonLink({ variant = 'primary', className, ...rest }: ButtonLinkProps) {
  const classes = className ? `${buttonClassName(variant)} ${className}` : buttonClassName(variant);
  return <a className={classes} {...rest} />;
}
