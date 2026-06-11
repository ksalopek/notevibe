import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect, useState } from 'react';
import { applyTheme } from '@/theme';
import { HexColorPicker } from "react-colorful";

export default function Settings({ auth, appTheme }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        app_theme: appTheme || 'purple',
    });
    
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        applyTheme(data.app_theme);
    }, [data.app_theme]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    const themes = [
        { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
        { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
        { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
        { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
        { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Settings</h2>}
        >
            <Head title="Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white dark:bg-slate-800 shadow sm:rounded-lg">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Application Theme</h2>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Update the overall color theme for the application.
                                </p>
                            </header>

                            <form onSubmit={submit} className="mt-6 space-y-6">
                                <div>
                                    <InputLabel htmlFor="app_theme" value="Theme Color" />
                                    
                                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                                        {themes.map((theme) => (
                                            <label
                                                key={theme.id}
                                                className={`
                                                    cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                                                    ${data.app_theme === theme.id 
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'}
                                                `}
                                                onClick={() => setData('app_theme', theme.id)}
                                            >
                                                <input
                                                    type="radio"
                                                    name="app_theme"
                                                    value={theme.id}
                                                    checked={data.app_theme === theme.id}
                                                    onChange={(e) => setData('app_theme', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <span className={`h-8 w-8 rounded-full ${theme.color} mb-2`}></span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{theme.name}</span>
                                            </label>
                                        ))}

                                        {/* Custom Color Picker */}
                                        <div className="relative">
                                            <div
                                                className={`
                                                    cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                                                    ${data.app_theme.startsWith('#') 
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'}
                                                `}
                                                onClick={() => {
                                                    if (!data.app_theme.startsWith('#')) {
                                                        setData('app_theme', '#6366f1');
                                                    }
                                                    setShowPicker(true);
                                                }}
                                            >
                                                <div className="relative h-8 w-8 rounded-full mb-2 overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm">
                                                    {!data.app_theme.startsWith('#') && (
                                                        <div className="absolute inset-0 bg-[conic-gradient(red,yellow,lime,aqua,blue,fuchsia,red)] pointer-events-none z-0"></div>
                                                    )}
                                                    {data.app_theme.startsWith('#') && (
                                                        <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundColor: data.app_theme }}></div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Custom</span>
                                            </div>

                                            {showPicker && (
                                                <>
                                                    <div 
                                                        className="fixed inset-0 z-40"
                                                        onClick={(e) => { e.stopPropagation(); setShowPicker(false); }}
                                                    />
                                                    <div 
                                                        className="absolute top-[110%] left-1/2 -translate-x-1/2 z-50 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <HexColorPicker 
                                                            color={data.app_theme.startsWith('#') ? data.app_theme : '#6366f1'} 
                                                            onChange={(newColor) => setData('app_theme', newColor)} 
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <InputError className="mt-2" message={errors.app_theme} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>Save Changes</PrimaryButton>

                                    {recentlySuccessful && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Saved.</p>
                                    )}
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
