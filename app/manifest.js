export default function manifest() {
  return {
    name: 'TribeFit - Stronger Together',
    short_name: 'TribeFit',
    description: 'Social pact fitness app. One tribe, one pact.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0C0B10',
    theme_color: '#7C5CFF',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
