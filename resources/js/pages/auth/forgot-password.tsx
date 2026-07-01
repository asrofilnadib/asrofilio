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
import { login } from '@/routes';
import { email as forgotPasswordEmail } from '@/routes/password';

type ForgotPasswordProps = {
    status?: string;
};

function ForgotPassword({ status }: ForgotPasswordProps) {
    return (
        <GuestLayout title="Reset your password">
            <Head title="Forgot Password" />

            <Card>
                <CardHeader>
                    <CardTitle className="font-serif">
                        Forgot password
                    </CardTitle>
                    <CardDescription>
                        Enter your email and we'll send you a reset link
                    </CardDescription>
                </CardHeader>

                {status && (
                    <div className="mx-6 rounded-md bg-primary/10 px-4 py-2 text-sm text-primary">
                        {status}
                    </div>
                )}

                <Form {...forgotPasswordEmail.form()}>
                    {({ errors, processing, wasSuccessful }) => (
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
                                {wasSuccessful && (
                                    <p className="text-sm text-primary">
                                        Reset link sent! Check your email.
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Sending…'
                                        : 'Send reset link'}
                                </Button>
                                <Link
                                    href={login.url()}
                                    className="text-center text-sm text-primary hover:underline"
                                >
                                    Back to login
                                </Link>
                            </CardFooter>
                        </>
                    )}
                </Form>
            </Card>
        </GuestLayout>
    );
}

ForgotPassword.layout = (page: ReactNode) => page;

export default ForgotPassword;
