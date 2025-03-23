'use client';

import { useState, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface AutocompleteSelectorProps {
  jsonPath: string;
  placeholder: string;
  onSelect: (value: string, label: string) => void;
}

const AutocompleteSelector: React.FC<AutocompleteSelectorProps> = ({ jsonPath, placeholder, onSelect }) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(jsonPath);
        const data: Option[] = await response.json();
        setOptions(data);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchOptions();
  }, [jsonPath]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const filtered = options.filter((item) =>
        item.value.toLowerCase().includes(value.toLowerCase()) ||
        item.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered.slice(0, 20)); 
    } else {
      setFilteredOptions([]);
    }
  };

  const handleSelect = (value: string, label: string) => {
    setInputValue(label);
    onSelect(value, label);
    setFilteredOptions([]);
  };

  return (
    <div className='relative'>
      <input
        type='text'
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className='w-full rounded border bg-input p-2 text-gray-900 dark:text-white dark:bg-gray-800'
      />
      {filteredOptions.length > 0 && (
        <ul className='absolute z-10 w-full bg-white dark:bg-gray-700 border rounded shadow-md max-h-60 overflow-y-auto'>
          {filteredOptions.map((item) => (
            <li
              key={item.value}
              onClick={() => handleSelect(item.value, item.label)}
              className='p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteSelector;
