import './globals.css';

export const metadata = {
  title: 'UniHousing | Student Accommodation Marketplace',
  description: 'Find and book verified student housing close to your university.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
