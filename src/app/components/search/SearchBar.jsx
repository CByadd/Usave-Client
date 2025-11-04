"use client";
import React, { useEffect, useRef, useState } from "react";
import { Search, Loader2, X } from 'lucide-react';
import { useSearch } from '../../stores/useSearchStore';
import { useRouter } from 'next/navigation';
import productService from '../../services/api/productService';

const SearchBar = ({ placeholder = "What You looking For..", isMobile = false, isExpanded = false, onToggle = null }) => {
  const { query, suggestions, isSearching, setQuery, setSuggestions, setIsSearching, addToHistory } = useSearch();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();


  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      if (value.trim().length > 0) {
        try {
          const response = await productService.getSearchSuggestions(value.trim());
          if (response.success && response.data?.suggestions) {
            setSuggestions(response.data.suggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (err) {
          console.error('Suggestions error:', err);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);
  };

  const submitQuery = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) return;
    setQuery(searchQuery);
    setIsSearching(true);
    try {
      addToHistory(searchQuery);
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuery(query);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        const chosen = suggestions[highlightedIndex];
        const text = chosen?.name || chosen?.title || chosen;
        submitQuery(String(text));
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 120);
  };

  return (
    <>
      {/* Background blur when suggestions are open */}
      {showSuggestions && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />
      )}
      
     <div
  className={`relative w-full z-[65] ${
    isMobile && !isExpanded ? 'hidden' : ''
  }`}
  ref={containerRef}
>
  <form
    onSubmit={handleSubmit}
    className={`flex items-center w-full mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-sm overflow-hidden border border-gray-500 transition-all duration-200 ${
      isMobile ? 'ml-0 px-0' : 'ml-7'
    }`}
  >
    <button
      type="submit"
      className="px-2 py-2 bg-transparent text-dark rounded-full hover:opacity-90 transition duration-200"
      aria-label="Search"
    >
      {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
    </button>

    {/* Close button for mobile */}
    {isMobile && onToggle && (
      <button
        type="button"
        onClick={onToggle}
        className="px-2 py-2 bg-transparent text-dark rounded-full hover:opacity-90 transition duration-200"
        aria-label="Close search"
      >
        <X size={16} />
      </button>
    )}

    <input
      type="text"
      value={query}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="flex-1 px-4 py-2 bg-white placeholder-black/40 focus:outline-none text-sm md:text-base"
      disabled={isSearching}
      aria-autocomplete="list"
      aria-expanded={showSuggestions}
      aria-controls="search-suggestions"
    />
  </form>


      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="absolute left-7 right-0 mt-2 z-[70] bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-auto text-sm md:text-base"
          role="listbox"
        >
          {suggestions.map((s, idx) => {
            const label = s?.name || s?.title || s;
            return (
              <li
                key={`${label}-${idx}`}
                role="option"
                aria-selected={idx === highlightedIndex}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${idx === highlightedIndex ? 'bg-gray-100' : ''}`}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => submitQuery(String(label))}
              >
                {String(label)}
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </>
  );
};

export default SearchBar;
