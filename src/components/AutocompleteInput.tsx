import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  autoFocus = false,
  placeholder = '',
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(
      value
        ? options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()))
        : options
    );
    setHighlightedIndex(-1);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowOptions(true);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setShowOptions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOptions) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(idx => Math.min(idx + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(idx => Math.max(idx - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      onChange(filteredOptions[highlightedIndex]);
      setShowOptions(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        className="peer w-full border-2 border-gray-200 rounded-xl bg-white/70 px-4 pt-6 pb-2 text-base font-medium focus:outline-none focus:border-purple-400 transition placeholder-transparent shadow-sm"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        onKeyDown={handleKeyDown}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder || ' '}
        aria-autocomplete="list"
        aria-expanded={showOptions}
        aria-controls="autocomplete-listbox"
        aria-activedescendant={highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined}
      />
      <label className="absolute left-4 top-2 text-gray-400 text-sm font-semibold pointer-events-none transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-500">
        {label}
      </label>
      {showOptions && (
        <ul
          id="autocomplete-listbox"
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <li
                key={option}
                id={`option-${idx}`}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`px-4 py-2 cursor-pointer hover:bg-purple-100 ${highlightedIndex === idx ? 'bg-purple-100' : ''}`}
                onMouseDown={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400 select-none">Aucune suggestion</li>
          )}
        </ul>
      )}
    </div>
  );
};
