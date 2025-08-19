'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AutocompleteCIF from './autocompleteCIF';
import { cifService } from '@/services/cifService';
import { CIFSearchResult } from '@/types/cif/cif-structure';

export default function CIFDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CIFSearchResult[]>([]);
  const [selectedCIF, setSelectedCIF] = useState<CIFSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await cifService.searchCIF(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCIFSelect = (cif: string) => {
    const result = searchResults.find(r => r.codigo === cif);
    setSelectedCIF(result || null);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCIF(null);
  };

  return (
    <div className='space-y-6'>
      {/* Búsqueda CIF */}
      <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
        <div className='mb-4'>
          <h3 className='text-xl font-semibold'>Búsqueda de Estructuras CIF</h3>
          <p className='text-gray-600 dark:text-gray-400'>
            Busca estructuras anatómicas por código, tema o descripción
          </p>
        </div>
        
        <div className='space-y-4'>
          <div className='flex gap-2'>
            <Input
              placeholder='Buscar por código, tema o descripción...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className='flex-1'
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button variant='outline' onClick={handleClear}>
              Limpiar
            </Button>
          </div>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className='space-y-2'>
              <Label>Resultados de búsqueda:</Label>
              <div className='max-h-60 overflow-y-auto space-y-2'>
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.codigo}-${index}`}
                    className='p-3 border rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
                    onClick={() => setSelectedCIF(result)}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='font-medium'>
                          {result.codigo} - {result.descripcion || result.tema}
                        </div>
                        {result.descripcion && (
                          <div className='text-sm text-gray-600 dark:text-gray-400'>
                            {result.tema}
                          </div>
                        )}
                      </div>
                      <Badge variant={result.nivel === 'principal' ? 'default' : 'secondary'}>
                        {result.nivel === 'principal' ? 'Principal' : 'Subestructura'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Componente AutocompleteCIF */}
      <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
        <div className='mb-4'>
          <h3 className='text-xl font-semibold'>Componente AutocompleteCIF</h3>
          <p className='text-gray-600 dark:text-gray-400'>
            Prueba el componente de autocompletado integrado
          </p>
        </div>
        
        <div className='space-y-4'>
          <div>
            <Label>Código CIF:</Label>
            <AutocompleteCIF
              onSelect={handleCIFSelect}
              placeholder='Selecciona una estructura CIF...'
              className='mt-2'
            />
          </div>
        </div>
      </div>

      {/* Información del CIF seleccionado */}
      {selectedCIF && (
        <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
          <div className='mb-4'>
            <h3 className='text-xl font-semibold'>Estructura CIF Seleccionada</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Detalles de la estructura seleccionada
            </p>
          </div>
          
          <div className='space-y-3'>
            <div>
              <Label className='font-medium'>Código:</Label>
              <div className='text-lg font-mono bg-gray-200 dark:bg-gray-700 p-2 rounded'>
                {selectedCIF.codigo}
              </div>
            </div>
            
            <div>
              <Label className='font-medium'>Tema Principal:</Label>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded'>
                {selectedCIF.tema}
              </div>
            </div>

            {selectedCIF.descripcion && (
              <div>
                <Label className='font-medium'>Descripción Específica:</Label>
                <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded'>
                  {selectedCIF.descripcion}
                </div>
              </div>
            )}

            <div>
              <Label className='font-medium'>Nivel:</Label>
              <Badge variant={selectedCIF.nivel === 'principal' ? 'default' : 'secondary'}>
                {selectedCIF.nivel === 'principal' ? 'Estructura Principal' : 'Subestructura'}
              </Badge>
            </div>

            <div>
              <Label className='font-medium'>Ruta Completa:</Label>
              <div className='p-2 bg-gray-200 dark:bg-gray-700 rounded text-sm'>
                {selectedCIF.rutaCompleta}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas del sistema CIF */}
      <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
        <div className='mb-4'>
          <h3 className='text-xl font-semibold'>Información del Sistema CIF</h3>
          <p className='text-gray-600 dark:text-gray-400'>
            Metadatos y estadísticas del sistema
          </p>
        </div>
        
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center p-4 bg-blue-100 dark:bg-blue-900/20 rounded'>
            <div className='text-2xl font-bold text-blue-600'>303</div>
            <div className='text-sm text-blue-600'>Estructuras Totales</div>
          </div>
          <div className='text-center p-4 bg-green-100 dark:bg-green-900/20 rounded'>
            <div className='text-2xl font-bold text-green-600'>11</div>
            <div className='text-sm text-green-600'>Sistemas Principales</div>
          </div>
        </div>
      </div>
    </div>
  );
} 