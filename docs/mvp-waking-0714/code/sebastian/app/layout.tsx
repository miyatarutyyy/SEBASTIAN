import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SEBASTIAN',
  description: '生活状態オーケストレーター Steward — 起床シーケンス',
};

export const viewport = {
  themeColor: '#1a150e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}