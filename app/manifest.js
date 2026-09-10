export default function manifest() {
  return {
    id: 'tribefit',
    name: 'TribeFit - Stronger Together',
    short_name: 'TribeFit',
    description: 'Social pact fitness app. One tribe, one pact.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0C0B10',
    theme_color: '#A3E635',
    orientation: 'portrait',
    lang: 'en',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
