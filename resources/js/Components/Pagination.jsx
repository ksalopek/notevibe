import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links, only = [] }) {
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-center mt-6 gap-1">
            {links.map((link, key) => {
                if (link.url === null) {
                    return (
                        <div
                            key={key}
                            className="mb-1 px-4 py-3 text-sm leading-4 text-slate-400 border rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={key}
                        className={`mb-1 px-4 py-3 text-sm leading-4 border rounded hover:bg-slate-100 dark:hover:bg-slate-700 focus:border-primary-500 focus:text-primary-500 transition-colors ${
                            link.active ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                        href={link.url}
                        preserveScroll
                        preserveState
                        only={only.length > 0 ? only : undefined}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}
