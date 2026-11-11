import { Section, SectionHeading } from '@/shared/ui';
import styles from './services.module.css';

/** TODO: уточнить у владелицы, какие услуги салон реально предоставляет. */
const SERVICES = [
  { name: 'Интерьерный проект', text: 'Подберём мебель, свет и декор под конкретное помещение и бюджет.' },
  { name: 'Доставка и сборка', text: 'Привезём и соберём на месте, включая крупную мебель.' },
  { name: 'Консультация в WhatsApp', text: 'Ответим на вопросы о товарах и поможем выбрать подходящий вариант.' },
] as const;

/** Блок услуг салона. */
export function Services() {
  return (
    <Section id="services">
      <SectionHeading title="Не только продажа" />
      <div className={styles.grid}>
        {SERVICES.map((service) => (
          <div key={service.name} className={styles.item}>
            <h3 className={styles.name}>{service.name}</h3>
            <p className={styles.text}>{service.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
