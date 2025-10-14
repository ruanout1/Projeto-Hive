import React from 'react';

interface HighlightTextProps {
  text: string;
  searchTerm: string;
  highlightClassName?: string;
}

export function HighlightText({ text, searchTerm, highlightClassName = 'bg-yellow-200 text-black px-1 rounded' }: HighlightTextProps) {
  if (!searchTerm || !text) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        const isMatch = regex.test(part);
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, onClear, placeholder = "Pesquisar...", className = "" }: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClear();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`${className} focus:outline-none focus:ring-2 focus:ring-purple-500`}
    />
  );
}

interface NoResultsProps {
  searchTerm: string;
  message?: string;
}

export function NoResults({ searchTerm, message }: NoResultsProps) {
  return (
    <div className="text-center py-8 text-gray-500">
      <div className="mb-2">
        <span className="text-gray-400 text-4xl">🔍</span>
      </div>
      <p className="text-lg mb-1">
        {message || 'Nenhum resultado encontrado'}
      </p>
      <p className="text-sm">
        para "<span className="font-medium text-black">{searchTerm}</span>"
      </p>
      <p className="text-xs mt-2 text-gray-400">
        Pressione ESC para limpar a busca
      </p>
    </div>
  );
}