
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

    export const metadata: Metadata = {
      title: 'w3-workshop',
      description: 'A Web3 application built with Cradle',
    };

    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <html lang="en" suppressHydrationWarning>
          <body className="font-sans">
            <Providers>
              {children}
            </Providers>
          </body>
        </html>
      );
    }
  
