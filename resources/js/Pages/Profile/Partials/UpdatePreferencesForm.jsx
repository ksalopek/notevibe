import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';

export default function UpdatePreferencesForm({ className = '' }) {
    const user = usePage().props.auth.user;
    const preferences = user.preferences || {};

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            preferences: {
                theme: preferences.theme || 'system',
                accent_color: preferences.accent_color || 'purple',
                default_landing_page: preferences.default_landing_page || 'dashboard',
                typography: preferences.typography || 'sans',
            }
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.preferences'));
    };

    const updatePreference = (key, value) => {
        setData('preferences', { ...data.preferences, [key]: value });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Application Preferences
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Customize your workspace appearance and editor settings.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="theme" value="Theme Preference" />
                    <select
                        id="theme"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        value={data.preferences.theme}
                        onChange={(e) => updatePreference('theme', e.target.value)}
                    >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="system">System Default</option>
                    </select>
                </div>

                <div>
                    <InputLabel htmlFor="accent_color" value="Accent Color" />
                    <select
                        id="accent_color"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        value={data.preferences.accent_color}
                        onChange={(e) => updatePreference('accent_color', e.target.value)}
                    >
                        <option value="purple">Purple (Default)</option>
                        <option value="orange">Orange</option>
                        <option value="emerald">Emerald</option>
                        <option value="blue">Blue</option>
                        <option value="rose">Rose</option>
                    </select>
                </div>

                <div>
                    <InputLabel htmlFor="default_landing_page" value="Default Landing Page" />
                    <select
                        id="default_landing_page"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        value={data.preferences.default_landing_page}
                        onChange={(e) => updatePreference('default_landing_page', e.target.value)}
                    >
                        <option value="dashboard">Dashboard</option>
                        <option value="notes.index">My Notes</option>
                    </select>
                </div>

                <div>
                    <InputLabel htmlFor="typography" value="Default Typography" />
                    <select
                        id="typography"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        value={data.preferences.typography}
                        onChange={(e) => updatePreference('typography', e.target.value)}
                    >
                        <option value="sans">Sans-Serif (Default)</option>
                        <option value="serif">Serif</option>
                        <option value="mono">Monospace</option>
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save Preferences</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
