import type { Metadata } from 'next';
//ts-ignore
import './globals.css';
import { Providers } from './providers';
import { Poppins } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Elohim Group — Operations Console',
  description: 'Roles, tasks and reporting across the Bar & Restaurant, Apartments, Recruitment and Logistics lines.',
};
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
