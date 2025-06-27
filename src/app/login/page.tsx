
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginForm } from './login-form';

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

export default function LoginPage() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 animate-fade-in-up">
            <Suspense fallback={<LoginSkeleton />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
