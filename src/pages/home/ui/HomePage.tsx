import { Contacts } from '@/widgets/contacts';
import { FeaturedProducts } from '@/widgets/featured-products';
import { Hero } from '@/widgets/hero';
import { RoomCategories } from '@/widgets/room-categories';
import { Services } from '@/widgets/services';
import { ShowroomInfo } from '@/widgets/showroom-info';
import { SolutionsTeaser } from '@/widgets/solutions-list';

/** Главная страница. */
export function HomePage() {
  return (
    <>
      <Hero />
      <SolutionsTeaser />
      <RoomCategories />
      <FeaturedProducts />
      <ShowroomInfo />
      <Services />
      <Contacts />
    </>
  );
}
