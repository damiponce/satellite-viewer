import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SatView [WIP]',
  description: 'Satellite tracking and visualization',
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        {/* <script
          src='https://unpkg.com/react-scan/dist/auto.global.js'
          async
        ></script> */}
        <meta name='viewport' content='width=device-width, user-scalable=no' />
      </head>
      <body className={cn(inter.className, 'overflow-hidden relative')}>
        {children}
      </body>
    </html>
  );
}

export default dynamic(() => Promise.resolve(RootLayout), {
  ssr: false,
});
