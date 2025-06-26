
import { products } from '@/lib/products';
import ProductGrid from '@/components/product-grid';
import { Suspense } from 'react';

function ProductGridFallback() {
    return <div>Carregando produtos...</div>;
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-2 text-center">Nossos Produtos</h1>
      <p className="text-muted-foreground text-center mb-12">Encontre tudo o que você precisa em um só lugar.</p>
      <Suspense fallback={<ProductGridFallback />}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  );
}
