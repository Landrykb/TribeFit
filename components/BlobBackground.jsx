import React from 'react';

// Haikei-style drifting blob background — pure SVG, no assets.
export function BlobBackground({ opacity = 0.5 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ opacity }}>
      <svg className="absolute -top-10 -left-16 w-72 h-72 animate-blob-a" viewBox="0 0 200 200">
        <path fill="#A3E635" fillOpacity="0.14"
          d="M45.7,-58.9C58.9,-51.1,69.4,-36.5,73.5,-20.7C77.6,-4.9,75.3,12.1,67.8,25.9C60.3,39.7,47.7,50.4,33.4,57.8C19.1,65.2,3.1,69.4,-12.4,66.9C-27.9,64.4,-42.8,55.3,-53.2,42.8C-63.6,30.3,-69.5,14.4,-68.6,-0.8C-67.7,-16,-60,-30.5,-49.6,-38.4C-39.2,-46.3,-26,-47.6,-13.4,-51.9C-0.8,-56.2,11.2,-63.5,22.5,-64.4C33.8,-65.3,44.4,-59.7,45.7,-58.9Z"
          transform="translate(100 100)" />
      </svg>
      <svg className="absolute -bottom-14 -right-10 w-64 h-64 animate-blob-b" viewBox="0 0 200 200">
        <path fill="#FF5436" fillOpacity="0.12"
          d="M39.9,-51.2C53.4,-42.9,67.3,-32.5,72.6,-18.4C77.9,-4.3,74.6,13.5,66.5,27.5C58.4,41.5,45.5,51.7,31.3,57.9C17.1,64.1,1.6,66.3,-13.4,63.6C-28.4,60.9,-42.9,53.3,-52.9,41.5C-62.9,29.7,-68.4,13.6,-67.6,-1.7C-66.8,-17,-59.7,-31.5,-49.1,-39.9C-38.5,-48.3,-24.4,-50.6,-10.4,-55.5C3.6,-60.4,18,-67.9,29.6,-66.4C41.2,-64.9,50,-54.4,39.9,-51.2Z"
          transform="translate(100 100)" />
      </svg>
      <svg className="absolute top-1/3 right-1/4 w-40 h-40 animate-blob-c" viewBox="0 0 200 200">
        <path fill="#FFD166" fillOpacity="0.10"
          d="M47.5,-56.6C59.6,-47.8,66.4,-31.4,69.5,-14.6C72.6,2.2,72,19.4,64.8,32.4C57.6,45.4,43.8,54.2,29.2,59.8C14.6,65.4,-0.8,67.8,-15.4,63.9C-30,60,-43.8,49.8,-53,36.4C-62.2,23,-66.8,6.4,-65.1,-8.7C-63.4,-23.8,-55.4,-37.4,-44.1,-46.1C-32.8,-54.8,-18.2,-58.6,-2.6,-60.2C13,-61.8,26.1,-61.1,35.4,-56.7C44.7,-52.3,50.3,-44.1,47.5,-56.6Z"
          transform="translate(100 100)" />
      </svg>
    </div>
  );
}

export default BlobBackground;
