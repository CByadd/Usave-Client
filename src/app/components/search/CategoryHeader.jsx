import React from "react";
import Link from "next/link";

const CatHeader = ({ title, buttonText, buttonLink = "#", disableButton = false ,width}) => {
  return (
    <div className={`flex items-center justify-between  pb-3 mb-6 ` + width}>
      {/* Title */}
      <h2 className="text-xl md:text-5xl font-light text-gray-800 font-serifx">
        {title}
      </h2>

      {/* Button */}
      {!disableButton && buttonText && (
        <Link
          href={buttonLink}
          className="flex justify-center items-center gap-2 px-4 py-2 font-medium rounded-full w-[100px] h-[40px] md:w-[240px] md:h-[48px] border border-gray-300 hover:bg-gray-100 transition"
        >
          {/* Mobile text */}
          <p className="text-[12px] block md:hidden ">See All</p>
           <p className="text-[12px] block md:hidden ">→</p>

          {/* Desktop text */}
          <p className="text-sm hidden md:block">{buttonText}</p>

          <p className="text-sm hidden md:block">→</p>
        </Link>
      )}
    </div>
  );
};

export default CatHeader;
