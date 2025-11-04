"use client";
import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Search, ShoppingBag } from "lucide-react";
import { addToCart, fetchCart, getCartItems } from "../../lib/cart";
import { toggleWishlist, fetchWishlist, getWishlistItems } from "../../lib/wishlist";
import { openCartDrawer, showToast } from "../../lib/ui";
import { useRouter } from "next/navigation";
import QuickViewModal from "./QuickViewModal";
import OptimizedImage from "../shared/OptimizedImage";

const ItemCard = ({ item, variant = 'carousel' }) => {
  const router = useRouter();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load wishlist and cart status once on mount
    let mounted = true;
    const loadStatus = async () => {
      try {
        await Promise.all([fetchWishlist(), fetchCart()]);
        if (mounted) {
          setWishlistItems(getWishlistItems());
          setCartItems(getCartItems());
        }
      } catch (err) {
        console.error('Error loading status:', err);
      }
    };
    loadStatus();
    return () => { mounted = false; };
  }, []); // Only run once on mount

  const goToProduct = () => router.push(`/products/${item.id}`);

  const handleWishlistToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsAddingToWishlist(true);
    try {
      const result = await toggleWishlist(item);
      if (result?.success) {
        // Refresh wishlist data
        const items = await fetchWishlist();
        setWishlistItems(items);
        showToast('Wishlist updated', 'success');
      } else if (result?.error) {
        showToast(result.error, 'error');
      }
    } catch (error) {
      console.error('[ProductCard] Wishlist error:', error);
      showToast(error.message || 'Failed to update wishlist', 'error');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const quickShop = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (item.inStock === false) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    try {
      const productId = item.id || item.productId;
      const result = await addToCart(productId, 1);
      if (result?.success) {
        // Refresh cart data
        const { items } = await fetchCart();
        setCartItems(items);
        router.push('/cart');
      } else if (result?.error) {
        showToast(result.error, 'error');
      }
    } catch (error) {
      console.error('[ProductCard] Quick shop error:', error);
      showToast(error.message || 'Failed to add item to cart', 'error');
    }
  };

  const handleAddToCart = async (e) => {
    if (!e) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (item.inStock === false) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    try {
      const productId = item.id || item.productId;
      const result = await addToCart(productId, 1);
      if (result?.success) {
        // Refresh cart data
        const { items } = await fetchCart();
        setCartItems(items);
        openCartDrawer();
        showToast('Item added to cart', 'success');
      } else if (result?.error) {
        showToast(result.error, 'error');
      }
    } catch (error) {
      console.error('[ProductCard] Add to cart error:', error);
      showToast(error.message || 'Failed to add item to cart', 'error');
    }
  };

  const isInWishlist = wishlistItems.some(w => w.productId === item.id || w.product?.id === item.id);
  const isInCart = cartItems.some(c => c.productId === item.id || c.product?.id === item.id);

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
            <button
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition z-10"
            >
              <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center flex-col relative">
            <button
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {isInWishlist ? (
                <Heart size={22} className="fill-red-500 text-red-500" />
              ) : (
                <Heart size={22} />
              )}
            </button>
            
            <div
              onClick={goToProduct}
              className={imageContainerClasses}
              style={item.bg ? { backgroundColor: item.bg } : { backgroundColor: '#f9fafb' }}
            >
              <OptimizedImage
                src={item.image}
                alt={item.title}
                width={300}
                height={300}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {variant === 'grid' && (
          <div
            onClick={goToProduct}
            className={imageContainerClasses}
            style={item.bg ? { backgroundColor: item.bg } : { backgroundColor: '#f9fafb' }}
          >
            <OptimizedImage
              src={item.image}
              alt={item.title}
              width={300}
              height={300}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="p-4 flex flex-col flex-grow">
          <h3 
            onClick={goToProduct}
            className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 line-clamp-2"
          >
            {item.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            {item.discountedPrice && item.discountedPrice < item.originalPrice ? (
              <>
                <span className="text-lg font-bold text-[#0B4866]">
                  ${item.discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${item.originalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-[#0B4866]">
                ${item.originalPrice?.toFixed(2) || '0.00'}
              </span>
            )}
          </div>

          <div className="mt-auto flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={item.inStock === false || isInCart}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                item.inStock === false
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isInCart
                  ? 'bg-green-500 text-white'
                  : 'bg-[#0B4866] text-white hover:bg-[#094058]'
              }`}
            >
              {item.inStock === false ? 'Out of Stock' : isInCart ? 'In Cart' : 'Add to cart'}
            </button>
            
            <button
              onClick={quickShop}
              disabled={item.inStock === false || isInCart}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                item.inStock === false
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isInCart
                  ? 'bg-green-500 text-white'
                  : 'bg-[#0B4866] text-white hover:bg-[#094058]'
              }`}
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {showQuickView && (
        <QuickViewModal
          product={item}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </div>
  );
};

export default ItemCard;
