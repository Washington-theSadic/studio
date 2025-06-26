export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: 'Apple' | 'Android' | 'Minoxidil' | 'Acessórios';
  featured?: boolean;
  status: 'ativo' | 'rascunho';
  stock: number;
  created_at?: string;
};

// Data is now fetched from Supabase, this is kept for type reference.
export const products: Product[] = [];
