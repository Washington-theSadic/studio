"use client";

import { Suspense, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function LoginSkeleton() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Acessar sua Conta</CardTitle>
                <CardDescription>
                   <Skeleton className="h-5 w-48 mx-auto" />
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-2">
                       <Label htmlFor="email-skeleton">Email</Label>
                       <Skeleton id="email-skeleton" className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-skeleton">Senha</Label>
                        <Skeleton id="password-skeleton" className="h-10 w-full" />
                    </div>
                     <Button className="w-full" disabled>
                        <Skeleton className="h-5 w-20" />
                     </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await login(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Login',
        description: error.message,
      });
    } else {
      toast({
        title: 'Login bem-sucedido!',
        description: 'Bem-vindo de volta!',
      });
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Acessar sua Conta</CardTitle>
        <CardDescription>
          Não tem uma conta?{' '}
          <Link href="/register" className="text-brand hover:underline">
            Cadastre-se
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function LoginPage() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 animate-fade-in-up">
            <Suspense fallback={<LoginSkeleton />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}