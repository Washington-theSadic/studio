export type Product = {
  id: string;
  name: string;
  description: string;
  long_description: string;
  price: number;
  sale_price?: number;
  images: string[];
  category: 'Apple' | 'Android' | 'Minoxidil' | 'Acessórios';
  condition: 'Novo' | 'Lacrado' | 'Recondicionado';
  featured?: boolean;
  status: 'ativo' | 'rascunho';
  stock: number;
  created_at?: string;
};

// Data is now fetched from Supabase, this is kept for type reference.
export const products: Product[] = [];
