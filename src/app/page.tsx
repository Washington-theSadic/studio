import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { products } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Smartphone, Pill, Headset, ShoppingCart } from 'lucide-react';

const categories = [
  { name: 'iPhone', icon: Smartphone, href: '/products?category=iPhone' },
  { name: 'Android', icon: Smartphone, href: '/products?category=Android' },
  { name: 'Minoxidil', icon: Pill, href: '/products?category=Minoxidil' },
  { name: 'Acessórios', icon: Headset, href: '/products?category=Acessórios' },
];

export default function Home() {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] bg-gray-200 flex items-center justify-center text-center overflow-hidden">
        <Image
          src="https://placehold.co/1600x900"
          alt="Banner de promoção"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-40"
          data-ai-hint="electronics store"
        />
        <div className="relative z-10 p-6 bg-background/70 rounded-lg shadow-xl">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-foreground">
            A melhor Loja de importados do Oeste
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
            Encontre os melhores produtos importados, de smartphones a cosméticos, com os melhores preços e qualidade.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/products">Ver todos os produtos</Link>
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">Nossas Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link href={category.href} key={category.name}>
                <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                  <CardContent className="flex flex-col items-center justify-center gap-4">
                    <category.icon className="w-12 h-12 text-brand" />
                    <span className="text-lg font-semibold">{category.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">Produtos em Destaque</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
