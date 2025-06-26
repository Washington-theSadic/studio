import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Smartphone, Pill, Headset, ArrowRight } from 'lucide-react';

const categories = [
  { name: 'iPhone', icon: Smartphone, href: '/products?category=iPhone' },
  { name: 'Android', icon: Smartphone, href: '/products?category=Android' },
  { name: 'Minoxidil', icon: Pill, href: '/products?category=Minoxidil' },
  { name: 'Acessórios', icon: Headset, href: '/products?category=Acessórios' },
];

export default function Home() {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-center">
        <div className="container mx-auto px-4 z-10 relative">
          <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-heading bg-gradient-to-br from-gray-200 to-gray-500 bg-clip-text text-transparent">
              A melhor Loja de importados do Oeste
            </h1>
          </div>
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}
          >
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
              Tecnologia e Cuidado Pessoal: os melhores produtos, dos últimos lançamentos de smartphones a cosméticos de alta performance.
            </p>
          </div>
          <div 
            className="mt-10 flex justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.6s', animationFillMode: 'forwards', opacity: 0 }}
          >
            <Button asChild size="lg">
              <Link href="/products">
                Ver todos os produtos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section 
        className="container mx-auto px-4 animate-fade-in-up"
        style={{ animationDelay: '0.8s', animationFillMode: 'forwards', opacity: 0 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12 font-heading">Navegue por Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {categories.map((category) => (
            <Link href={category.href} key={category.name}>
              <div className="group relative rounded-lg border border-border/30 bg-secondary/30 p-6 text-center transition-all duration-300 hover:border-brand hover:bg-secondary/70 transform hover:-translate-y-1">
                <div className="flex flex-col items-center justify-center gap-4">
                  <category.icon className="w-10 h-10 text-brand transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-base font-semibold text-foreground">{category.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section 
        className="container mx-auto px-4 pb-16 md:pb-24 animate-fade-in-up"
        style={{ animationDelay: '1.0s', animationFillMode: 'forwards', opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold font-heading">Produtos em Destaque</h2>
            <Button variant="link" asChild>
                <Link href="/products">
                    Ver todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, i) => (
             <div 
                key={product.id}
                className="animate-fade-in-up" 
                style={{ animationDelay: `${1.2 + i * 0.1}s`, animationFillMode: 'forwards', opacity: 0 }}
             >
                <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
