import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import { Toaster } from '@/components/ui/sonner';
import { initTheme } from '@/lib/themes';

initTheme();

const appName = import.meta.env.VITE_APP_NAME || 'Asrofilio';

type PageModule = {
    default: ComponentType & {
        layout?: (page: ReactNode) => ReactNode;
    };
};

const pages = import.meta.glob<PageModule>('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        const module = await page();
        module.default.layout =
            module.default.layout ?? ((page: ReactNode) => page);

        return module.default;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster />
            </>
        );
    },
    progress: {
        color: '#7D7517',
    },
});
