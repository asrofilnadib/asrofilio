import type { Auth } from '@/types/auth';
import type { Genre } from '@/types/book';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            genres: Genre[];
            flash: {
                success?: string;
                error?: string;
            };
            [key: string]: unknown;
        };
    }
}
