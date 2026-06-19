import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect, useState, useRef } from 'react';
import { applyTheme } from '@/theme';
import { HexColorPicker } from "react-colorful";

// A simple toggle switch component
const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-4">
        <div className="flex flex-col pr-4">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
            {description && <span className="text-sm text-slate-500 dark:text-slate-400">{description}</span>}
        </div>
        <button
            type="button"
            className={`${
                checked ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
        >
            <span
                aria-hidden="true"
                className={`${
                    checked ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);

export default function Settings({ auth, appTheme, settings = {} }) {
    // Helper to safely parse booleans coming from DB (can be string '1' or 'true' or bool)
    const parseBool = (val) => val === '1' || val === 'true' || val === true;

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        app_theme: settings.app_theme || appTheme || 'purple',
        require_2fa: parseBool(settings.require_2fa),
        session_timeout: settings.session_timeout || '120',
        password_rules: settings.password_rules || 'standard',
        maintenance_mode: parseBool(settings.maintenance_mode),
        system_webhook_url: settings.system_webhook_url || '',
    });
    
    const [showPicker, setShowPicker] = useState(false);
    
    // File input refs for clearing UI if needed
    const logoInputRef = useRef(null);
    const faviconInputRef = useRef(null);

    useEffect(() => {
        applyTheme(data.app_theme);
    }, [data.app_theme]);

    const submit = (e) => {
        e.preventDefault();
        // Inertia uses POST for file uploads, even if we are "updating"
        post(route('admin.settings.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const themes = [
        { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
        { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
        { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
        { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
        { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
    ];

    const SectionHeader = ({ title, description }) => (
        <header className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </header>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Platform Settings</h2>}
        >
            <Head title="Platform Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    <form onSubmit={submit} className="space-y-8">
                        {/* BRANDING SECTION */}
                        <div className="p-4 sm:p-8 bg-white dark:bg-slate-800 shadow sm:rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <section className="max-w-2xl">
                                <SectionHeader title="Branding & Identity" description="Update the application theme." />

                                <div className="space-y-6">
                                    <div className="pt-4">
                                        <InputLabel value="Theme Color" />
                                        
                                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                                            {themes.map((theme) => (
                                                <label
                                                    key={theme.id}
                                                    className={`
                                                        cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                                                        ${data.app_theme === theme.id 
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'}
                                                    `}
                                                    onClick={() => setData('app_theme', theme.id)}
                                                >
                                                    <span className={`h-8 w-8 rounded-full ${theme.color} mb-2 shadow-inner`}></span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{theme.name}</span>
                                                </label>
                                            ))}

                                            {/* Custom Color Picker */}
                                            <div className="relative">
                                                <div
                                                    className={`
                                                        cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all h-full
                                                        ${data.app_theme.startsWith('#') 
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'}
                                                    `}
                                                    onClick={() => {
                                                        if (!data.app_theme.startsWith('#')) setData('app_theme', '#6366f1');
                                                        setShowPicker(true);
                                                    }}
                                                >
                                                    <div className="relative h-8 w-8 rounded-full mb-2 overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm">
                                                        {!data.app_theme.startsWith('#') && (
                                                            <div className="absolute inset-0 bg-[conic-gradient(red,yellow,lime,aqua,blue,fuchsia,red)] pointer-events-none"></div>
                                                        )}
                                                        {data.app_theme.startsWith('#') && (
                                                            <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: data.app_theme }}></div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Custom</span>
                                                </div>

                                                {showPicker && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowPicker(false); }} />
                                                        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 z-50 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                                            <HexColorPicker color={data.app_theme.startsWith('#') ? data.app_theme : '#6366f1'} onChange={(newColor) => setData('app_theme', newColor)} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <InputError className="mt-2" message={errors.app_theme} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* SECURITY SECTION */}
                        <div className="p-4 sm:p-8 bg-white dark:bg-slate-800 shadow sm:rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <section className="max-w-2xl">
                                <SectionHeader title="Security & Access" description="Manage session lifetimes and password requirements." />
                                
                                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-700/50">
                                    <Toggle 
                                        label="Enforce Two-Factor Authentication (2FA)" 
                                        description="Require all users to set up 2FA. (Note: Requires a 2FA integration package to be fully functional)."
                                        checked={data.require_2fa}
                                        onChange={(val) => setData('require_2fa', val)}
                                    />

                                    <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex flex-col">
                                            <InputLabel htmlFor="session_timeout" value="Session Timeout (Minutes)" className="text-slate-900 dark:text-slate-100" />
                                            <span className="text-sm text-slate-500 dark:text-slate-400">Idle time before a user is automatically logged out.</span>
                                        </div>
                                        <div className="w-full sm:w-32">
                                            <TextInput
                                                id="session_timeout"
                                                type="number"
                                                min="1"
                                                className="block w-full text-center"
                                                value={data.session_timeout}
                                                onChange={(e) => setData('session_timeout', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <InputError className="mt-0" message={errors.session_timeout} />

                                    <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex flex-col">
                                            <InputLabel htmlFor="password_rules" value="Password Complexity Rules" className="text-slate-900 dark:text-slate-100" />
                                            <span className="text-sm text-slate-500 dark:text-slate-400">Standard (8 chars) vs Strict (Uppercase, numbers, symbols).</span>
                                        </div>
                                        <div className="w-full sm:w-48">
                                            <select
                                                id="password_rules"
                                                value={data.password_rules}
                                                onChange={(e) => setData('password_rules', e.target.value)}
                                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 dark:focus:border-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 rounded-md shadow-sm w-full"
                                            >
                                                <option value="standard">Standard</option>
                                                <option value="strict">Strict</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* SYSTEM SECTION */}
                        <div className="p-4 sm:p-8 bg-white dark:bg-slate-800 shadow sm:rounded-2xl border border-red-100 dark:border-red-900/30">
                            <section className="max-w-2xl">
                                <SectionHeader title="System & Maintenance" description="System-level controls and webhook configurations." />
                                
                                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-700/50">
                                    <div className="pb-4">
                                        <Toggle 
                                            label="Maintenance Mode" 
                                            description="Take the site offline for regular users. Administrators will still have access."
                                            checked={data.maintenance_mode}
                                            onChange={(val) => setData('maintenance_mode', val)}
                                        />
                                        {data.maintenance_mode && (
                                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                Warning: Maintenance mode will block all non-admin traffic immediately upon saving.
                                            </div>
                                        )}
                                    </div>

                                    <div className="py-4">
                                        <InputLabel htmlFor="system_webhook_url" value="System Webhook URL (Slack/Discord)" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Receive notifications when new users register or critical events occur.</p>
                                        <TextInput
                                            id="system_webhook_url"
                                            type="url"
                                            className="mt-1 block w-full font-mono text-sm"
                                            value={data.system_webhook_url}
                                            onChange={(e) => setData('system_webhook_url', e.target.value)}
                                            placeholder="https://hooks.slack.com/services/..."
                                        />
                                        <InputError className="mt-2" message={errors.system_webhook_url} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* SUBMIT */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 sticky bottom-6 z-10 shadow-2xl">
                            <PrimaryButton disabled={processing} className="px-8 py-3 text-base">
                                {processing ? 'Saving...' : 'Save All Settings'}
                            </PrimaryButton>

                            {recentlySuccessful && (
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    Changes saved
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
