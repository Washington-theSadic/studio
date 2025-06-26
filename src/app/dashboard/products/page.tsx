
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

export default function DashboardProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [formImages, setFormImages] = React.useState<(string | File)[]>([])
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormImages(product.images)
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setFormImages([])
    setIsSheetOpen(true)
  }
  
  const handleDelete = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) {
        toast({ title: "Erro", description: "Produto não encontrado.", variant: "destructive" });
        return;
    }

    if (productToDelete.images && productToDelete.images.length > 0) {
        const supabaseImageUrls = productToDelete.images.filter(url => url.includes('supabase.co'));
        
        if (supabaseImageUrls.length > 0) {
            const filePaths = supabaseImageUrls.map(url => {
                return url.substring(url.lastIndexOf('public-images/') + 'public-images/'.length);
            });

            const { error: imageError } = await supabase.storage
              .from('public-images')
              .remove(filePaths);
              
            if (imageError) {
              console.error("Erro ao deletar imagens do storage:", imageError);
              toast({ title: "Aviso", description: `Não foi possível remover as imagens, mas o produto será deletado. Erro: ${imageError.message}`, variant: "default" });
            }
        }
    }

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast({ title: "Erro ao deletar produto", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produto Removido!", description: "O produto e suas imagens foram removidos com sucesso." });
      fetchProducts();
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFormImages(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleImageRemove = (indexToRemove: number) => {
    setFormImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
        const formData = new FormData(event.currentTarget);

        const uploadedImageUrls: string[] = [];
        // Keep existing string URLs, upload new File objects
        for (const img of formImages) {
            if (typeof img === 'string') {
                uploadedImageUrls.push(img);
            } else {
                const file = img;
                const fileName = `${crypto.randomUUID()}-${file.name}`;
                const { data, error: uploadError } = await supabase.storage
                    .from('public-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('public-images')
                    .getPublicUrl(data.path);

                uploadedImageUrls.push(publicUrl);
            }
        }

        const priceStr = formData.get('price') as string;
        const salePriceStr = formData.get('sale_price') as string;

        // Common data for both insert and update
        const productPayload = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            long_description: formData.get('long_description') as string,
            price: parseFloat(priceStr),
            sale_price: salePriceStr ? parseFloat(salePriceStr) : null,
            category: formData.get('category') as Product['category'],
            status: formData.get('status') as Product['status'],
            stock: parseInt(formData.get('stock') as string, 10),
            featured: formData.get('featured') === 'on',
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ['https://placehold.co/600x600'],
        };
        
        let apiError: any;

        if (editingProduct) {
            // Update existing product
            const { error } = await supabase
                .from('products')
                .update(productPayload)
                .eq('id', editingProduct.id);
            apiError = error;
        } else {
            // Insert new product
            const { error } = await supabase
                .from('products')
                .insert(productPayload);
            apiError = error;
        }

        if (apiError) {
            throw apiError;
        }

        toast({ title: `Produto ${editingProduct ? 'Atualizado' : 'Adicionado'}!`, description: `${productPayload.name} foi salvo.` });
        fetchProducts();
        setIsSheetOpen(false);
        setEditingProduct(null);
        setFormImages([]);

    } catch (error: any) {
        console.error("Erro detalhado ao salvar produto:", error);
        toast({ title: "Erro ao salvar produto", description: error.message || "Ocorreu um erro desconhecido.", variant: "destructive" });
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
        <Button size="sm" className="h-8 gap-1" onClick={handleAddNew}>
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
                        <DropdownMenuItem onClick={() => handleEdit(product)}>Editar</DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start text-sm font-normal px-2 py-1.5 text-red-500 hover:text-red-600">
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
                <Input id="name" name="name" defaultValue={editingProduct?.name} required disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Textarea id="description" name="description" defaultValue={editingProduct?.description} required disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="long_description">Descrição Longa</Label>
                <Textarea id="long_description" name="long_description" rows={5} defaultValue={editingProduct?.long_description} required disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="images">Imagens</Label>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  {formImages.map((img, index) => {
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
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required disabled={isSubmitting} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sale_price">Preço Promocional (opcional)</Label>
                  <Input id="sale_price" name="sale_price" type="number" step="0.01" defaultValue={editingProduct?.sale_price || ''} disabled={isSubmitting} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select name="category" defaultValue={editingProduct?.category} required disabled={isSubmitting}>
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
                    <Label htmlFor="stock">Estoque</Label>
                    <Input id="stock" name="stock" type="number" defaultValue={editingProduct?.stock} required disabled={isSubmitting} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center space-x-2">
                    <Switch id="featured" name="featured" defaultChecked={editingProduct?.featured} disabled={isSubmitting} />
                    <Label htmlFor="featured">Produto em Destaque?</Label>
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingProduct?.status} required disabled={isSubmitting}>
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
