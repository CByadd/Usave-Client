import React from 'react'
import Hero from '../components/layouts/Hero'
import CatHeader from '../components/layouts/CatHeader'
import CategoryCarousel from '../components/layouts/CategoryCarousel'
import FullWCategory from '../components/layouts/FullWCategory'
import InfoCat from '../components/layouts/InfoCat'
import DesignCat from '../components/layouts/DesignCat'
import { Cat } from 'lucide-react'
import ItemCard from '../components/layouts/ItemCard'
import items from '../data/items.json';
import Aitems from '../data/Aitems.json';
import Bitems from '../data/Bitems.json';
import Info from '../components/Info'
import Image from 'next/image'
import { LandingPageSkeleton } from '../components/shared/LoadingSkeletons'

export default function LandingPage() {
  return (
    <div className=' flex flex-col items-center justify-center mx-auto '>
   <div className="w-[90dvw] overflow-hidden">
       <Hero/>


      {/* Explore By Category */}
      <section className='w-full mt-20 mb-20'>
        <CatHeader title="Living Room" buttonText="Explore All" buttonLink="/living-room"/>
        <CategoryCarousel/>
      </section>

   </div>

      {/* Explore By Category */}
      <section className='w-[99dvw] mt-20 mb-20 flex flex-col items-center justify-center overflow-hidden '>
        <div className="w-[90%]">
          <CatHeader title="Explore Product By Places" buttonText="See All Products" buttonLink="/living-room"/>
        </div>
       <div className="w-[99dvw] overflow-hidden">
        <FullWCategory/>
       <InfoCat/>
       </div>
      </section>

<section className='w-[90dvw] mt-20 mb-20'>
  <DesignCat/>
</section>

<section className='w-[90dvw] mt-20 mb-20 overflow-hidden'>
  <CatHeader title="Shop By Design Style" buttonText="See All Products" buttonLink="/living-room"/>
  <div className="flex gap-2 sm:gap-3 md:gap-14 w-full overflow-scroll">
     {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
  </div>
</section>


<section className='w-[90dvw] mt-20 mb-20 overflow-hidden'>
  <CatHeader title="Shop By Design Style" buttonText="See All Products" buttonLink="/living-room"/>
  <div className="flex gap-2 sm:gap-3 md:gap-14 w-full overflow-scroll">
     {Aitems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
  </div>
</section>



<section className='w-[90dvw] mt-20 mb-20 overflow-hidden'>
  <CatHeader title="Shop By Design Style" buttonText="See All Products" buttonLink="/living-room"/>
  <div className="flex gap-2 sm:gap-3 md:gap-14 w-full overflow-scroll">
     {Bitems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
  </div>
</section>

<section className="w-[90dvw] h-screen mx-auto mt-20 mb-20 overflow-hidden">
  <CatHeader
    title="Shop By Design Style"
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

  <Info />
</section>


    </div>
  )
}

