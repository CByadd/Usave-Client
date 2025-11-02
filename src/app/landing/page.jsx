import React from 'react'
import HeroSection from '../components/home/HeroSection'
import CategoryHeader from '../components/search/CategoryHeader'
import CategoryCarousel from '../components/home/CategoryCarousel'
import FullWidthCategory from '../components/home/FullWidthCategories'
import InfoSection from '../components/home/InfoSection'
import CategoryShowcase from '../components/home/CategoryShowcase'
import ProductCarousel from '../components/home/ProductCarousel'
import { Cat } from 'lucide-react'
import ItemCard from '../components/product/ProductCard'
import items from '../data/products.json';
import Aitems from '../data/featuredItemsA.json';
import Bitems from '../data/featuredItemsB.json';
import InfoBanner from '../components/shared/InfoBanner'
import Image from 'next/image'
import { LandingPageSkeleton } from '../components/shared/LoadingSkeleton'
import InspirationSection from '../components/home/InspirationSection'
// import name from './../components/product/ProductCard.jsx';
export default function LandingPage() {
  return (
    <div className=' flex flex-col items-center justify-center mx-auto '>
   <div className="md:w-[90dvw] w-full   overflow-hidden">
       <HeroSection/>
      {/* Explore By Category */}
   </div>

    <section className='w-[90dvw] overflow-hidden mt-20 mb-20'>
        <CategoryHeader title="Explore by Category" buttonText="Explore All" buttonLink="/living-room"/>
        <CategoryCarousel/>
      </section>

      {/* Explore By Category */}
      <section className='w-[99dvw] mt-20 mb-20 flex flex-col items-center justify-center overflow-hidden '>
        <div className="w-[90%]">
          <CategoryHeader title="Explore Product By Places" buttonText="See All Products" buttonLink="/living-room"/>
        </div>
       <div className="w-[99dvw] overflow-hidden">
        {/* <FullWCategory/> */}
        <FullWidthCategory/>
       <InfoSection/>
       </div>
      </section>

<section className='md:w-[90dvw] w-[100dvw] mt-20 mb-20'>
  <CategoryShowcase/>
</section>

<section className='w-[90dvw] mt-20 mb-20 overflow-hidden'>
  <CategoryHeader title="Living room needs" buttonText="See All Products" buttonLink="/living-room"/>
  <ProductCarousel>
     {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
  </ProductCarousel>
</section>


<section className='w-[90dvw] mt-20 mb-20 overflow-hidden'>
  <CategoryHeader title="Bedroom needs" buttonText="See All Products" buttonLink="/living-room"/>
  <ProductCarousel>
     {Bitems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
  </ProductCarousel>
</section>



<section className='w-[90dvw] mt-20 mb-20 overflow-hidden'>
  <CategoryHeader title="Kitchen needs" buttonText="See All Products" buttonLink="/living-room"/>
  <ProductCarousel>
     {Aitems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
  </ProductCarousel>
</section>

<InspirationSection/>



<section className="w-[99dvw] mt-20 mb-20 relative overflow-hidden">
  <div className="relative w-full">
    <Image
      src="https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264173/Usave/unsplash_c0JoR_-2x3E_v543gf.jpg"
      alt="Newsletter"
      width={1920}
      height={400}
      className="w-full h-[20dvh] md:h-[400px] object-cover"
    />

    {/* Overlay text centered on the image */}
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white px-6">
      <h2 className="md:text-[4rem]  text-[2rem] font-normal mb-3 text-center font-serifx">
       Loved by 1000+ Business
      </h2>
     
    </div>
  </div>

  <InfoBanner />
</section>


    </div>
  )
}








