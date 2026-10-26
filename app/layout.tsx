import type {Metadata} from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'PCG.OS - Paiva Camargo & Godoy',
  description: 'Gestão jurídica, operacional e estratégica. Uma plataforma centralizada para excelência em advocacia corporativa.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-[#f8f9ff] text-[#121c2a] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

