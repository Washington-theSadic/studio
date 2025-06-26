import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/cart-context';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster"

const fontSans = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'JC Marketplace - Tecnologia e Cuidado Pessoal',
  description: 'Os melhores produtos, dos últimos lançamentos de smartphones a cosméticos de alta performance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full dark">
      <body className={cn(
        'font-sans antialiased min-h-screen flex flex-col',
        fontSans.variable,
        fontHeading.variable
      )}>
        <CartProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
