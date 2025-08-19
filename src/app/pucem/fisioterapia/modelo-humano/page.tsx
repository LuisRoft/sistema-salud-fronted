'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import NeurologicaTable from '@/components/neurologica-table/neurologica-table';
import { BioDigitalEmbedded } from '@/components/BioDigitalEmbedded';

export default function FisioterapiaPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <BioDigitalEmbedded/>
    </div>
  );
}
