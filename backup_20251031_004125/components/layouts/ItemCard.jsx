"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingCart, Search } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useUI } from "../../context/UIContext";
import { useRouter } from "next/navigation";
import { FiRrHeartIcon, FiRrShoppingBagIcon, FiRrShoppingCartAddWIcon } from "../icons";

const ItemCard = ({ item }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openCartDrawer } = useUI();
  const router = useRouter();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const goToProduct = () => router.push(`/products/${item.id}`);
  
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    setIsAddingToWishlist(true);
    await toggleWishlist(item);
    setIsAddingToWishlist(false);
  };

  const quickShop = async () => {
    await addToCart(item);
    router.push('/cart');
  };

  return (
    <div>
   {item.topSeller && (
        <div className="absolute top-[-12px] left-6 bg-pink-600 text-white text-xs font-semibold px-2 py-1">
          Top seller
        </div>
      )}
    
    <div className="min-w-[calc(50%-0.5rem)] sm:min-w-[calc(50%-0.75rem)] md:min-w-0 w-[48vw] sm:w-[45vw] md:w-[28dvw] snap-center relative hover:shadow-lg transition flex flex-col items-center  overflow-visible rounded-b-4xl mb-5"
    style={{ backgroundColor: item.bg }}>
    <div className="w-full flex items-center justify-center flex-col relative" >
          {/* Top Seller Badge */}
   

      {/* Wishlist icon */}
      <button
        onClick={handleWishlistToggle}
        disabled={isAddingToWishlist}
        aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        {isInWishlist(item.id) ? (
          <Heart size={22} className="fill-red-500 text-red-500" />
        ) : (
          <Heart size={22} />
        )}
      </button>

      {/* Image Section with inline bg color */}
      <div
        onClick={goToProduct}
        className="flex justify-center items-center w-full h-[220px] sm:h-[300px] rounded-2xl cursor-pointer"
      >
        <Image
          src={item.image}
          alt={item.title}
          width={300}
          height={300}
          className="object-contain rounded-xl"
        />
      </div>

      {/* Quick View Button */}
      <button
        onClick={goToProduct}
        className="w-[80%] sm:w-[70%] mt-3 mb-4 h-[44px] sm:h-[50px] py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 bg-white border-0"
      >
        <Search size={16} />
        Quick View
      </button>
    </div>

      {/* Product Info */}
      <div className="w-full bg-white">
     <div className="p-3">
           <h3 onClick={goToProduct} className="mt-3 font-medium text-gray-800 hover:text-[#0B4866] cursor-pointer">{item.title}</h3>

        <div className="mt-1 text-sm text-gray-600">
          <span className="line-through mr-2">${item.originalPrice}</span>
          <span className="text-xl font-semibold text-gray-900">
            ${item.discountedPrice}
          </span>
        </div>

        {/* Ratings */}
        <div className="flex items-center mt-1 text-yellow-500 text-sm">
          {"★".repeat(Math.floor(item.rating))}
          {"☆".repeat(5 - Math.floor(item.rating))}
          <span className="text-gray-600 text-xs ml-1">({item.reviews})</span>
        </div>

        {/* Stock Status */}
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              item.inStock ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            {item.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
     </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={quickShop}
            className="flex-1 border rounded-4xl py-3 flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            
             <Image size={16} src={FiRrShoppingBagIcon} alt="Cart" className="text-white"/>
            Quick Shop
          </button>
          <button 
            onClick={async () => { 
              await addToCart(item); 
              openCartDrawer(); 
            }}
            disabled={!item.inStock}
            className={` md:hidden hidden lg:flex flex-1 rounded-4xl py-2  items-center justify-center gap-2 ${
              !item.inStock 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : isInCart(item.id) 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-900 hover:bg-blue-800 text-white'
            }`}
          >
            {/* <ShoppingCart size={16} /> */}
            <Image size={16} src={FiRrShoppingCartAddWIcon} alt="Cart" className="text-white"/>
            {/* <FiRrShoppingCartAddIcon/> */}
            {!item.inStock ? 'Out of Stock' : isInCart(item.id) ? 'In Cart' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ItemCard;
