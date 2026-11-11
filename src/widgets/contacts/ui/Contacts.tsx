import { WhatsAppButton } from '@/features/ask-in-whatsapp';
import { SITE } from '@/shared/config';
import { Section } from '@/shared/ui';
import styles from './contacts.module.css';

/** Контакты и кнопка связи. TODO: вставить карту, когда будет известен адрес. */
export function Contacts() {
  return (
    <Section id="contacts" tone="deep">
      <div className={styles.grid}>
        <div>
          <h2 className={styles.title}>Ответим в WhatsApp</h2>
          <div className={styles.row}>
            <strong>Шоурум</strong>
            {SITE.addressText}
          </div>
          <div className={styles.row}>
            <strong>Часы работы</strong>
            {SITE.workHours}
          </div>
          <WhatsAppButton message="Здравствуйте! Хочу задать вопрос по мебели.">Написать в WhatsApp</WhatsAppButton>
        </div>
        <div className={styles.map}>Здесь будет карта</div>
      </div>
    </Section>
  );
}
