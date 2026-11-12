import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import DoorTransition from '../components/DoorTransition';

export const metadata = {
  title: 'UniHousing | منصة سكن الطلاب',
  description: 'ابحث عن سكن طلابي بالقرب من جامعتك — Find student housing near your campus',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UniHousing',
  },
};

export const viewport = {
  themeColor: '#142B4A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// يشتغل قبل ظهور الصفحة ليطبّق اللغة والوضع المحفوظين فلا يحدث وميض في الشاشة
const initScript = `
(function () {
  try {
    var d = document.documentElement;
    if (localStorage.getItem('unihousing_lang') === 'en') { d.lang = 'en'; d.dir = 'ltr'; }
    if (localStorage.getItem('unihousing_theme') === 'dark') { d.classList.add('dark'); }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 font-normal antialiased font-sans">
        <SettingsProvider>
          <AuthProvider>
            <DoorTransition>{children}</DoorTransition>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
