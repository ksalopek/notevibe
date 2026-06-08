import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

// Second test comment to trigger NAS scheduled task update and check logs
export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-zinc-950 dark:text-white/50">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-indigo-500 selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                <ApplicationLogo className="h-12 w-auto text-indigo-500 lg:h-16" />
                                <span className="ml-3 text-3xl font-bold text-gray-900 dark:text-white self-center tracking-tight">NotiVibe</span>
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-indigo-500 dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-indigo-500 dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-indigo-500 dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-16 flex flex-col items-center text-center">
                            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
                                Notes with a <span className="text-indigo-500">vibe</span>.
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl">
                                NotiVibe is the ultimate collection for your notes. Capture your thoughts, organize your ideas, and let your creativity flow in a space designed for your unique vibe.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
                                >
                                    Get started
                                </Link>
                                <Link href={route('login')} className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-indigo-500 transition">
                                    Log in <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </main>

                        <footer className="mt-32 py-16 text-center text-sm text-black dark:text-white/70">
                            &copy; {new Date().getFullYear()} NotiVibe. All rights reserved.
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
