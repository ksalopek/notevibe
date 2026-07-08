import { useState, useEffect, useRef } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Popover } from '@headlessui/react';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import CommandPalette from '@/Components/CommandPalette';
import Tooltip from '@/Components/Tooltip';
import { LayoutDashboard, Notebook, TrendingUp, Archive, Sparkles, BookOpen, Trash2, Settings, Menu, X, LogOut, User, Shield, Folder, Tags, LayoutTemplate } from 'lucide-react';
import ChangelogModal from '@/Components/ChangelogModal';
import { changelogData } from '@/data/changelog';
import MeshGradientBackground from '@/Components/MeshGradientBackground';
import FolderManagerModal from '@/Components/FolderManagerModal';
import TagManagerModal from '@/Components/TagManagerModal';
import TemplateManagerModal from '@/Components/TemplateManagerModal';

import { applyTheme } from '@/theme';
import { useTheme } from '@/Contexts/ThemeProvider';

const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&color=7F9CF5&background=EBF4FF`;

export default function AuthenticatedLayout({ header, children }) {
    const { user, roles, permissions, is_impersonating, has_trashed_notes, has_archived_notes } = usePage().props.auth;
    const { app_theme, global_announcement, user_library } = usePage().props;
    const { setTheme } = useTheme();
    const preferences = user?.preferences || {};
    const folders = user_library?.folders || [];
    const tags = user_library?.tags || [];
    const templates = user_library?.templates || [];
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarExpanded') === 'true';
        }
        return false;
    });
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const headerRef = useRef(null);

    const isExpanded = isSidebarExpanded || isSidebarHovered;

    const toggleSidebar = () => {
        setIsSidebarExpanded((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sidebarExpanded', String(next));
            }
            return next;
        });
    };

    useEffect(() => {
        if (!headerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsScrolled(!entry.isIntersecting);
            },
            { rootMargin: '-64px 0px 0px 0px', threshold: 0 }
        );
        observer.observe(headerRef.current);
        return () => observer.disconnect();
    }, [header]);

    useEffect(() => {
        const handleOpenFolder = () => setIsFolderManagerOpen(true);
        const handleOpenTag = () => setIsTagManagerOpen(true);
        const handleOpenTemplate = () => setIsTemplateManagerOpen(true);

        window.addEventListener('open-folder-manager', handleOpenFolder);
        window.addEventListener('open-tag-manager', handleOpenTag);
        window.addEventListener('open-template-manager', handleOpenTemplate);

        return () => {
            window.removeEventListener('open-folder-manager', handleOpenFolder);
            window.removeEventListener('open-tag-manager', handleOpenTag);
            window.removeEventListener('open-template-manager', handleOpenTemplate);
        };
    }, []);

    useEffect(() => {
        const finalAccent = preferences.accent_color || app_theme;
        const finalTypography = preferences.typography || 'sans';
        
        if (finalAccent) {
            applyTheme(finalAccent, finalTypography);
        }
    }, [preferences.accent_color, preferences.typography, app_theme]);

    useEffect(() => {
        if (preferences.theme) {
            setTheme(preferences.theme);
        }
    }, [preferences.theme]);

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
        <div className="h-[100dvh] bg-transparent flex flex-col overflow-hidden">
            <MeshGradientBackground />

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
            <div className="flex flex-1 w-full min-h-0">
                {/* Desktop Sidebar */}
                <aside className={`hidden sm:flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-r border-gray-200 dark:border-gray-700/50 transition-all duration-300 ease-in-out z-40 sticky top-0 h-screen self-start ${isExpanded ? 'w-64' : 'w-16'}`}>
                    <div className="h-16 flex items-center border-b border-gray-200 dark:border-gray-700/50 shrink-0 pl-4 justify-start">
                        <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition focus:outline-none">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                    <div 
                        className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-y-auto hide-scrollbar"
                        onMouseEnter={() => setIsSidebarHovered(true)}
                        onMouseLeave={() => setIsSidebarHovered(false)}
                    >
                        <Link href={route('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${route().current('dashboard') ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}>
                            <LayoutDashboard className="w-5 h-5 shrink-0" />
                            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Dashboard</span>
                        </Link>
                        <Link href={route('notes.index')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${route().current('notes.index') ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}>
                            <Notebook className="w-5 h-5 shrink-0" />
                            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Notes</span>
                        </Link>
                        <Link href={route('analytics.index')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${route().current('analytics.index') ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}>
                            <TrendingUp className="w-5 h-5 shrink-0" />
                            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Analytics</span>
                        </Link>
                        <Link href={route('notes.archived')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${route().current('notes.archived') ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}>
                            <Archive className="w-5 h-5 shrink-0" fill={has_archived_notes ? 'currentColor' : 'none'} />
                            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Archive</span>
                        </Link>
                        <Link href={route('notes.trash')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${route().current('notes.trash') ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}>
                            <Trash2 className={`w-5 h-5 shrink-0 ${has_trashed_notes ? 'fill-current' : ''}`} />
                            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Trash</span>
                        </Link>
                        
                        <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700/50">
                            {isExpanded && <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage</div>}
                            <button onClick={() => setIsFolderManagerOpen(true)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100`}>
                                <Folder className="w-5 h-5 shrink-0" />
                                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Manage Folders</span>
                            </button>
                            <button onClick={() => setIsTagManagerOpen(true)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100`}>
                                <Tags className="w-5 h-5 shrink-0" />
                                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Manage Tags</span>
                            </button>
                            <button onClick={() => setIsTemplateManagerOpen(true)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100`}>
                                <LayoutTemplate className="w-5 h-5 shrink-0" />
                                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Manage Templates</span>
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <nav className="shrink-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md sticky top-0 z-40 border-b border-white/20 dark:border-gray-700/50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <div className="flex justify-between h-16 w-full">
                                <div className="flex flex-1 min-w-0 items-center">

                            {header && (
                                <div className={`sm:hidden transition-all duration-300 ease-in-out flex items-center h-full ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                    <div className="truncate font-semibold text-gray-800 dark:text-gray-200 [&>h2]:text-lg [&>h2]:truncate [&>h2]:leading-tight [&>h2]:m-0">
                                        {header}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                                <Tooltip content="What's New">
                                    <button
                                    onClick={() => setShowChangelog(true)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus:text-gray-300"
                                >
                                    <Sparkles className="w-5 h-5" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Help">
                                <Link
                                    href={route('help')}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus:text-gray-300"
                                >
                                    <BookOpen className="w-5 h-5" />
                                </Link>
                            </Tooltip>
                            {isAdmin && (
                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <Tooltip content="Admin Tools" placement="bottom-right">
                                                    <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition ease-in-out duration-150 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus:text-gray-300">
                                                        <Shield className="w-5 h-5" />
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
                            </div>
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
                                        {user.email !== 'guest@example.com' && (
                                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        )}
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

            <div id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden w-full relative">
                {header && (
                    <header ref={headerRef} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shrink-0 sm:sticky sm:top-0 z-30 transition-all duration-300 sm:shadow-sm">
                        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">{header}</div>
                    </header>
                )}

                <ChangelogModal show={showChangelog} onClose={closeChangelog} />
                <main className="pb-6 w-full">{children}</main>
            </div>
            </div>
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="shrink-0 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50 pb-safe pt-1 sm:hidden overflow-x-auto hide-scrollbar">
                <div className="flex justify-between px-2 items-center h-16 w-full mx-auto">
                    <Link 
                        href={route('dashboard')} 
                        className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-10 before:h-[3px] before:rounded-b-md before:transition-colors ${route().current('dashboard') ? 'text-primary-600 dark:text-primary-400 before:bg-primary-600 dark:before:bg-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 before:bg-transparent'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-[9px] font-medium truncate">Dashboard</span>
                    </Link>
                    <Link 
                        href={route('notes.index')} 
                        className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-10 before:h-[3px] before:rounded-b-md before:transition-colors ${route().current('notes.index') ? 'text-primary-600 dark:text-primary-400 before:bg-primary-600 dark:before:bg-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 before:bg-transparent'}`}
                    >
                        <Notebook className="w-5 h-5" />
                        <span className="text-[9px] font-medium truncate">Notes</span>
                    </Link>
                    <Link 
                        href={route('analytics.index')} 
                        className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-10 before:h-[3px] before:rounded-b-md before:transition-colors ${route().current('analytics.index') ? 'text-primary-600 dark:text-primary-400 before:bg-primary-600 dark:before:bg-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 before:bg-transparent'}`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-[9px] font-medium truncate">Analytics</span>
                    </Link>

                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <button 
                            onClick={() => setShowMobileMenu(true)}
                            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 focus:outline-none before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-10 before:h-[3px] before:rounded-b-md before:transition-colors ${showMobileMenu || route().current('admin.*') || route().current('notes.archived') || route().current('notes.trash') ? 'text-primary-600 dark:text-primary-400 before:bg-primary-600 dark:before:bg-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 before:bg-transparent'}`}
                        >
                            <Menu className="w-5 h-5" />
                            <span className="text-[9px] font-medium truncate">Menu</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Full Screen Mobile Menu */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 sm:hidden flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Menu</span>
                        <button 
                            onClick={() => setShowMobileMenu(false)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 space-y-6">
                        {/* Utilities */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Utilities</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setShowMobileMenu(false); setShowChangelog(true); }}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2 active:bg-gray-100 dark:active:bg-gray-800 transition"
                                >
                                    <Sparkles className="w-6 h-6 text-primary-500" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">What's New</span>
                                </button>
                                <Link
                                    href={route('help')}
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2 active:bg-gray-100 dark:active:bg-gray-800 transition"
                                >
                                    <BookOpen className="w-6 h-6 text-primary-500" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Help</span>
                                </Link>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
                            <div className="space-y-2">
                                <Link
                                    href={route('notes.archived')}
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                >
                                    <Archive className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill={has_archived_notes ? 'currentColor' : 'none'} />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Archive</span>
                                </Link>
                                <Link
                                    href={route('notes.trash')}
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                >
                                    {has_trashed_notes ? (
                                        <svg className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    )}
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Trash</span>
                                </Link>
                            </div>
                        </div>

                        {/* Manage */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Library</h3>
                            <div className="space-y-2">
                                <Link
                                    href={route('manage.index')}
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                >
                                    <Settings className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Library</span>
                                </Link>
                            </div>
                        </div>

                        {/* Admin */}
                        {isAdmin && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Admin</h3>
                                <div className="space-y-2">
                                    <Link
                                        href={route('admin.index')}
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                    >
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Command Center</span>
                                    </Link>
                                    {hasPerm('manage_users') && (
                                        <Link
                                            href={route('admin.users')}
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                        >
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</span>
                                        </Link>
                                    )}
                                    {hasPerm('manage_notes') && (
                                        <Link
                                            href={route('admin.notes')}
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                        >
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">All Notes</span>
                                        </Link>
                                    )}
                                    {hasPerm('manage_settings') && (
                                        <Link
                                            href={route('admin.settings')}
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                        >
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
                                        </Link>
                                    )}
                                    {hasPerm('manage_reporting') && (
                                        <Link
                                            href={route('admin.reporting')}
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                        >
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Reporting</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        
                        {/* Account */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Account</h3>
                            <div className="space-y-2">
                                {user.email !== 'guest@example.com' && (
                                    <Link
                                        href={route('profile.edit')}
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
                                    >
                                        <User className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Profile</span>
                                    </Link>
                                )}
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center p-3 w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl active:bg-red-100 dark:active:bg-red-900/40 transition"
                                >
                                    <LogOut className="w-5 h-5 mr-3 text-red-500 dark:text-red-400" />
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Log Out</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FolderManagerModal
                isOpen={isFolderManagerOpen}
                onClose={() => setIsFolderManagerOpen(false)}
                folders={folders}
            />
            <TagManagerModal
                isOpen={isTagManagerOpen}
                onClose={() => setIsTagManagerOpen(false)}
                tags={tags}
            />
            <TemplateManagerModal
                isOpen={isTemplateManagerOpen}
                onClose={() => setIsTemplateManagerOpen(false)}
                templates={templates}
            />
        </div>
    );
}
