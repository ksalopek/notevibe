import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import ThemeToggle from '@/Components/ThemeToggle';
import CommandPalette from '@/Components/CommandPalette';
import Tooltip from '@/Components/Tooltip';
import { LayoutDashboard, Notebook, TrendingUp, Archive, Sparkles, BookOpen, Trash2, Settings } from 'lucide-react';
import ChangelogModal from '@/Components/ChangelogModal';
import { changelogData } from '@/data/changelog';

import { applyTheme } from '@/theme';

const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&color=7F9CF5&background=EBF4FF`;

export default function AuthenticatedLayout({ header, children }) {
    const { user, roles, permissions, is_impersonating, has_trashed_notes, has_archived_notes } = usePage().props.auth;
    const { app_theme, global_announcement } = usePage().props;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);

    useEffect(() => {
        if (app_theme) {
            applyTheme(app_theme);
        }
    }, [app_theme]);

    useEffect(() => {
        const latestVersion = changelogData[0]?.version;
        if (latestVersion) {
            const lastSeenVersion = localStorage.getItem('notivibe_last_version_seen');
            const hasCheckedThisSession = sessionStorage.getItem('notivibe_changelog_checked');
            
            if (lastSeenVersion !== latestVersion && !hasCheckedThisSession) {
                setShowChangelog(true);
            }
            
            sessionStorage.setItem('notivibe_changelog_checked', 'true');
        }
    }, []);

    const closeChangelog = () => {
        setShowChangelog(false);
        if (changelogData[0]?.version) {
            localStorage.setItem('notivibe_last_version_seen', changelogData[0].version);
        }
    };

    // Helper to check if the user is an admin
    const isAdmin = roles && roles.length > 0;
    const isSuperAdmin = roles && roles.includes('super_admin');
    const hasPerm = (perm) => isSuperAdmin || (permissions && permissions.includes(perm));

    return (
        <div className="h-full bg-transparent flex flex-col sm:min-h-screen">
            {/* Fixed subtle background image with overlay */}
            <div 
                className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/app_bg.png')" }}
            >
                <div className="absolute inset-0 bg-gray-50/85 dark:bg-gray-950/90 backdrop-blur-sm"></div>
            </div>

            {global_announcement && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white text-center shadow-md relative z-50">
                    <p className="text-sm font-semibold flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 opacity-80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                        {global_announcement}
                    </p>
                </div>
            )}
            {is_impersonating && (
                <div className="bg-indigo-600 px-4 py-3 text-white sm:px-6 lg:px-8 text-center flex justify-center items-center gap-4">
                    <span className="font-medium">You are currently impersonating {user.name}.</span>
                    <Link
                        href={route('impersonate.leave')}
                        method="post"
                        as="button"
                        className="rounded-md bg-white/20 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition"
                    >
                        Leave Impersonation
                    </Link>
                </div>
            )}
            <CommandPalette />
            <FlashMessage />
            <nav className="shrink-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md sticky top-0 z-40 border-b border-white/20 dark:border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')} className="group gap-2">
                                    <LayoutDashboard className={`w-4 h-4 transition-transform duration-300 ease-out group-hover:scale-110 ${route().current('dashboard') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500'}`} />
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('notes.index')} active={route().current('notes.index')} className="group gap-2">
                                    <Notebook className={`w-4 h-4 transition-transform duration-300 ease-out group-hover:scale-110 ${route().current('notes.index') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500'}`} />
                                    Notes
                                </NavLink>
                                <NavLink href={route('analytics.index')} active={route().current('analytics.index')} className="group gap-2">
                                    <TrendingUp className={`w-4 h-4 transition-transform duration-300 ease-out group-hover:scale-110 ${route().current('analytics.index') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500'}`} />
                                    Analytics
                                </NavLink>
                                <NavLink href={route('notes.archived')} active={route().current('notes.archived')} className="group gap-2">
                                    <Archive className={`w-4 h-4 transition-transform duration-300 ease-out group-hover:scale-110 ${route().current('notes.archived') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500'}`} fill={has_archived_notes ? 'currentColor' : 'none'} />
                                    Archive
                                </NavLink>
                                <NavLink href={route('help')} active={route().current('help')} className="group gap-2">
                                    <BookOpen className={`w-4 h-4 transition-transform duration-300 ease-out group-hover:scale-110 ${route().current('help') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500'}`} />
                                    Help
                                </NavLink>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Tooltip content="What's New">
                                <button
                                    onClick={() => setShowChangelog(true)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus:text-gray-300"
                                >
                                    <Sparkles className="w-5 h-5" />
                                </button>
                            </Tooltip>
                            <div className="sm:hidden">
                                <Tooltip content="Help">
                                    <Link
                                        href={route('help')}
                                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus:text-gray-300"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                    </Link>
                                </Tooltip>
                            </div>
                            <ThemeToggle />
                            <div className="hidden sm:block">
                                <Tooltip content={has_trashed_notes ? "Trash Can (Contains notes)" : "Trash Can (Empty)"}>
                                    <Link
                                        href={route('notes.trash')}
                                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus:text-gray-300"
                                    >
                                        {has_trashed_notes ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </Link>
                                </Tooltip>
                            </div>
                            {isAdmin && (
                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <Tooltip content="Admin Tools" placement="bottom-right">
                                                    <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition ease-in-out duration-150 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus:text-gray-300">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="12" r="3"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                                        </svg>
                                                    </button>
                                                </Tooltip>
                                            </span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('admin.index')}>Command Center</Dropdown.Link>
                                            {hasPerm('manage_users') && <Dropdown.Link href={route('admin.users')}>Manage Users</Dropdown.Link>}
                                            {hasPerm('manage_notes') && <Dropdown.Link href={route('admin.notes')}>All Notes</Dropdown.Link>}
                                            {hasPerm('manage_settings') && <Dropdown.Link href={route('admin.settings')}>Settings</Dropdown.Link>}
                                            {hasPerm('manage_reporting') && <Dropdown.Link href={route('admin.reporting')}>Reporting</Dropdown.Link>}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            )}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center p-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-transparent hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                <img src={getAvatar(user.name)} alt={user.name} className="w-8 h-8 rounded-full shadow-sm border border-gray-200 dark:border-gray-700" />
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-1 overflow-y-auto w-full">
                {header && (
                    <header className="bg-white dark:bg-gray-800 shadow shrink-0">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">{header}</div>
                    </header>
                )}

                <ChangelogModal show={showChangelog} onClose={closeChangelog} />
                <main className="pb-6 w-full">{children}</main>
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="shrink-0 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50 pb-safe pt-1 sm:hidden overflow-x-auto hide-scrollbar">
                <div className="flex justify-between px-2 items-center h-16 min-w-[360px] mx-auto">
                    <Link 
                        href={route('dashboard')} 
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${route().current('dashboard') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-[9px] font-medium truncate">Dashboard</span>
                    </Link>
                    <Link 
                        href={route('notes.index')} 
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${route().current('notes.index') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                    >
                        <Notebook className="w-5 h-5" />
                        <span className="text-[9px] font-medium truncate">Notes</span>
                    </Link>
                    <Link 
                        href={route('analytics.index')} 
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${route().current('analytics.index') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-[9px] font-medium truncate">Analytics</span>
                    </Link>
                    <Link 
                        href={route('notes.archived')} 
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${route().current('notes.archived') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                    >
                        <Archive className="w-5 h-5" fill={has_archived_notes ? 'currentColor' : 'none'} />
                        <span className="text-[9px] font-medium truncate">Archive</span>
                    </Link>
                    <Link 
                        href={route('notes.trash')} 
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${route().current('notes.trash') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                    >
                        {has_trashed_notes ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                        <span className="text-[9px] font-medium truncate">Trash</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
