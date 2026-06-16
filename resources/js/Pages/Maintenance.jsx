import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Maintenance() {
    return (
        <GuestLayout>
            <Head title="Under Maintenance" />

            <div className="text-center py-12">
                <div className="mb-6 flex justify-center">
                    <svg className="w-24 h-24 text-primary-500 animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.492-3.053c.24-.295.4-.645.459-1.026a3.75 3.75 0 10-5.182-5.182c-.381.058-.731.218-1.026.459L3 12.58m8.42 2.59l-4.42-4.42" />
                    </svg>
                </div>
                
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                    We'll be right back!
                </h1>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    The application is currently undergoing scheduled maintenance to bring you an even better experience. We'll be back online shortly!
                </p>
                
                <a 
                    href={route('login')}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                    Admin Login &rarr;
                </a>
            </div>
        </GuestLayout>
    );
}
