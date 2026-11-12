export default function manifest() {
  return {
    name: 'UniHousing | منصة سكن الطلاب',
    short_name: 'UniHousing',
    description: 'ابحث عن سكن طلابي بالقرب من جامعتك',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#142B4A',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}
