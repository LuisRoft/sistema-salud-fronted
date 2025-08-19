'use client';

import { useState, useEffect } from 'react';
import { CIFSearchResult } from '@/types/cif/cif-structure';
import { cifService } from '@/services/cifService';

interface AutocompleteCIFProps {
  onSelect: (cif: string, desc: string) => void;
  placeholder?: string;
  className?: string;
}

const AutocompleteCIF: React.FC<AutocompleteCIFProps> = ({ 
  onSelect, 
  placeholder = 'Ingrese el código CIF o descripción',
  className = ''
}) => {
  const [cifData, setCifData] = useState<CIFSearchResult[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<CIFSearchResult[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCIFData = async () => {
      try {
        setIsLoading(true);
        const data = await cifService.getAllCIFStructures();
        const allResults: CIFSearchResult[] = [];
        
        data.forEach((estructura) => {
          allResults.push({
            codigo: estructura.codigo,
            tema: estructura.tema,
            nivel: 'principal',
            rutaCompleta: estructura.tema,
          });

          if (estructura.subestructuras) {
            estructura.subestructuras.forEach((sub) => {
              allResults.push({
                codigo: sub.codigo,
                tema: estructura.tema,
                descripcion: sub.descripcion,
                nivel: 'subestructura',
                rutaCompleta: `${estructura.tema} > ${sub.descripcion}`,
              });
            });
          }
        });

        setCifData(allResults);
      } catch (error) {
        console.error('Error al cargar los códigos CIF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCIFData();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const filtered = cifData.filter((item) =>
        item.codigo.toLowerCase().includes(value.toLowerCase()) ||
        item.tema.toLowerCase().includes(value.toLowerCase()) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredOptions(filtered.slice(0, 20));
    } else {
      setFilteredOptions([]);
    }
  };

  const handleSelect = (item: CIFSearchResult) => {
    const displayValue = item.descripcion || item.tema;
    setInputValue(item.codigo);
    onSelect(item.codigo, displayValue);
    setFilteredOptions([]);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type='text'
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className='w-full rounded border bg-input p-2 text-gray-900 dark:text-white dark:bg-gray-800'
        disabled={isLoading}
      />
      
      {isLoading && (
        <div className='absolute right-3 top-2'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600'></div>
        </div>
      )}

      {filteredOptions.length > 0 && (
        <ul className='absolute z-10 w-full bg-white dark:bg-gray-700 border rounded shadow-md max-h-60 overflow-y-auto'>
          {filteredOptions.map((item, index) => (
            <li
              key={`${item.codigo}-${index}`}
              onClick={() => handleSelect(item)}
              className='p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600'
            >
              <div className='flex flex-col'>
                <div className='font-medium text-sm'>
                  {item.codigo} - {item.descripcion || item.tema}
                </div>
                {item.descripcion && (
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    {item.tema}
                  </div>
                )}
                <div className='text-xs text-blue-600 dark:text-blue-400'>
                  {item.nivel === 'principal' ? 'Estructura Principal' : 'Subestructura'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteCIF; 