import type { Metadata } from 'next';
// import { Inter, } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SatView 🛰️',
  description: 'Satellite tracking and visualization',
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* <script src='https://unpkg.com/react-scan/dist/auto.global.js' async /> */}
        <meta name='viewport' content='width=device-width, user-scalable=no' />
        <link
          rel='icon'
          type='image/png'
          href='/favicon/favicon-96x96.png'
          sizes='96x96'
          media='(prefers-color-scheme: light)'
        />
        <link
          rel='icon'
          type='image/png'
          href='/favicon/favicon-dark-96x96.png'
          sizes='96x96'
          media='(prefers-color-scheme: dark)'
        />
        <link
          rel='icon'
          type='image/svg+xml'
          href='/favicon/favicon.svg'
          media='(prefers-color-scheme: light)'
        />
        <link
          rel='icon'
          type='image/svg+xml'
          href='/favicon/favicon-dark.svg'
          media='(prefers-color-scheme: dark)'
        />
        <link
          rel='shortcut icon'
          href='/favicon/favicon.ico'
          media='(prefers-color-scheme: light)'
        />
        <link
          rel='shortcut icon'
          href='/favicon/favicon-dark.ico'
          media='(prefers-color-scheme: dark)'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/favicon/apple-touch-icon.png'
        />
        <meta name='apple-mobile-web-app-title' content='SatView' />
        <link rel='manifest' href='/favicon/site.webmanifest' />
      </head>
      <body id='app-container' className={cn('', 'overflow-hidden relative')}>
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
// export default dynamic(() => Promise.resolve(RootLayout), {
//   ssr: false,
// });
