
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '../ui/skeleton';

const NavLinks = ({ className, onLinkClick, isAdmin }: { className?: string, onLinkClick?: () => void, isAdmin: boolean }) => (
  <nav className={cn("flex items-center gap-6", className)}>
    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={onLinkClick}>
      Início
    </Link>
    <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={onLinkClick}>
      Produtos
    </Link>
    {isAdmin && (
      <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={onLinkClick}>
        Dashboard
      </Link>
    )}
  </nav>
);

export default function Header() {
  const { cartCount } = useCart();
  const { currentUser, logout, loading } = useAuth();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

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

  const AuthNav = () => {
    if (loading) return <Skeleton className="h-9 w-24" />;

    if (currentUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden md:inline">{currentUser.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
       <div className="flex items-center gap-2">
         <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
         </Button>
         <Button asChild size="sm">
            <Link href="/register">Cadastre-se</Link>
         </Button>
       </div>
    );
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      isScrolled ? "bg-background border-b border-border" : "bg-transparent"
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
                  <NavLinks className="flex-col text-lg items-start" onLinkClick={handleLinkClick} isAdmin={isAdmin} />
                  <div className="border-t pt-6">
                    <AuthNav />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <NavLinks isAdmin={isAdmin} />
            <div className="flex items-center gap-4">
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
              <AuthNav />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
