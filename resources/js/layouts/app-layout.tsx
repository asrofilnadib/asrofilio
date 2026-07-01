import type { ReactNode } from 'react';

import { TopNav } from '@/components/folio/top-nav';
import { PiracyNotice } from '@/components/folio/piracy-notice';

type AppLayoutProps = {
    children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <TopNav />
            <main className="flex-1">{children}</main>
            <PiracyNotice />
        </div>
    );
}

export default AppLayout;
