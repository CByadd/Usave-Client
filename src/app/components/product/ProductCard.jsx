"use client";

import React, { useState, useEffect } from "react";

import { Heart, ShoppingCart, Search, ShoppingBag } from "lucide-react";

import { useCart } from "../../stores/useCartStore";

import { useWishlist } from "../../stores/useWishlistStore";

import { openCartDrawer } from "../../lib/ui";

import { useRouter } from "next/navigation";

import QuickViewModal from "./QuickViewModal";

const ItemCard = ({ item, product, variant = 'carousel' }) => {

  const router = useRouter();

  const { addToCart, isInCart, isLoading: isCartLoading } = useCart();

  const { toggleWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();

  const [showQuickView, setShowQuickView] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check if mounted to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Support both 'item' and 'product' props for flexibility
  const productItem = item || product;

  // Early return if no product data
  if (!productItem) {
    return null;
  }

  const rawOriginalPrice = Number(
    productItem.originalPrice ?? productItem.price ?? productItem.discountedPrice ?? 0
  );
  const rawDiscountedPrice = Number(
    productItem.discountedPrice ?? productItem.price ?? productItem.originalPrice ?? 0
  );
  const originalPrice = Number.isFinite(rawOriginalPrice) ? rawOriginalPrice : 0;
  const discountedPrice = Number.isFinite(rawDiscountedPrice) ? rawDiscountedPrice : 0;
  const hasDiscount = discountedPrice < originalPrice - 0.01;
  const displayPrice = hasDiscount ? discountedPrice : originalPrice;

  // Calculate stock status
  const stockQuantity = productItem.stockQuantity ?? productItem.stock ?? 0;
  const inStock = productItem.inStock !== false && productItem.inStock !== null;
  const hasStock = inStock && stockQuantity > 0;

  const goToProduct = () => router.push(`/products/${productItem.id}`);

  

  const handleWishlistToggle = async (e) => {

    console.log('[ProductCard] handleWishlistToggle clicked - item:', productItem?.id, productItem?.title);

    if (e) {

      e.preventDefault();

      e.stopPropagation();

    }

    try {

      const result = await toggleWishlist(productItem);

      console.log('[ProductCard] handleWishlistToggle - result:', result);

    } catch (error) {

      console.error('[ProductCard] Wishlist error:', error);

    }

  };

  const quickShop = async (e) => {
    console.log('[ProductCard] quickShop clicked - item:', productItem?.id, productItem?.title);

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Check stock before adding to cart
    if (!hasStock) {
      console.warn('[ProductCard] Cannot add out of stock item to cart');
      return;
    }
    
    try {
      const result = await addToCart(productItem, 1);
      console.log('[ProductCard] quickShop - addToCart result:', result);

      if (result?.success) {
        router.push('/cart');
      } else if (result?.error) {
        console.error('[ProductCard] Quick shop error:', result.error);
      }
    } catch (error) {
      console.error('[ProductCard] Quick shop error:', error);
    }
  };

  const handleAddToCart = (e) => {
    console.log('[ProductCard] handleAddToCart clicked - item:', productItem?.id, productItem?.title);

    if (!e) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Check stock before opening quick view
    if (!hasStock) {
      console.warn('[ProductCard] Cannot add out of stock item to cart');
      return;
    }
    
    // Open Quick View Modal to configure options before adding to cart
    setShowQuickView(true);
  };

  // Determine classes based on variant

  const containerClasses = variant === 'grid'
    ? "group relative bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full w-full"
    : "group min-w-[85vw] sm:min-w-[calc(50%-0.75rem)] md:min-w-0 w-[85vw] sm:w-[45vw] md:w-[28dvw] snap-center relative flex flex-col items-center overflow-visible rounded-[32px] mb-5 max-h-[400px] border border-gray-200 bg-white shadow-sm";
  
  
  

  const imageContainerClasses = variant === 'grid'

    ? "relative flex aspect-[4/3] items-center justify-center w-full overflow-hidden bg-gradient-to-br from-white/80 to-white/40 p-6"

    : "relative flex aspect-[4/3] items-center justify-center w-full rounded-[32px] cursor-pointer overflow-hidden bg-gradient-to-br from-white/80 to-white/40 p-6";

  return (

    <div className={variant === 'grid' ? 'w-full h-full flex flex-col' : 'relative'}>
      <div

        className={containerClasses}

        style={variant === 'carousel' && productItem.bg ? { backgroundColor: productItem.bg } : {}}

      >

        {variant === 'grid' ? (

          <>

        {/* Wishlist icon for grid */}

            <button

              onClick={handleWishlistToggle}

          disabled={isWishlistLoading}

          aria-label={isInWishlist(productItem.id) ? "Remove from wishlist" : "Add to wishlist"}

              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition z-10 cursor-pointer"

              type="button"

            >

          <Heart size={20} className={isInWishlist(productItem.id) ? "fill-red-500 text-red-500" : ""} />

            </button>

      </>

    ) : (

      <div className="w-full flex items-center justify-center flex-col relative" >
        {/* Top seller badge for carousel */}
        {productItem.topSeller && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            Top seller
          </div>
        )}

        {/* Wishlist icon for carousel */}

            <button

              onClick={handleWishlistToggle}

          disabled={isWishlistLoading}

          aria-label={isInWishlist(productItem.id) ? "Remove from wishlist" : "Add to wishlist"}

              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50 z-10 cursor-pointer"

              type="button"

            >

          {isInWishlist(productItem.id) ? (

                <Heart size={22} className="fill-red-500 text-red-500" />

              ) : (

                <Heart size={22} />

              )}

            </button>
            
        

        {/* Image Section for carousel */}

        <div

            onClick={goToProduct}

            className={imageContainerClasses}

            style={productItem.bg ? { backgroundColor: productItem.bg } : {}}

          >

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-white/70">
              {productItem.image ? (
                <img
                  src={productItem.image}
                  alt={productItem.title}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="text-sm text-gray-500">No image</div>
              )}
            </div>
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

          {productItem.badge && (

            <div className={`absolute top-3 left-3 ${productItem.badgeColor || 'bg-pink-600'} text-white text-xs font-semibold px-3 py-1 rounded z-10`}>

              {productItem.badge}

            </div>

          )}

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-white/70 p-6">
              {productItem.image ? (
                <img
                  src={productItem.image}
                  alt={productItem.title}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="text-sm text-gray-500">No image</div>
              )}
            </div>
          </div>

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

      <div className={variant === 'grid' ? "p-4 flex flex-col flex-1 bg-white/95" : "w-full bg-white/95 flex flex-col flex-1"}>

     <div className={variant === 'grid' ? "flex flex-col flex-1 gap-3" : "p-3 flex flex-col flex-1 gap-3"}>

           <h3 onClick={goToProduct} className={`${variant === 'grid' ? 'text-base mb-0' : 'mt-0'} font-semibold text-gray-900 cursor-pointer line-clamp-2 leading-snug`}>{productItem.title}</h3>

        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3 shadow-sm ${variant === 'grid' ? 'mb-0' : 'mt-0'}`}>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Price</p>
            <div className="flex items-baseline gap-1.5">
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xl font-semibold text-gray-900">
                ${displayPrice.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Stock</p>
            <div className="flex items-center justify-end gap-1.5 text-xs">
              <div className={`h-2 w-2 rounded-full ${hasStock ? "bg-emerald-500" : "bg-rose-500"}`}></div>
              <span className={hasStock ? "text-emerald-600" : "text-rose-600"}>
                {hasStock 
                  ? stockQuantity > 0 
                    ? `${stockQuantity} available`
                    : "In stock"
                  : "Out of stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Ratings */}

        <div className={`flex items-center gap-1 text-amber-500 text-xs ${variant === 'grid' ? 'mb-0' : 'mt-0'}`}>

          {[...Array(5)].map((_, i) => (

            <span key={i}>{i < Math.floor(productItem.rating || 0) ? '★' : '☆'}</span>

          ))}

          <span className="text-[10px] text-gray-500 ml-1">({productItem.reviews || 0})</span>

        </div>

          </div>

        {/* Buttons */}

        <div className={`flex gap-1.5 mt-auto flex-shrink-0 ${variant === 'grid' ? '' : 'flex-col sm:flex-row'}`}>

          {variant === 'grid' ? (

            <>

              <button

                type="button"

                onClick={(e) => {

                  e.preventDefault();

                  e.stopPropagation();

                  setShowQuickView(true);

                }}

                className="flex-1 rounded-full border border-gray-200 bg-white text-gray-700 h-8 p-0 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100"

              >

                <Search size={16} />

              </button>

            <button

                type="button"

                onClick={(e) => {

                  e.preventDefault();

                  e.stopPropagation();

                  handleAddToCart(e);

                }}

                disabled={!hasStock}

                className={`flex-1 rounded-full text-white h-8 p-0 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${

                  !hasStock 

                    ? 'bg-gray-400 cursor-not-allowed' 

                    : isMounted && isInCart(productItem.id) 

                      ? 'bg-green-600' 

                      : 'bg-[#0B4866]'

                }`}

              >

                <ShoppingCart size={16} />

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

                disabled={!hasStock}
                className="flex-1 border rounded-full py-2 flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm"

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

                disabled={!hasStock}

                className={`flex flex-1 rounded-full py-2 items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm ${

                  !hasStock 

                    ? 'bg-gray-400 cursor-not-allowed text-white' 

                    : isMounted && isInCart(productItem.id) 

                      ? 'bg-green-600 text-white' 

                      : 'bg-[#0B4866] text-white'

                }`}

              >

                <ShoppingCart size={16} />

                        {!hasStock ? 'Out of Stock' : isMounted && isInCart(productItem.id) ? 'In Cart' : 'Add to cart'}

            </button>

            </>

          )}

        </div>

      </div>
      
    {/* Quick View Modal */}

        <QuickViewModal

          product={productItem}

      isOpen={showQuickView}

          onClose={() => setShowQuickView(false)}

        />

    </div>

  );

};

export default ItemCard;
