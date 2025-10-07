import React from "react";
import Link from "next/link";

const CatHeader = ({ title, buttonText, buttonLink = "#", disableButton = false }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
      {/* Title */}
      <h2 className="text-5xl font-semibold text-gray-800">{title}</h2>

      {/* Button */}
      {!disableButton && buttonText && (
        <Link
          href={buttonLink}
          className="inline-flex justify-center items-center gap-2 px-4 py-2 text-[16px] font-medium rounded-full w-[240px] h-[48px] border border-gray-300 hover:bg-gray-100 transition"
        >
          <p>{buttonText}</p> <p>→</p>
        </Link>
      )}
    </div>
  );
};

export default CatHeader;
