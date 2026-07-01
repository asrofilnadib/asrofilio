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
import { update as resetPasswordUpdate } from '@/routes/password';

type ResetPasswordProps = {
    email: string;
    token: string;
};

function ResetPassword({ email, token }: ResetPasswordProps) {
    return (
        <GuestLayout title="Choose a new password">
            <Head title="Reset Password" />

            <Card>
                <CardHeader>
                    <CardTitle className="font-serif">
                        Reset password
                    </CardTitle>
                    <CardDescription>
                        Enter your new password below
                    </CardDescription>
                </CardHeader>

                <Form
                    {...resetPasswordUpdate.form()}
                    transform={(data) => ({ ...data, token, email })}
                >
                    {({ errors, processing }) => (
                        <>
                            <CardContent className="space-y-4">
                                <input
                                    type="hidden"
                                    name="token"
                                    value={token}
                                />
                                <input
                                    type="hidden"
                                    name="email"
                                    value={email}
                                />
                                <div className="space-y-2">
                                    <Label htmlFor="email_display">
                                        Email
                                    </Label>
                                    <Input
                                        id="email_display"
                                        type="email"
                                        value={email}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        New password
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        autoFocus
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
                                        ? 'Resetting…'
                                        : 'Reset password'}
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

ResetPassword.layout = (page: ReactNode) => page;

export default ResetPassword;
