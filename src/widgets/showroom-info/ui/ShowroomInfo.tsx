import { SITE } from '@/shared/config';
import { ButtonLink, Section } from '@/shared/ui';
import styles from './showroom-info.module.css';

/** Блок про шоурум. TODO: добавить фото зала. */
export function ShowroomInfo() {
  return (
    <Section id="showroom">
      <div className={styles.grid}>
        <div className={styles.photo} role="img" aria-label="Здесь будет фото шоурума" />
        <div>
          <h2 className={styles.title}>Приезжайте посмотреть вживую</h2>
          <p className={styles.text}>
            Цвет и фактура дерева на фото и в комнате выглядят по-разному. В шоуруме собраны готовые сценарии, которые можно потрогать и примерить к своему дому.
          </p>
          <ButtonLink variant="outline" href="#contacts">
            Как нас найти
          </ButtonLink>
          <div className={styles.meta}>
            <div>
              <strong>Адрес</strong>
              {SITE.addressText}
            </div>
            <div>
              <strong>Часы работы</strong>
              {SITE.workHours}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
