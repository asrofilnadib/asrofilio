export type UserRole = 'user' | 'admin';

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Auth = {
    user: User | null;
};
