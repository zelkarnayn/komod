import { WhatsAppButton } from '@/features/ask-in-whatsapp';
import { SITE } from '@/shared/config';
import { build2GisRouteUrl, buildYandexMapEmbedUrl, buildYandexRouteUrl } from '@/shared/lib';
import { ButtonLink, Section } from '@/shared/ui';
import styles from './contacts.module.css';

/** Ссылки маршрута открываются в новой вкладке, на телефоне — в приложении карт. */
const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** Контакты, карта и кнопки маршрута до шоурума. */
export function Contacts() {
  return (
    <Section id="contacts" tone="deep">
      <div className={styles.grid}>
        <div>
          <h2 className={styles.title}>Ответим в WhatsApp</h2>
          <div className={styles.row}>
            <strong>Шоурум</strong>
            {SITE.addressText}
            <a className={styles.orgLink} href={`https://yandex.ru/maps/org/${SITE.yandexOrgId}/`} {...EXTERNAL}>
              Фото и отзывы на Яндекс Картах
            </a>
          </div>
          <div className={styles.row}>
            <strong>Часы работы</strong>
            {SITE.workHours}
          </div>
          <WhatsAppButton message="Здравствуйте! Хочу задать вопрос по мебели.">Написать в WhatsApp</WhatsAppButton>
        </div>
        <div>
          <iframe
            className={styles.map}
            src={buildYandexMapEmbedUrl(SITE.location)}
            title={`Шоурум на карте: ${SITE.addressText}`}
            loading="lazy"
            allowFullScreen
          />
          <div className={styles.routes}>
            <span className={styles.routesLabel}>Построить маршрут:</span>
            <ButtonLink variant="outline" href={buildYandexRouteUrl(SITE.location)} {...EXTERNAL}>
              Яндекс Карты
            </ButtonLink>
            <ButtonLink variant="outline" href={build2GisRouteUrl(SITE.twoGis.point, SITE.twoGis.firmId)} {...EXTERNAL}>
              2ГИС
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
