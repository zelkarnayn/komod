import { Link } from 'react-router-dom';
import { WhatsAppButton } from '@/features/ask-in-whatsapp';
import { ROUTES, SITE } from '@/shared/config';
import { Container, buttonClassName } from '@/shared/ui';
import styles from './hero.module.css';

/** TODO: заменить на фото из шоурума, когда они будут готовы. */
const HERO_IMAGE = '/products/KM-004_room.jpg';

/** Первый экран главной страницы. */
export function Hero() {
  return (
    <Container className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>Салон интерьера, {SITE.city}</p>
        <h1 className={styles.title}>Дом собирается не по одной вещи</h1>
        <p className={styles.text}>
          Мебель, свет, текстиль и декор, которые с самого начала задуманы жить в одной комнате, а не подгоняются друг под друга после покупки.
        </p>
        <div className={styles.actions}>
          <WhatsAppButton message="Здравствуйте! Хочу подобрать интерьер.">Подобрать интерьер</WhatsAppButton>
          <Link to={ROUTES.catalog} className={buttonClassName('outline')}>
            Смотреть каталог
          </Link>
        </div>
      </div>
      <div className={styles.visual}>
        <img className={styles.image} src={HERO_IMAGE} alt="Буфет из светлого дерева на веранде" />
        <div className={styles.tag}>
          <strong>Буфет из светлого дерева</strong>Прованс, массив дерева
        </div>
      </div>
    </Container>
  );
}
