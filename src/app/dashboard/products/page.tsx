
"use client"

import * as React from "react"
import Image from "next/image"
import { PlusCircle, MoreHorizontal, X, Loader2, Copy, Trash2, Archive, ArchiveRestore, ChevronLeft, ChevronRight } from "lucide-react"

import type { Product } from "@/lib/products"
import { supabase, supabaseUrl } from "@/lib/supabase"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"

type FormState = Omit<Product, 'id' | 'created_at' | 'images'> & { images: (string | File)[] };

const getInitialFormState = (): FormState => ({
  name: '',
  description: '',
  long_description: '',
  price: 0.0,
  sale_price: undefined,
  category: 'Apple',
  condition: 'Novo',
  status: 'ativo',
  stock: 0,
  featured: false,
  images: [],
});

const PRODUCTS_PER_PAGE = 15;
const productCategories: (Product['category'] | 'all')[] = ['all', 'Apple', 'Android', 'Minoxidil', 'Acessórios'];

export default function DashboardProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  
  const [formState, setFormState] = React.useState<FormState>(getInitialFormState());
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isBulkSubmitting, setIsBulkSubmitting] = React.useState(false)
  const { toast } = useToast();

  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<(Product['category'] | 'all')>('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Erro ao buscar produtos", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, [toast]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Memoized data for filtering and pagination
  const filteredProducts = React.useMemo(() => {
    if (activeCategory === 'all') {
      return products;
    }
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  React.useEffect(() => {
      setCurrentPage(1);
      setSelectedProductIds([]);
  }, [activeCategory]);
  
  const handleSheetOpen = (product: Product | null) => {
    setEditingProduct(product);
    if (product) {
      const { id, created_at, ...productData } = product;
      setFormState({ 
        ...getInitialFormState(), 
        ...productData, 
        images: product.images,
        condition: product.condition || 'Novo',
      });
    } else {
      setFormState(getInitialFormState());
    }
    setIsSheetOpen(true);
  };

  const handleDuplicate = async (productId: string) => {
    const productToDuplicate = products.find(p => p.id === productId);
    if (!productToDuplicate) {
        toast({ title: "Erro", description: "Produto não encontrado.", variant: "destructive" });
        return;
    }

    const { id, created_at, ...newProductData } = productToDuplicate;

    const duplicatedProductPayload = {
        ...newProductData,
        name: `${newProductData.name} (Cópia)`,
        status: 'rascunho' as const,
        featured: false,
    };

    try {
        const { error } = await supabase
            .from('products')
            .insert([duplicatedProductPayload]);

        if (error) {
            throw new Error(`Falha ao duplicar o produto: ${error.message}`);
        }

        toast({ title: "Produto Duplicado!", description: `O produto "${productToDuplicate.name}" foi duplicado com sucesso.` });
        fetchProducts();

    } catch (error: any) {
        const errorMessage = error.message || "Ocorreu um erro desconhecido ao tentar duplicar o produto.";
        toast({ title: "Erro ao duplicar produto", description: errorMessage, variant: "destructive" });
    }
  };
  
  const handleDelete = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) {
        toast({ title: "Erro", description: "Produto não encontrado.", variant: "destructive" });
        return;
    }

    try {
        if (productToDelete.images && productToDelete.images.length > 0) {
            const bucketName = 'public-images';
            const filePaths = productToDelete.images
                .map(url => {
                    if (!url || !url.startsWith(supabaseUrl)) return null;
                    try {
                        const urlObject = new URL(url);
                        const pathKey = `/storage/v1/object/public/${bucketName}/`;
                        if (urlObject.pathname.includes(pathKey)) {
                            return decodeURIComponent(urlObject.pathname.split(pathKey)[1]);
                        }
                    } catch (e) {
                         console.error('URL de imagem inválida, pulando a remoção:', url);
                         return null;
                    }
                    return null;
                })
                .filter((path): path is string => !!path);

            if (filePaths.length > 0) {
                const { error: imageError } = await supabase.storage.from(bucketName).remove(filePaths);
                if (imageError) {
                    throw new Error(`Falha ao remover imagens do armazenamento: ${imageError.message}`);
                }
            }
        }

        const { error: dbError } = await supabase.from('products').delete().eq('id', productId);
        if (dbError) {
            throw new Error(`O produto não foi deletado do banco de dados. Erro: ${dbError.message}`);
        }

        toast({ title: "Produto Removido!", description: "O produto e suas imagens foram removidos com sucesso." });
        fetchProducts();

    } catch (error: any) {
        const errorMessage = error.message || "Ocorreu um erro desconhecido ao tentar deletar o produto.";
        toast({ title: "Erro ao deletar produto", description: errorMessage, variant: "destructive" });
    }
  }


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFormState(prev => ({ ...prev, images: [...prev.images, ...Array.from(files)] }));
    }
  };

  const handleImageRemove = (indexToRemove: number) => {
    setFormState(prev => ({ ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({...prev, [name]: value}));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
        const uploadedImageUrls: string[] = [];

        for (const img of formState.images) {
            if (typeof img === 'string') {
                uploadedImageUrls.push(img);
            } else {
                const file = img;
                const fileName = `${crypto.randomUUID()}-${file.name}`;
                const { data, error: uploadError } = await supabase.storage.from('public-images').upload(fileName, file);
                if (uploadError) throw new Error(`Falha no upload da imagem: ${uploadError.message}.`);
                const { data: { publicUrl } } = supabase.storage.from('public-images').getPublicUrl(data.path);
                uploadedImageUrls.push(publicUrl);
            }
        }

        const productPayload = {
            ...formState,
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ['https://placehold.co/600x600.png'],
            price: Number(formState.price) || 0,
            sale_price: formState.sale_price ? Number(formState.sale_price) : null,
            stock: Number(formState.stock) || 0,
        };
        
        const { error } = editingProduct
          ? await supabase.from('products').update(productPayload).eq('id', editingProduct.id)
          : await supabase.from('products').insert([productPayload]);

        if (error) {
            throw new Error(`Falha ao salvar no banco de dados: ${error.message}`);
        }

        toast({ title: `Produto ${editingProduct ? 'Atualizado' : 'Adicionado'}!`, description: `${productPayload.name} foi salvo com sucesso.` });
        fetchProducts();
        setIsSheetOpen(false);

    } catch (error: any) {
        toast({ title: "Erro ao salvar produto", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleBulkStatusChange = async (status: 'ativo' | 'rascunho') => {
    if (selectedProductIds.length === 0) return;
    setIsBulkSubmitting(true);
    try {
      const { error } = await supabase.from('products').update({ status }).in('id', selectedProductIds);
      if (error) throw error;
      toast({ title: 'Sucesso!', description: `${selectedProductIds.length} produto(s) foram atualizados.` });
      await fetchProducts();
      setSelectedProductIds([]);
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar produtos', description: error.message, variant: 'destructive' });
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkSubmitting(true);

    const productsToDelete = products.filter(p => selectedProductIds.includes(p.id));
    if (productsToDelete.length === 0) {
        toast({ title: "Erro", description: "Produtos selecionados não encontrados.", variant: "destructive" });
        setIsBulkSubmitting(false);
        return;
    }

    try {
        const allImageUrls = productsToDelete.flatMap(p => p.images || []);
        if (allImageUrls.length > 0) {
            const bucketName = 'public-images';
            const filePaths = allImageUrls
                .map(url => {
                    if (!url || !url.startsWith(supabaseUrl)) return null;
                    try {
                        const urlObject = new URL(url);
                        const pathKey = `/storage/v1/object/public/${bucketName}/`;
                        if (urlObject.pathname.includes(pathKey)) {
                            return decodeURIComponent(urlObject.pathname.split(pathKey)[1]);
                        }
                    } catch (e) { return null; }
                    return null;
                })
                .filter((path): path is string => !!path);

            if (filePaths.length > 0) {
                const { error: imageError } = await supabase.storage.from(bucketName).remove(filePaths);
                if (imageError) throw new Error(`Falha ao remover imagens: ${imageError.message}`);
            }
        }

        const { error: dbError } = await supabase.from('products').delete().in('id', selectedProductIds);
        if (dbError) throw dbError;
        
        toast({ title: "Produtos Removidos!", description: `${selectedProductIds.length} produto(s) foram removidos com sucesso.` });
        await fetchProducts();
        setSelectedProductIds([]);

    } catch (error: any) {
        toast({ title: "Erro ao deletar produtos", description: error.message, variant: "destructive" });
    } finally {
        setIsBulkSubmitting(false);
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  };
  
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" className="h-8 gap-1" onClick={() => handleSheetOpen(null)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Adicionar Produto
          </span>
        </Button>
        <div className="ml-auto flex items-center gap-2">
         {selectedProductIds.length > 0 && (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1" disabled={isBulkSubmitting}>
                        {isBulkSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                        Ações em Massa ({selectedProductIds.length})
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handleBulkStatusChange('ativo')} disabled={isBulkSubmitting}>
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Ativar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleBulkStatusChange('rascunho')} disabled={isBulkSubmitting}>
                        <Archive className="mr-2 h-4 w-4" />
                        Mover para Rascunho
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button
                            variant="ghost"
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full justify-start font-normal text-destructive hover:bg-destructive/10"
                            disabled={isBulkSubmitting}
                          >
                           <Trash2 className="mr-2 h-4 w-4" /> Deletar Selecionados
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. Isso irá deletar permanentemente os {selectedProductIds.length} produtos selecionados e suas imagens.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">
                                  Deletar
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
         )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            Gerencie seus produtos aqui. Adicione, edite ou remova produtos.
          </CardDescription>
           <div className="pt-4">
            <Select value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat === 'all' ? 'Todas as Categorias' : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
           {loading ? (
             <div className="flex justify-center items-center h-64">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
           ) : (
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="w-[40px]">
                    <Checkbox
                        checked={paginatedProducts.length > 0 && selectedProductIds.length === paginatedProducts.length}
                        onCheckedChange={(checked) => {
                           const pageIds = paginatedProducts.map(p => p.id);
                           if (checked) {
                               const newSelectedIds = [...new Set([...selectedProductIds, ...pageIds])];
                               setSelectedProductIds(newSelectedIds);
                           } else {
                               setSelectedProductIds(selectedProductIds.filter(id => !pageIds.includes(id)));
                           }
                        }}
                        aria-label="Selecionar todos na página atual"
                    />
                 </TableHead>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Imagem</span>
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Preço</TableHead>
                <TableHead className="hidden md:table-cell">Estoque</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map(product => (
                <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) ? "selected" : ""}>
                    <TableCell>
                        <Checkbox 
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setSelectedProductIds([...selectedProductIds, product.id]);
                                } else {
                                    setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                                }
                            }}
                            aria-label={`Selecionar produto ${product.name}`}
                        />
                    </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.images[0]}
                      width="64"
                      data-ai-hint={`${product.category.toLowerCase()} product`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'ativo' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatPrice(product.price)}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleSheetOpen(product)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(product.id)}>
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button
                                variant="ghost"
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full justify-start font-normal text-destructive hover:bg-destructive/10"
                              >
                                Deletar
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso irá deletar permanentemente o produto e suas imagens.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90">
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           )}
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
             {selectedProductIds.length} de {filteredProducts.length} produto(s) selecionado(s).
          </div>
          {totalPages > 1 && (
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                  Página {currentPage} de {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Próximo
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <form onSubmit={handleFormSubmit}>
            <SheetHeader>
              <SheetTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</SheetTitle>
              <SheetDescription>
                Preencha os detalhes do produto aqui. Clique em salvar quando terminar.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto px-1">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" value={formState.name || ''} onChange={handleInputChange} required disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Textarea id="description" name="description" value={formState.description || ''} onChange={handleInputChange} required disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="long_description">Descrição Longa</Label>
                <Textarea id="long_description" name="long_description" rows={5} value={formState.long_description || ''} onChange={handleInputChange} required disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="images">Imagens</Label>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  {formState.images.map((img, index) => {
                    const src = typeof img === 'string' ? img : URL.createObjectURL(img);
                    return (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={src}
                          alt={`Imagem do produto ${index + 1}`}
                          fill
                          className="rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => handleImageRemove(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remover imagem</span>
                        </Button>
                      </div>
                    )
                  })}
                </div>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input id="price" name="price" type="number" step="0.01" value={formState.price || ''} onChange={handleInputChange} required disabled={isSubmitting} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sale_price">Preço Promocional (opcional)</Label>
                  <Input id="sale_price" name="sale_price" type="number" step="0.01" value={formState.sale_price || ''} onChange={handleInputChange} disabled={isSubmitting} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select name="category" value={formState.category} onValueChange={(value) => setFormState(p => ({...p, category: value as Product['category']}))} required disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apple">Apple</SelectItem>
                      <SelectItem value="Android">Android</SelectItem>
                      <SelectItem value="Minoxidil">Minoxidil</SelectItem>
                      <SelectItem value="Acessórios">Acessórios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="condition">Condição</Label>
                    <Select name="condition" value={formState.condition} onValueChange={(value) => setFormState(p => ({...p, condition: value as Product['condition']}))} required disabled={isSubmitting}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a condição" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Novo">Novo</SelectItem>
                            <SelectItem value="Lacrado">Lacrado</SelectItem>
                            <SelectItem value="Recondicionado">Recondicionado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="stock">Estoque</Label>
                    <Input id="stock" name="stock" type="number" value={formState.stock || ''} onChange={handleInputChange} required disabled={isSubmitting} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" value={formState.status} onValueChange={(value) => setFormState(p => ({...p, status: value as Product['status']}))} required disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="featured" name="featured" checked={formState.featured} onCheckedChange={(checked) => setFormState(p => ({...p, featured: checked}))} disabled={isSubmitting} />
                <Label htmlFor="featured">Produto em Destaque?</Label>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar produto
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
