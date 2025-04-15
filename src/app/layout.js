import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { NextAuthProvider } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "API Key Management",
  description: "Manage your API keys securely",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="antialiased">
        <NextAuthProvider>
          {children}
          <Toaster position="top-right" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
