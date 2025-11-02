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
// import name from './../components/product/ProductCard.jsx';
export default function LandingPage() {
  return (
    <div className=' flex flex-col items-center justify-center mx-auto '>
   <div className="w-[90dvw] overflow-hidden">
       <HeroSection/>


      {/* Explore By Category */}
      <section className='w-full mt-20 mb-20'>
        <CategoryHeader title="Explore by Category" buttonText="Explore All" buttonLink="/living-room"/>
        <CategoryCarousel/>
      </section>

   </div>

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

<section className='w-[90dvw] mt-20 mb-20'>
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

<section className="w-[90dvw] h-screen mx-auto mt-20 mb-20 overflow-hidden">
  <CategoryHeader
    title="Get the inspiration ones"
    buttonText="See All Products"
    buttonLink="/living-room"
    disableButton={true}
  />

  {/* Image Row */}
  <div className="flex gap-6">
    {[
      "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264124/Usave/unsplash_DhFHtkECn7Q_lplnxw.jpg",
      "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264124/Usave/unsplash_reuIAvaxUMk_faofll.jpg",
      "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264124/Usave/unsplash_WUC_u5yoD2w_ru05gd.jpg",
    ].map((src, index) => (
      <div key={index} className="w-1/3 h-[90dvh]">
        <Image
          src={src}
          alt={`Design Style ${index + 1}`}
          width={1920}
          height={1080}
          className="w-full h-full object-cover rounded-3xl"
        />
      </div>
    ))}
  </div>
</section>


<section className="w-[99dvw] mt-20 mb-20 relative overflow-hidden">
  <div className="relative w-full">
    <Image
      src="https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264173/Usave/unsplash_c0JoR_-2x3E_v543gf.jpg"
      alt="Newsletter"
      width={1920}
      height={400}
      className="w-full h-[400px] object-cover"
    />

    {/* Overlay text centered on the image */}
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white px-6">
      <h2 className="text-[4rem] font-normal mb-3 text-center font-serifx">
       Loved by 1000+ Business
      </h2>
     
    </div>
  </div>

  <InfoBanner />
</section>


    </div>
  )
}








