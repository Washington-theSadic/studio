
"use client"

import * as React from "react"
import Image from "next/image"
import { PlusCircle, MoreHorizontal, X, Loader2 } from "lucide-react"

import type { Product } from "@/lib/products"
import { supabase } from "@/lib/supabase"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
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


export default function DashboardProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  
  const [formState, setFormState] = React.useState<FormState>(getInitialFormState());
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast();

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
  
  const handleDelete = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) {
        toast({ title: "Erro", description: "Produto não encontrado.", variant: "destructive" });
        return;
    }

    try {
        if (productToDelete.images && productToDelete.images.length > 0) {
            const supabaseImageUrls = productToDelete.images.filter(url => url && url.includes('supabase.co'));
            
            if (supabaseImageUrls.length > 0) {
                const filePaths = supabaseImageUrls.map(url => {
                    try {
                        const urlObject = new URL(url);
                        const pathSegments = urlObject.pathname.split('/');
                        const bucketIndex = pathSegments.findIndex(segment => segment === 'public-images');
                        if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) return '';
                        return pathSegments.slice(bucketIndex + 1).join('/');
                    } catch (e) {
                        console.error('URL inválida no array de imagens, pulando:', url);
                        return '';
                    }
                }).filter(Boolean);

                if (filePaths.length > 0) {
                    console.log("Tentando deletar os seguintes arquivos do storage:", filePaths);
                    const { error: imageError } = await supabase.storage
                        .from('public-images')
                        .remove(filePaths);
                    
                    if (imageError) {
                        throw new Error(`Falha ao remover imagens do armazenamento: ${imageError.message}`);
                    }
                }
            }
        }

        const { error: dbError } = await supabase.from('products').delete().eq('id', productId);
        
        if (dbError) {
            throw new Error(`As imagens podem ter sido removidas, mas o produto não foi deletado do banco de dados. Erro: ${dbError.message}`);
        }

        toast({ title: "Produto Removido!", description: "O produto e suas imagens foram removidos com sucesso." });
        fetchProducts();

    } catch (error: any) {
        console.error("Erro detalhado ao deletar produto:", JSON.stringify(error, null, 2));
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
                const { data, error: uploadError } = await supabase.storage
                    .from('public-images')
                    .upload(fileName, file);

                if (uploadError) {
                    throw new Error(`Falha no upload da imagem: ${uploadError.message}. Verifique as políticas de armazenamento (RLS) no Supabase.`);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('public-images')
                    .getPublicUrl(data.path);

                uploadedImageUrls.push(publicUrl);
            }
        }

        const price = parseFloat(String(formState.price || '0'));
        const stock = parseInt(String(formState.stock || '0'), 10);
        
        if (isNaN(price) || isNaN(stock)) {
            throw new Error("Preço e Estoque devem ser números válidos.");
        }
        
        const salePriceStr = String(formState.sale_price || '');
        const sale_price = (salePriceStr && !isNaN(parseFloat(salePriceStr))) ? parseFloat(salePriceStr) : null;

        const productPayload = {
            name: formState.name,
            description: formState.description,
            long_description: formState.long_description,
            price: price,
            sale_price: sale_price,
            category: formState.category,
            condition: formState.condition,
            status: formState.status,
            stock: stock,
            featured: formState.featured,
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ['https://placehold.co/600x600'],
        };
        
        console.log("Enviando para o Supabase:", productPayload);

        let apiError;
        if (editingProduct) {
            const { error } = await supabase
                .from('products')
                .update(productPayload)
                .eq('id', editingProduct.id);
            apiError = error;
        } else {
            const { error } = await supabase
                .from('products')
                .insert([productPayload]);
            apiError = error;
        }

        if (apiError) {
            console.error("Erro do Supabase:", JSON.stringify(apiError, null, 2));
            throw new Error(`Falha ao salvar no banco de dados: ${apiError.message}`);
        }

        toast({ title: `Produto ${editingProduct ? 'Atualizado' : 'Adicionado'}!`, description: `${productPayload.name} foi salvo com sucesso.` });
        fetchProducts();
        setIsSheetOpen(false);

    } catch (error: any) {
        console.error("Erro detalhado ao salvar produto:", JSON.stringify(error, null, 2));
        const errorMessage = error.message || "Ocorreu um erro desconhecido. Verifique as permissões de acesso (RLS) no Supabase e se todos os campos estão preenchidos corretamente.";
        toast({ title: "Erro ao salvar produto", description: errorMessage, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" className="h-8 gap-1" onClick={() => handleSheetOpen(null)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Adicionar Produto
          </span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            Gerencie seus produtos aqui. Adicione, edite ou remova produtos.
          </CardDescription>
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
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Imagem</span>
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead className="hidden md:table-cell">Preço</TableHead>
                <TableHead className="hidden md:table-cell">Estoque</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
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
                  <TableCell>
                    <Badge variant="outline">{product.condition}</Badge>
                  </TableCell>
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
            Mostrando <strong>1-{products.length}</strong> de <strong>{products.length}</strong> produtos
          </div>
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
