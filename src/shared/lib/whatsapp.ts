/**
 * Собирает ссылку wa.me с заранее заполненным текстом сообщения.
 * @param phone - номер только из цифр, с кодом страны
 * @param message - текст, который появится в поле ввода у клиента
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
