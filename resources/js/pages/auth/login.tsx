import { Form, Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/guest-layout';
import { paths } from '@/lib/paths';
import { register } from '@/routes';
import { store as loginStore } from '@/routes/login';

type LoginProps = {
    canResetPassword?: boolean;
    status?: string;
};

function Login({ canResetPassword = true, status }: LoginProps) {
    return (
        <GuestLayout title="Welcome back">
            <Head title="Login" />

            <Card>
                <CardHeader>
                    <CardTitle className="font-serif">Sign in</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your library
                    </CardDescription>
                </CardHeader>

                {status && (
                    <div className="mx-6 rounded-md bg-primary/10 px-4 py-2 text-sm text-primary">
                        {status}
                    </div>
                )}

                <Form {...loginStore.form()} resetOnSuccess={['password']}>
                    {({ errors, processing }) => (
                        <>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        autoFocus
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href="/forgot-password"
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-normal"
                                    >
                                        Remember me
                                    </Label>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing ? 'Signing in…' : 'Sign in'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <a href={paths.googleAuth}>
                                        Continue with Google
                                    </a>
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link
                                        href={register.url()}
                                        className="text-primary hover:underline"
                                    >
                                        Register
                                    </Link>
                                </p>
                            </CardFooter>
                        </>
                    )}
                </Form>
            </Card>
        </GuestLayout>
    );
}

Login.layout = (page: ReactNode) => page;

export default Login;
