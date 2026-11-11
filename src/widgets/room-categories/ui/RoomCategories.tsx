import { Link } from 'react-router-dom';
import { ROOMS, ROOM_LABELS, useProducts } from '@/entities/product';
import { ROUTES } from '@/shared/config';
import { pluralizeRu } from '@/shared/lib';
import { Section, SectionHeading } from '@/shared/ui';
import styles from './room-categories.module.css';

/** Каталог «по комнатам»: обложка комнаты берётся из первого товара в ней. */
export function RoomCategories() {
  const { data: products = [] } = useProducts();

  return (
    <Section>
      <SectionHeading title="Выберите комнату" lead="Мебель, свет и декор собраны по комнатам, чтобы было проще представить готовое решение." />
      <div className={styles.grid}>
        {ROOMS.map((room) => {
          const inRoom = products.filter((product) => product.room === room);
          const cover = inRoom[0]?.images[0];
          return (
            <Link key={room} to={`${ROUTES.catalog}?room=${room}`} className={styles.card}>
              {cover ? <img className={styles.image} src={cover} alt="" loading="lazy" /> : null}
              <div className={styles.shade} />
              <div className={styles.caption}>
                <h3 className={styles.name}>{ROOM_LABELS[room]}</h3>
                <p className={styles.count}>
                  {inRoom.length > 0 ? `${inRoom.length} ${pluralizeRu(inRoom.length, ['товар', 'товара', 'товаров'])}` : 'Скоро в каталоге'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
