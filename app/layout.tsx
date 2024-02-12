import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SatView [WIP]',
  description: 'Satellite tracking and visualization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <meta name='viewport' content='width=device-width, user-scalable=no' />
      </head>
      <body className={cn(inter.className, 'overflow-hidden')}>{children}</body>
    </html>
  );
}
