import type { ReactNode } from 'react';
import { SITE } from '@/shared/config';
import { buildWhatsAppLink } from '@/shared/lib';
import { ButtonLink } from '@/shared/ui';
import type { ButtonVariant } from '@/shared/ui';

interface WhatsAppButtonProps {
  /** Текст сообщения, который появится у клиента в поле ввода */
  message: string;
  variant?: ButtonVariant;
  children: ReactNode;
}

/** Кнопка, открывающая чат салона в WhatsApp с готовым сообщением. */
export function WhatsAppButton({ message, variant = 'primary', children }: WhatsAppButtonProps) {
  return (
    <ButtonLink
      variant={variant}
      href={buildWhatsAppLink(SITE.whatsappPhone, message)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </ButtonLink>
  );
}
