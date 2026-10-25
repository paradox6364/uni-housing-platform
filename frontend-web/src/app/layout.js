import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'UniHousing | Student Accommodation Platform',
  description: 'Find verified student housing near your university campus',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
