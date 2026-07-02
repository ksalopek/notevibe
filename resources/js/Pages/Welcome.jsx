import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

// Third test comment to verify composer and npm build steps
export default function Welcome({ auth, appVersion, enableGuestDemo }) {
    return (
        <>
            <Head title="Welcome" />
            <div 
                className="relative bg-gray-50 text-black/50 dark:bg-zinc-950 dark:text-white/50 min-h-screen bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/welcome_bg.png')" }}
            >
                {/* Background overlay for readability */}
                <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm"></div>

                <div className="relative z-10 flex min-h-screen flex-col items-center justify-center selection:bg-primary-500 selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                <ApplicationLogo className="h-12 w-auto text-primary-500 lg:h-16" />
                                <span className="ml-3 text-3xl font-bold text-gray-900 dark:text-white self-center tracking-tight">NoteVibe</span>
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end"></nav>
                        </header>

                        <main className="mt-16 flex flex-col items-center text-center">
                            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
                                Notes with a <span className="text-primary-500">vibe</span>.
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl">
                                NoteVibe is the ultimate collection for your notes. Capture your thoughts, organize your ideas, and let your creativity flow in a space designed for your unique vibe.
                            </p>
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-full bg-primary-600/10 dark:bg-primary-500/10 px-6 py-3 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-600/20 dark:hover:bg-primary-500/20 shadow-sm border border-primary-200 dark:border-primary-800 transition-all flex items-center gap-2 group"
                                    >
                                        Welcome back, {auth.user.name} &mdash; Go to Dashboard 
                                        <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="rounded-full bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-primary-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-300"
                                        >
                                            Create your free account
                                        </Link>
                                        <Link 
                                            href={route('login')} 
                                            className="rounded-full px-8 py-3.5 text-sm font-bold leading-6 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
                                        >
                                            Sign in to existing account
                                            <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>
                                        {enableGuestDemo && (
                                            <Link 
                                                href={route('login.guest')} 
                                                method="post"
                                                as="button"
                                                className="rounded-full px-8 py-3.5 text-sm font-bold leading-6 text-emerald-700 dark:text-emerald-300 hover:text-white dark:hover:text-white bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-500 dark:hover:bg-emerald-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
                                            >
                                                Try Guest Demo
                                                <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </main>

                        <footer className="mt-32 py-16 text-center text-sm text-black dark:text-white/70">
                            &copy; {new Date().getFullYear()} NoteVibe. All rights reserved. <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-md text-xs font-semibold">{appVersion}</span>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
