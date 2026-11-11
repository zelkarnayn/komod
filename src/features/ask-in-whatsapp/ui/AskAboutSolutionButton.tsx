import type { Solution } from '@/entities/solution';
import { WhatsAppButton } from './WhatsAppButton';

interface AskAboutSolutionButtonProps {
  solution: Pick<Solution, 'id' | 'name'>;
}

/** «Хочу такой интерьер»: в сообщение подставляются название и артикул комплекта. */
export function AskAboutSolutionButton({ solution }: AskAboutSolutionButtonProps) {
  const message = `Здравствуйте! Интересует готовое решение «${solution.name}» (арт. ${solution.id}). Подскажите по наличию, срокам и можно ли что-то заменить.`;
  return <WhatsAppButton message={message}>Хочу такой интерьер</WhatsAppButton>;
}
