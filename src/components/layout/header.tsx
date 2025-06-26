"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const NavLinks = ({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) => (
  <nav className={className}>
    <Link href="/" className="text-foreground hover:text-brand transition-colors" onClick={onLinkClick}>
      Início
    </Link>
    <Link href="/products" className="text-foreground hover:text-brand transition-colors" onClick={onLinkClick}>
      Produtos
    </Link>
  </nav>
);

export default function Header() {
  const { cartCount } = useCart();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  }

  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <Link href="/" className="text-2xl font-bold text-brand font-headline">
          JC MARKETPLACE
        </Link>
        
        {isMobile ? (
          <div className="flex items-center gap-2">
            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" aria-label="Carrinho">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 pt-10">
                  <NavLinks className="flex flex-col gap-6 text-lg" onLinkClick={handleLinkClick} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <NavLinks className="hidden md:flex items-center gap-6" />
            <Link href="/cart" passHref>
              <Button variant="outline" aria-label={`Carrinho com ${cartCount} itens`}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Carrinho
                {cartCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
