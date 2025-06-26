"use client";

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/lib/products';
import ProductCard from './product-card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ProductGridProps = {
  products: Product[];
};

const categories = ['Todos', 'Apple', 'Android', 'Minoxidil', 'Acessórios'] as const;
type Category = typeof categories[number];

export default function ProductGrid({ products }: ProductGridProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') as Category || 'Todos';
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories.includes(initialCategory) ? initialCategory : 'Todos'
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return products;
    }
    return products.filter(product => product.category === selectedCategory);
  }, [products, selectedCategory]);
  
  return (
    <div>
      <div className="mb-8 flex justify-center">
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category)}>
          <TabsList>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Nenhum produto encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
}
