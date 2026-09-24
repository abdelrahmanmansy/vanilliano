import Hero from '../components/home/Hero'
import CategoryShowcase from '../components/home/CategoryShowcase'
import FeaturedProducts from '../components/home/FeaturedProducts'
import BestSellers from '../components/home/BestSellers'
import SpecialOffers from '../components/home/SpecialOffers'
import WhyUs from '../components/home/WhyUs'
import NewArrivals from '../components/home/NewArrivals'
import Stats from '../components/home/Stats'
import PromoBanner from '../components/home/PromoBanner'
import Testimonials from '../components/home/Testimonials'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <FeaturedProducts />
      <BestSellers />
      <SpecialOffers />
      <WhyUs />
      <NewArrivals />
      <Stats />
      <PromoBanner />
      <Testimonials />
    </>
  )
}