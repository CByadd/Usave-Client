"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from 'react-dom';
import { Search, Loader2, X } from 'lucide-react';
import { useSearch } from '../../stores/useSearchStore';
import { useRouter } from 'next/navigation';

const SearchBar = ({ placeholder = "What You looking For..", isMobile = false, isExpanded = false, onToggle = null }) => {
  const { query, suggestions, isSearching, isFetchingSuggestions, setQuery, clearQuery, fetchSuggestions, setIsSearching, addToHistory, clearSuggestions } = useSearch();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0, width: 0 });
  const router = useRouter();


  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
      // Use Zustand's optimized fetchSuggestions with debouncing and caching
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      clearSuggestions();
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    clearQuery();
    clearSuggestions();
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const submitQuery = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) return;
    setQuery(searchQuery);
    setIsSearching(true);
    try {
      addToHistory(searchQuery);
      setShowSuggestions(false);
      clearSuggestions();
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
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  // Update suggestions visibility when suggestions change
  useEffect(() => {
    if (suggestions.length > 0 && query.trim()) {
      // Only show suggestions if the input is focused
      if (document.activeElement === inputRef.current) {
        setShowSuggestions(true);
      }
    } else if (!query.trim()) {
      setShowSuggestions(false);
    }
  }, [suggestions, query]);

  // Update suggestions position when input position changes
  useEffect(() => {
    if (!showSuggestions || !inputRef.current) {
      return;
    }

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        // Use getBoundingClientRect() directly for fixed positioning (viewport coordinates)
        // Fixed positioning is relative to viewport, so we don't add scrollY
        setSuggestionsPosition({
          top: rect.bottom + 8, // Fixed positioning uses viewport coordinates
          left: isMobile ? (containerRect?.left || rect.left) : (containerRect?.left || rect.left) + 28,
          width: isMobile ? (containerRect?.width || rect.width) : rect.width,
        });
      }
    };

    // Initial position
    updatePosition();
    
    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSuggestions, isMobile]); // Keep dependency array constant

  return (
    <>
      {/* Background blur when suggestions are open */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          onClick={() => setShowSuggestions(false)}
        />
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
            className="px-2 sm:px-3 py-2 bg-transparent text-dark rounded-full hover:opacity-90 transition duration-200 flex-shrink-0"
            aria-label="Search"
          >
            {isSearching ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <Search className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="flex-1 px-2 sm:px-4 py-2 bg-white placeholder-black/40 focus:outline-none text-xs sm:text-sm md:text-base min-w-0"
            disabled={isSearching}
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
          />

          {/* Clear button (X) - Show when there's text */}
          {query && !isMobile && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-2 bg-transparent text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition duration-200 flex-shrink-0"
              aria-label="Clear search"
            >
              <X size={isMobile ? 16 : 18} />
            </button>
          )}

          {/* Close button for mobile */}
          {isMobile && onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="px-2 py-2 bg-transparent text-dark rounded-full hover:opacity-90 transition duration-200 flex-shrink-0"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      {/* Render suggestions outside navbar using portal */}
      {typeof window !== 'undefined' && showSuggestions && (suggestions.length > 0 || isFetchingSuggestions) && createPortal(
        <ul
          ref={suggestionsRef}
          id="search-suggestions"
          className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-lg max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-auto text-xs sm:text-sm md:text-base"
          style={{
            top: `${suggestionsPosition.top}px`,
            left: `${suggestionsPosition.left}px`,
            width: `${suggestionsPosition.width}px`,
          }}
          role="listbox"
        >
          {isFetchingSuggestions && suggestions.length === 0 ? (
            <li className="px-3 sm:px-4 py-3 text-center text-gray-500">
              <Loader2 className="animate-spin h-5 w-5 mx-auto mb-1" />
              <span className="text-xs">Searching...</span>
            </li>
          ) : (
            suggestions.map((s, idx) => {
              const label = s?.name || s?.title || s;
              return (
                <li
                  key={`${label}-${idx}`}
                  role="option"
                  aria-selected={idx === highlightedIndex}
                  className={`px-3 sm:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors break-words ${
                    idx === highlightedIndex ? 'bg-gray-100' : ''
                  }`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    submitQuery(String(label));
                  }}
                  onClick={() => submitQuery(String(label))}
                >
                  {String(label)}
                </li>
              );
            })
          )}
        </ul>,
        document.body
      )}
    </>
  );
};

export default SearchBar;
