import type { HTMLAttributes } from 'react';
import styles from './container.module.css';

/** Центрирует содержимое и задаёт одинаковые боковые отступы на всех страницах. */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className ? `${styles.container} ${className}` : styles.container} {...rest} />;
}
