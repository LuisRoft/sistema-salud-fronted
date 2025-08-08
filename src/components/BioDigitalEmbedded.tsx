'use client'

import { useEffect, useState } from 'react';
import Script from 'next/script'

export function BioDigitalEmbedded() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/get-human-data')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Error fetching:', err));
  }, []);


  console.log("data", data)
  
  return (
    <>
     <Script
        src="https://developer.biodigital.com/builds/api/human-api-3.0.0.min.js"
        strategy="lazyOnload" // o 'beforeInteractive', 'afterInteractive'
        onLoad={() => {
          // Aquí puedes usar las funciones del script
          const human = new (window as any).HumanAPI("biodigital");
          console.log("human", human)
          human.send( 'human.info' , callback)

          function callback(info: any) {
            console.log("human info", info)
          } 
        
        }}
        onError={() => {
          console.error('Error cargando el script')
        }}
      />
    <iframe id="embedded-human" frameBorder="0" style={{aspectRatio: 4 / 3, width: "100%"}} allowFullScreen={true} loading="lazy" src="https://human.biodigital.com/viewer/?id=6Jfx&ui-anatomy-descriptions=true&ui-anatomy-pronunciations=true&ui-anatomy-labels=false&ui-audio=true&ui-chapter-list=false&ui-fullscreen=false&ui-help=false&ui-info=false&ui-label-list=true&ui-layers=false&ui-skin-layers=false&ui-loader=circle&ui-media-controls=none&ui-menu=false&ui-nav=false&ui-search=false&ui-tools=false&ui-tutorial=false&ui-undo=false&ui-whiteboard=false&initial.none=true&disable-scroll=false&uaid=MAF4e&paid=o_0050b69f"></iframe>
    
    </>
  );
}
