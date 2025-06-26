import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="md:col-span-2">
            <h3 className="font-bold text-lg font-heading text-foreground mb-4">JC MARKETPLACE</h3>
            <p className="text-muted-foreground max-w-md">Tecnologia e Cuidado Pessoal: os melhores produtos, dos últimos lançamentos de smartphones a cosméticos de alta performance.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg font-heading mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-muted-foreground hover:text-brand">Início</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-brand">Produtos</Link></li>
              <li><Link href="/cart" className="text-muted-foreground hover:text-brand">Carrinho</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg font-heading mb-4">Siga-nos</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-brand"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-brand"><Instagram /></Link>
              <Link href="#" className="text-muted-foreground hover:text-brand"><Twitter /></Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border/30 mt-8 pt-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} JC MARKETPLACE. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
