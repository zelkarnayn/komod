import type { Product } from '@/entities/product';
import { WhatsAppButton } from './WhatsAppButton';

interface AskAboutProductButtonProps {
  product: Pick<Product, 'id' | 'name'>;
}

/** «Уточнить в WhatsApp»: в сообщение сразу подставляются название и артикул товара. */
export function AskAboutProductButton({ product }: AskAboutProductButtonProps) {
  const message = `Здравствуйте! Интересует «${product.name}» (арт. ${product.id}). Подскажите, пожалуйста, по наличию и срокам.`;
  return <WhatsAppButton message={message}>Уточнить в WhatsApp</WhatsAppButton>;
}
