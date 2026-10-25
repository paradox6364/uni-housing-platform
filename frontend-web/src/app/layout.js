import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';

export const metadata = {
  title: 'UniHousing | منصة سكن الطلاب',
  description: 'ابحث عن سكن طلابي موثّق بالقرب من جامعتك — Find verified student housing near your campus',
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
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased font-sans">
        <SettingsProvider>
          <AuthProvider>{children}</AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
