'use client';

import { useState, useEffect } from 'react';

interface AutocompleteCIEProps {
  onSelect: (cie: string, desc: string) => void;
}

const AutocompleteCIE: React.FC<AutocompleteCIEProps> = ({ onSelect }) => {
  const [cieData, setCieData] = useState<{ code: string; description: string }[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<{ code: string; description: string }[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchCieData = async () => {
      try {
        const response = await fetch('/cie10.json');
        const data = await response.json();
        const cieArray = Object.entries(data).map(([code, description]) => ({
          code,
          description: String(description),
        }));
        setCieData(cieArray);
      } catch (error) {
        console.error('Error al cargar los códigos CIE-10:', error);
      }
    };

    fetchCieData();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const filtered = cieData.filter((item) =>
        item.code.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered.slice(0, 20)); // Mostrar solo las primeras 20 coincidencias
    } else {
      setFilteredOptions([]);
    }
  };

  const handleSelect = (code: string, description: string) => {
    setInputValue(code);
    onSelect(code, description);
    setFilteredOptions([]);
  };

  return (
    <div className='relative'>
      <input
        type='text'
        placeholder='Ingrese el código CIE o descripción'
        value={inputValue}
        onChange={handleInputChange}
        className='w-full rounded border bg-input p-2 text-gray-900 dark:text-white dark:bg-gray-800'
      />
      {filteredOptions.length > 0 && (
        <ul className='absolute z-10 w-full bg-white dark:bg-gray-700 border rounded shadow-md max-h-60 overflow-y-auto'>
          {filteredOptions.map((item) => (
            <li
              key={item.code}
              onClick={() => handleSelect(item.code, item.description)}
              className='p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'
            >
              {item.code} - {item.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteCIE;
