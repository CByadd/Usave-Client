"use client";
import React from "react";
import Image from "next/image";
import { Heart, ShoppingCart, Search } from "lucide-react";

const ItemCard = ({ item }) => {
  return (
    <div className="w-[28dvw]  relative  hover:shadow-lg transition flex flex-col items-center rounded-2xl "
    style={{ backgroundColor: item.bg }}>
    <div className="w-full flex items-center justify-center flex-col" >
          {/* Top Seller Badge */}
      {item.topSeller && (
        <div className="absolute top-[-12px] left-3 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded">
          Top seller
        </div>
      )}

      {/* Wishlist icon */}
      <button className="absolute top-3 right-3 text-gray-500 hover:text-red-500">
        <Heart size={22} />
      </button>

      {/* Image Section with inline bg color */}
      <div
        className="flex justify-center items-center w-full h-[300px] rounded-2xl"
        
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
      <button className="w-[70%] mt-3 mb-4 h-[50px] py-2 text-sm text-gray-700 border hover:bg-gray-100 flex items-center justify-center gap-2 rounded-xl">
        <Search size={16} />
        Quick View
      </button>
    </div>

      {/* Product Info */}
      <div className="w-full bg-white">
     <div className="p-3">
           <h3 className="mt-3 font-medium text-gray-800">{item.title}</h3>

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
          <button className="flex-1 border rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-gray-100">
            <Search size={16} />
            Quick Shop
          </button>
          <button className="flex-1 bg-blue-900 text-white rounded-2xl py-2 flex items-center justify-center gap-2 hover:bg-blue-800">
            <ShoppingCart size={16} />
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
