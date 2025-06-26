"use client";

import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const NavLinks = ({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) => (
  <nav className={cn("flex items-center gap-6", className)}>
    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={onLinkClick}>
      Início
    </Link>
    <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={onLinkClick}>
      Produtos
    </Link>
    <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={onLinkClick}>
      Dashboard
    </Link>
  </nav>
);

export default function Header() {
  const { cartCount } = useCart();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 transition-all duration-300",
      isScrolled ? "bg-background/80 backdrop-blur-sm border-b border-border" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <Link href="/" className="text-xl font-bold text-foreground font-heading">
          JC MARKETPLACE
        </Link>
        
        {isMobile ? (
          <div className="flex items-center gap-2">
             <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" className="relative" aria-label="Carrinho">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-fade-in-up">
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
                  <NavLinks className="flex-col text-lg items-start" onLinkClick={handleLinkClick} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <NavLinks />
            <Link href="/cart" passHref>
              <Button variant="ghost" className="relative" aria-label={`Carrinho com ${cartCount} itens`}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Carrinho
                {cartCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-fade-in-up">
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
