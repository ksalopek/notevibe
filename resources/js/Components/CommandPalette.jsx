import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { router } from '@inertiajs/react';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);

    // Toggle the menu when ⌘K or Ctrl+K is pressed
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    return (
        <Command.Dialog 
            open={open} 
            onOpenChange={setOpen} 
            label="Global Command Menu"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-500/50 dark:bg-gray-900/70 backdrop-blur-sm transition-opacity"
        >
            <div className="w-full max-w-lg overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <Command.Input 
                    placeholder="Type a command or search..." 
                    className="w-full px-4 py-3 text-lg border-b border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
                />
                
                <Command.List className="max-h-[300px] overflow-y-auto p-2">
                    <Command.Empty className="p-4 text-sm text-center text-gray-500">No results found.</Command.Empty>

                    <Command.Group heading="Navigation" className="text-xs font-semibold text-gray-500 dark:text-gray-400 p-2">
                        <Command.Item 
                            onSelect={() => runCommand(() => router.visit(route('dashboard')))}
                            className="px-2 py-2 mt-1 cursor-pointer rounded-md flex items-center text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 aria-selected:bg-primary-50 aria-selected:text-primary-600 dark:aria-selected:bg-primary-500/20 dark:aria-selected:text-primary-300"
                        >
                            Dashboard
                        </Command.Item>
                        <Command.Item 
                            onSelect={() => runCommand(() => router.visit(route('notes.index')))}
                            className="px-2 py-2 mt-1 cursor-pointer rounded-md flex items-center text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 aria-selected:bg-primary-50 aria-selected:text-primary-600 dark:aria-selected:bg-primary-500/20 dark:aria-selected:text-primary-300"
                        >
                            My Notes
                        </Command.Item>
                        <Command.Item 
                            onSelect={() => runCommand(() => router.visit(route('notes.trash')))}
                            className="px-2 py-2 mt-1 cursor-pointer rounded-md flex items-center text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 aria-selected:bg-primary-50 aria-selected:text-primary-600 dark:aria-selected:bg-primary-500/20 dark:aria-selected:text-primary-300"
                        >
                            Trash Can
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Settings" className="text-xs font-semibold text-gray-500 dark:text-gray-400 p-2">
                        <Command.Item 
                            onSelect={() => runCommand(() => router.visit(route('profile.edit')))}
                            className="px-2 py-2 mt-1 cursor-pointer rounded-md flex items-center text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 aria-selected:bg-primary-50 aria-selected:text-primary-600 dark:aria-selected:bg-primary-500/20 dark:aria-selected:text-primary-300"
                        >
                            Profile
                        </Command.Item>
                        <Command.Item 
                            onSelect={() => {
                                const html = document.documentElement;
                                if (html.classList.contains('dark')) {
                                    html.classList.remove('dark');
                                    localStorage.setItem('theme', 'light');
                                } else {
                                    html.classList.add('dark');
                                    localStorage.setItem('theme', 'dark');
                                }
                                setOpen(false);
                            }}
                            className="px-2 py-2 mt-1 cursor-pointer rounded-md flex items-center text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 aria-selected:bg-primary-50 aria-selected:text-primary-600 dark:aria-selected:bg-primary-500/20 dark:aria-selected:text-primary-300"
                        >
                            Toggle Dark Mode
                        </Command.Item>
                    </Command.Group>
                </Command.List>
            </div>
        </Command.Dialog>
    );
}
