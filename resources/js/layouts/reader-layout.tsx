import type { ReactNode } from 'react';

type ReaderLayoutProps = {
    children: ReactNode;
};

function ReaderLayout({ children }: ReaderLayoutProps) {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-folio-cream">
            {children}
        </div>
    );
}

export default ReaderLayout;
