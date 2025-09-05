import CIFDemo from '@/components/cif/cif-demo';

export default function CIFDemoPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Demostración CIF</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Prueba del sistema de clasificación CIF integrado
        </p>
      </div>
      <CIFDemo />
    </div>
  );
} 