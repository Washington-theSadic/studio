
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/products';
import ProductGrid from '@/components/product-grid';

function ProductGridFallback() {
    return <div>Carregando produtos...</div>;
}

export default async function ProductsPage() {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false });

  const products: Product[] = data ?? [];

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
