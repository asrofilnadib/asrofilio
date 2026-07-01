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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/guest-layout';
import { paths } from '@/lib/paths';
import { login } from '@/routes';
import { store as registerStore } from '@/routes/register';

function Register() {
    return (
        <GuestLayout title="Create your account">
            <Head title="Register" />

            <Card>
                <CardHeader>
                    <CardTitle className="font-serif">
                        Create account
                    </CardTitle>
                    <CardDescription>
                        Start building your personal library
                    </CardDescription>
                </CardHeader>

                <Form
                    {...registerStore.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                >
                    {({ errors, processing }) => (
                        <>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        autoComplete="name"
                                        required
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Creating account…'
                                        : 'Create account'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <a href={paths.googleAuth}>
                                        Sign up with Google
                                    </a>
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link
                                        href={login.url()}
                                        className="text-primary hover:underline"
                                    >
                                        Sign in
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

Register.layout = (page: ReactNode) => page;

export default Register;
