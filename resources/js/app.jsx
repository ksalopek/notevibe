import '../css/app.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './Contexts/ThemeProvider';
import { Toaster } from 'sonner';

window.addEventListener('error', (event) => {
    document.body.innerHTML = `<div style="padding: 20px; color: red;"><h1>JavaScript Error</h1><pre style="white-space: pre-wrap;">${event.error?.stack || event.message}</pre></div>`;
});
window.addEventListener('unhandledrejection', (event) => {
    document.body.innerHTML = `<div style="padding: 20px; color: red;"><h1>Unhandled Promise Rejection</h1><pre style="white-space: pre-wrap;">${event.reason?.stack || event.reason}</pre></div>`;
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <App {...props} />
                <Toaster richColors position="top-right" />
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
