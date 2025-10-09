import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
        <SearchIcon className="h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
      </div>
      <input
        type="search"
        id="surah-search"
        placeholder="ابحث عن سورة أو موضوع مثل 'الصبر'..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="block w-full bg-card border border-border-color rounded-lg py-3 pl-12 pr-4 text-base placeholder-text-secondary focus:outline-none focus:text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow shadow-sm"
      />
    </div>
  );
};

export default SearchBar;