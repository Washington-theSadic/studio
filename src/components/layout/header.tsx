
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, User, LogOut, LifeBuoy, Home, Package, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.trim().split(' ').filter(Boolean);
    if (names.length > 1) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : '';
};

const DesktopNavLinks = ({ isAdmin }: { isAdmin: boolean }) => {
    const pathname = usePathname();
    const links = [
        { href: '/', label: 'Início' },
        { href: '/products', label: 'Produtos' },
    ];
    if (isAdmin) {
        links.push({ href: '/dashboard', label: 'Dashboard' });
    }

    return (
        <nav className="flex items-center gap-6">
            {links.map(link => (
                 <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-foreground",
                        pathname === link.href ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
};


export default function Header() {
  const { cartCount } = useCart();
  const { currentUser, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMounted]);

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  }
  
  const handleHelpClick = () => {
    if (!currentUser) return;

    const phoneNumber = '5577998188469';
    const message = `Olá, me chamo ${currentUser.name}, preciso de ajuda.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    if (window.top) {
       window.top.location.href = whatsappUrl;
    } else {
       window.location.href = whatsappUrl;
    }
    
    setIsSheetOpen(false);
  };

  const AuthNav = () => {
    if (loading) return <Skeleton className="h-9 w-24" />;

    if (currentUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                  <AvatarImage src={currentUser.avatar_url || undefined} alt={currentUser.name} />
                  <AvatarFallback>{isAdmin ? 'ADM' : getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{currentUser.name.split(' ')[0]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Olá, {currentUser.name}!</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/orders">
                <Package className="mr-2 h-4 w-4" />
                <span>Meus Pedidos</span>
              </Link>
            </DropdownMenuItem>
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
         <Button asChild variant="ghost" size="sm" onClick={handleLinkClick}>
            <Link href="/login">Login</Link>
         </Button>
         <Button asChild size="sm" onClick={handleLinkClick}>
            <Link href="/register">Cadastre-se</Link>
         </Button>
       </div>
    );
  };

  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname.startsWith(href) && href !== '/';
    const isHomeActive = pathname === '/';

    return (
        <Link 
            href={href}
            onClick={handleLinkClick}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground/80 transition-all hover:bg-accent hover:text-accent-foreground text-base",
                 (href === '/' && isHomeActive) || (href !== '/' && isActive) ? "bg-accent text-foreground font-semibold" : ""
            )}
        >
            {children}
        </Link>
    )
  }
  
  const headerClass = isMounted && isScrolled ? "bg-background/80 backdrop-blur-sm border-b border-border/30" : "bg-transparent";

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-transparent">
        <div className="container mx-auto px-4 flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="text-xl font-bold text-foreground font-heading">
            JC MARKETPLACE
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <DesktopNavLinks isAdmin={false} />
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
          <div className="md:hidden">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      headerClass
    )}>
      <div className="container mx-auto px-4 flex justify-between items-center h-16 md:h-20">
        <Link href="/" className="text-xl font-bold text-foreground font-heading">
          JC MARKETPLACE
        </Link>
        
        {isMobile ? (
          <div className="flex items-center gap-2">
            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" className="relative" aria-label="Carrinho">
                <ShoppingCart className="h-5 w-5" />
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
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                
                <div className="flex-grow flex flex-col overflow-y-auto">
                   {loading ? (
                       <div className="p-4 space-y-4">
                           <Skeleton className="h-14 w-full" />
                           <Separator />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                       </div>
                   ) : currentUser ? (
                        <>
                            <div className="p-4 bg-muted/20 border-b">
                                <Link href="/account" onClick={handleLinkClick} className="flex items-center gap-4 group">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage src={currentUser.avatar_url || undefined} alt={currentUser.name} />
                                        <AvatarFallback>{isAdmin ? 'ADM' : getInitials(currentUser.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-lg text-foreground truncate group-hover:text-brand">{currentUser.name}</p>
                                        <p className="text-sm text-muted-foreground">Ver perfil</p>
                                    </div>
                                </Link>
                            </div>
                            <nav className="flex-1 p-4 space-y-1">
                                <p className="text-xs font-medium uppercase text-muted-foreground px-3 pt-2 pb-1">Navegação</p>
                                <MobileNavLink href="/">
                                    <Home className="h-5 w-5" />
                                    Início
                                </MobileNavLink>
                                <MobileNavLink href="/products">
                                    <Package className="h-5 w-5" />
                                    Produtos
                                </MobileNavLink>
                                {isAdmin && (
                                    <MobileNavLink href="/dashboard">
                                        <LayoutDashboard className="h-5 w-5" />
                                        Dashboard
                                    </MobileNavLink>
                                )}
                                <Separator className="my-4" />
                                <MobileNavLink href="/account">
                                    <User className="h-5 w-5" />
                                    Meu Perfil
                                </MobileNavLink>
                                <MobileNavLink href="/account/orders">
                                    <Package className="mr-2 h-4 w-4" />
                                    Meus Pedidos
                                </MobileNavLink>
                                 <button
                                    onClick={() => {
                                        logout();
                                        handleLinkClick();
                                    }}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base text-foreground/80 transition-all hover:bg-accent hover:text-accent-foreground w-full"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sair
                                </button>
                            </nav>
                        </>
                   ) : (
                       <nav className="p-4 space-y-2">
                           <MobileNavLink href="/login">
                               <LogIn className="h-5 w-5" />
                               Login
                           </MobileNavLink>
                           <MobileNavLink href="/register">
                               <UserPlus className="h-5 w-5" />
                               Cadastre-se
                           </MobileNavLink>
                       </nav>
                   )}
                
                  {currentUser && (
                    <div className="mt-auto border-t p-4">
                        <Button variant="outline" className="w-full justify-start text-base py-6" onClick={handleHelpClick}>
                            <LifeBuoy className="mr-3 h-5 w-5" />
                            <span>Precisa de ajuda?</span>
                        </Button>
                    </div>
                  )}
                </div>

              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <DesktopNavLinks isAdmin={isAdmin} />
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
