import { Contacts } from '@/widgets/contacts';
import { FeaturedProducts } from '@/widgets/featured-products';
import { usePageTitle } from '@/shared/lib';
import { Hero } from '@/widgets/hero';
import { RoomCategories } from '@/widgets/room-categories';
import { Services } from '@/widgets/services';
import { ShowroomInfo } from '@/widgets/showroom-info';
import { SolutionsTeaser } from '@/widgets/solutions-list';

/** Главная страница. */
export function HomePage() {
  usePageTitle();
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
