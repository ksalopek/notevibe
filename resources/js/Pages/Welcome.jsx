import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

// Third test comment to verify composer and npm build steps
export default function Welcome({ auth, appVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-zinc-950 dark:text-white/50">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-indigo-500 selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                <ApplicationLogo className="h-12 w-auto text-indigo-500 lg:h-16" />
                                <span className="ml-3 text-3xl font-bold text-gray-900 dark:text-white self-center tracking-tight">NoteVibe</span>
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end"></nav>
                        </header>

                        <main className="mt-16 flex flex-col items-center text-center">
                            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
                                Notes with a <span className="text-indigo-500">vibe</span>.
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl">
                                NoteVibe is the ultimate collection for your notes. Capture your thoughts, organize your ideas, and let your creativity flow in a space designed for your unique vibe.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-full bg-indigo-600/10 dark:bg-indigo-500/10 px-6 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/20 dark:hover:bg-indigo-500/20 shadow-sm border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-2 group"
                                    >
                                        Welcome back, {auth.user.name} &mdash; Go to Dashboard 
                                        <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300"
                                        >
                                            Create your free account
                                        </Link>
                                        <Link 
                                            href={route('login')} 
                                            className="rounded-full px-8 py-3.5 text-sm font-bold leading-6 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
                                        >
                                            Sign in to existing account
                                            <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </main>

                        <footer className="mt-32 py-16 text-center text-sm text-black dark:text-white/70">
                            &copy; {new Date().getFullYear()} NoteVibe. All rights reserved. <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md text-xs font-semibold">{appVersion}</span>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
