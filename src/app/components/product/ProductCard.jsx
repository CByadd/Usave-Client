"use client";

import React, { useState } from "react";

import { Heart, ShoppingCart, Search, ShoppingBag } from "lucide-react";

import { useCart } from "../../stores/useCartStore";

import { useWishlist } from "../../stores/useWishlistStore";

import { openCartDrawer } from "../../lib/ui";

import { useRouter } from "next/navigation";

import QuickViewModal from "./QuickViewModal";

import OptimizedImage from "../shared/OptimizedImage";

const ItemCard = ({ item, variant = 'carousel' }) => {

  const router = useRouter();

  const { addToCart, isInCart, isLoading: isCartLoading } = useCart();

  const { toggleWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();

  const [showQuickView, setShowQuickView] = useState(false);

  

  const goToProduct = () => router.push(`/products/${item.id}`);

  

  const handleWishlistToggle = async (e) => {

    console.log('[ProductCard] handleWishlistToggle clicked - item:', item?.id, item?.title);

    if (e) {

      e.preventDefault();

      e.stopPropagation();

    }

    try {

      const result = await toggleWishlist(item);

      console.log('[ProductCard] handleWishlistToggle - result:', result);

    } catch (error) {

      console.error('[ProductCard] Wishlist error:', error);

    }

  };

  const quickShop = async (e) => {

    console.log('[ProductCard] quickShop clicked - item:', item?.id, item?.title);

    if (e) {

      e.preventDefault();

      e.stopPropagation();

    }

    try {

      const result = await addToCart(item, 1);

      console.log('[ProductCard] quickShop - addToCart result:', result);

      if (result?.success) {

        router.push('/cart');

      }

    } catch (error) {

      console.error('[ProductCard] Quick shop error:', error);

    }

  };

  const handleAddToCart = async (e) => {

    console.log('[ProductCard] handleAddToCart clicked - item:', item?.id, item?.title);

    if (!e) return;

    

    e.preventDefault();

    e.stopPropagation();

    

    try {

      const result = await addToCart(item, 1);

      console.log('[ProductCard] handleAddToCart - addToCart result:', result);

      if (result?.success) {

        // Open cart drawer

        openCartDrawer();

        console.log('[ProductCard] handleAddToCart - openCartDrawer called');

      }

    } catch (error) {

      console.error('[ProductCard] Add to cart error:', error);

    }

  };

  // Determine classes based on variant

  const containerClasses = variant === 'grid' 

    ? "group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full max-h-[300px]"

    : "group min-w-[calc(50%-0.5rem)] sm:min-w-[calc(50%-0.75rem)] md:min-w-0 w-[48vw] sm:w-[45vw] md:w-[28dvw] snap-center relative transition flex flex-col items-center overflow-visible rounded-b-4xl mb-5 max-h-[400px]";

  

  const imageContainerClasses = variant === 'grid'

    ? "relative bg-gray-50 p-6 aspect-square flex items-center justify-center"

    : "relative flex justify-center items-center w-full h-[250px] sm:h-[300px] rounded-2xl cursor-pointer overflow-hidden";

  return (

    <div>

   {item.topSeller && variant === 'carousel' && (

        <div className="absolute top-[-12px] left-6 bg-pink-600 text-white text-xs font-semibold px-2 py-1">

          Top seller

        </div>

      )}

 <div

  className={containerClasses}

  style={variant === 'carousel' ? { backgroundColor: item.bg } : {}}

>

    {variant === 'grid' ? (

      <>

        {/* Wishlist icon for grid */}

        <button

          onClick={handleWishlistToggle}

          disabled={isWishlistLoading}

          aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}

          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition z-10"

        >

          <Heart size={20} className={isInWishlist(item.id) ? "fill-red-500 text-red-500" : ""} />

        </button>

      </>

    ) : (

      <div className="w-full flex items-center justify-center flex-col relative" >

        {/* Wishlist icon for carousel */}

        <button

          onClick={handleWishlistToggle}

          disabled={isWishlistLoading}

          aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}

          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"

        >

          {isInWishlist(item.id) ? (

            <Heart size={22} className="fill-red-500 text-red-500" />

          ) : (

            <Heart size={22} />

          )}

        </button>

        

        {/* Image Section for carousel */}

        <div

          onClick={goToProduct}

          className={imageContainerClasses}

          style={item.bg ? { backgroundColor: item.bg } : { backgroundColor: '#f9fafb' }}

        >

          <div className="relative w-full h-full flex justify-center items-center">

            <OptimizedImage

              src={item.image}

              alt={item.title}

              width={280}

              height={280}

              className="object-contain max-h-full max-w-full rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-105"

            />

          </div>

        </div>

      </div>

    )}

      {/* Image Section for grid */}

      {variant === 'grid' && (

        <div

          onClick={goToProduct}

          className={imageContainerClasses}

        >

          {item.badge && (

            <div className={`absolute top-3 left-3 ${item.badgeColor || 'bg-pink-600'} text-white text-xs font-semibold px-3 py-1 rounded z-10`}>

              {item.badge}

            </div>

          )}

          <OptimizedImage

            src={item.image}

            alt={item.title}

            width={300}

            height={300}

            className="object-contain max-h-[300px] w-[300px]"

          />

          <button

            onClick={(e) => {

              e.stopPropagation();

              setShowQuickView(true);

            }}

            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-lg"

          >

            <Search size={16} />

            Quick View

          </button>

        </div>

      )}

      {/* Quick View Button - Only for carousel variant */}

      {variant === 'carousel' && (

        <button

          onClick={(e) => {

            e.stopPropagation();

            setShowQuickView(true);

          }}

          className="w-[80%] sm:w-[70%] mt-3 mb-4 h-[44px] sm:h-[50px] py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 bg-white border-0"

        >

          <Search size={16} />

          Quick View

        </button>

      )}

    </div>

      {/* Product Info */}

      <div className={variant === 'grid' ? "p-4 flex flex-col flex-1" : "w-full bg-white flex flex-col flex-1"}>

     <div className={variant === 'grid' ? "flex flex-col flex-1" : "p-3 flex flex-col flex-1"}>

           <h3 onClick={goToProduct} className={`${variant === 'grid' ? 'text-base mb-2' : 'mt-3'} font-medium text-gray-800 hover:text-[#0B4866] cursor-pointer line-clamp-2 min-h-[2.5rem]`}>{item.title}</h3>

        <div className={`${variant === 'grid' ? 'gap-2 mb-2' : 'mt-1'} flex items-center ${variant === 'grid' ? '' : 'text-sm text-gray-600'}`}>

          <span className="text-gray-500 line-through mr-2 text-sm">${(item.originalPrice || item.price || 0).toFixed(2)}</span>

          <span className={`${variant === 'grid' ? 'text-xl' : 'text-xl'} font-semibold text-gray-900`}>

            ${(item.discountedPrice || item.price || 0).toFixed(2)}

          </span>

        </div>

        {/* Ratings */}

        <div className={`flex items-center gap-1 ${variant === 'grid' ? 'mb-2' : 'mt-1'} text-yellow-500 text-sm`}>

          {[...Array(5)].map((_, i) => (

            <span key={i}>{i < Math.floor(item.rating || 0) ? '★' : '☆'}</span>

          ))}

          <span className="text-gray-500 text-xs ml-1">({item.reviews || 0})</span>

        </div>

        {/* Stock Status */}

        <div className={`flex items-center gap-2 ${variant === 'grid' ? 'mb-3' : 'mt-2'} flex-shrink-0`}>

          <div

            className={`h-2 w-2 rounded-full ${

              item.inStock !== false ? "bg-green-500" : "bg-red-500"

            }`}

          ></div>

          <span className="text-sm text-gray-600">

            {item.inStock !== false ? "In Stock" : "Out of Stock"}

          </span>

        </div>

     </div>

        {/* Buttons */}

        <div className={`flex ${variant === 'grid' ? 'gap-2 mt-auto' : 'gap-3 mt-auto'} flex-shrink-0`}>

          {variant === 'grid' ? (

            <>

              <button

                type="button"

                onClick={(e) => {

                  e.preventDefault();

                  e.stopPropagation();

                  quickShop(e);

                }}

                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer"

              >

                <Search size={16} />

                Quick Shop

              </button>

              <button 

                type="button"

                onClick={(e) => {

                  e.preventDefault();

                  e.stopPropagation();

                  handleAddToCart(e);

                }}

                disabled={item.inStock === false}

                className={`flex-1 py-2.5 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${

                  item.inStock === false 

                    ? 'bg-gray-400 cursor-not-allowed' 

                    : isInCart(item.id) 

                      ? 'bg-green-600 hover:bg-green-700' 

                      : 'bg-[#0B4866] hover:bg-[#094058]'

                }`}

              >

                <ShoppingCart size={16} />

                {item.inStock === false ? 'Out of Stock' : isInCart(item.id) ? 'In Cart' : 'Add to cart'}

              </button>

            </>

          ) : (

            <>

              <button

                type="button"

                onClick={(e) => {

                  e.preventDefault();

                  e.stopPropagation();

                  quickShop(e);

                }}

                className="flex-1 border rounded-4xl py-3 flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer"

              >

                <ShoppingBag size={16} />

                Quick Shop

              </button>

              <button 

                type="button"

                onClick={(e) => {

                  e.preventDefault();

                  e.stopPropagation();

                  handleAddToCart(e);

                }}

                disabled={item.inStock === false}

                className={`md:hidden hidden lg:flex flex-1 rounded-4xl py-2 items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${

                  item.inStock === false 

                    ? 'bg-gray-400 cursor-not-allowed text-white' 

                    : isInCart(item.id) 

                      ? 'bg-green-600 hover:bg-green-700 text-white' 

                      : 'bg-blue-900 hover:bg-blue-800 text-white'

                }`}

              >

                <ShoppingCart size={16} />

                {item.inStock === false ? 'Out of Stock' : isInCart(item.id) ? 'In Cart' : 'Add to cart'}

              </button>

            </>

          )}

        </div>

      </div>

    {/* Quick View Modal */}

    <QuickViewModal 

      product={item}

      isOpen={showQuickView}

      onClose={() => setShowQuickView(false)}

    />

    </div>

  );

};

export default ItemCard;
