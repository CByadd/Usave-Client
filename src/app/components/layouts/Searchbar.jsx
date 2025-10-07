"use client";
import React, { useState } from "react";
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = "What You looking For.." }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => setQuery(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Search query:", query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full bg-white ml-7 mx-auto bg-light/80 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-black/10 focus-within:ring-2 focus-within:ring-primary transition-all duration-200"
    >
          <button
        type="submit"
        className="px-2 py-2 bg-transparent text-dark rounded-full hover:opacity-90 transition duration-200"
      >
          <Search />
      </button>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 bg-white placeholder-black/40 focus:outline-none text-sm md:text-base"
      />
    
    </form>
  );
};

export default SearchBar;
