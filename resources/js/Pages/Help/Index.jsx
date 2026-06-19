import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { BookOpen, LayoutDashboard, Notebook, TrendingUp, ShieldAlert, ChevronRight } from 'lucide-react';

const documentation = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <BookOpen className="w-5 h-5" />,
        content: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>Welcome to <strong>NoteVibe</strong>! This platform is designed to help you capture your thoughts, organize your notes, and track your writing productivity over time.</p>
                <p>Use the navigation bar at the top to access the different sections of the application. Your content is automatically synced and securely stored.</p>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Pro Tip</h4>
                    <p className="text-sm">Press <kbd className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700 font-mono text-xs text-indigo-600 dark:text-indigo-400">Ctrl/Cmd + K</kbd> anywhere in the app to open the Command Palette and jump between pages quickly!</p>
                </div>
            </div>
        )
    },
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        content: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>Your Dashboard is your personal command center. It gives you a bird's-eye view of your recent activity and key metrics.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Customization:</strong> Click the "Customize" button in the top right to toggle widgets on or off. You can drag and drop widgets to arrange them however you like!</li>
                    <li><strong>Quick Draft:</strong> Use the Quick Draft widget to rapidly jot down ideas without leaving the dashboard.</li>
                    <li><strong>Recent Notes:</strong> Quickly access your most recently edited notes straight from the dashboard.</li>
                    <li><strong>Activity Chart:</strong> Visualizes your note-taking frequency over the past 7 to 30 days.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'my-journal',
        title: 'My Notes',
        icon: <Notebook className="w-5 h-5" />,
        content: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>The "My Notes" section is where you spend most of your time writing and organizing your thoughts.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Rich Text Editor:</strong> Format your notes with bold, italics, lists, code blocks, and clickable URLs using the toolbar or standard Markdown shortcuts.</li>
                    <li><strong>Search & Sort:</strong> Use the search bar to instantly find notes by keyword. You can sort your results by <em>Relevance</em> (best keyword match), <em>Newest</em> (most recently created), or <em>Oldest</em> (first created).</li>
                    <li><strong>Tagging:</strong> Categorize your notes by typing tags separated by commas. Use tags to filter your notes later.</li>
                    <li><strong>Trash & Archive:</strong> Deleted notes are sent to the Trash where they can be restored. You can also Archive notes to hide them from your main view without deleting them.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'my-analytics',
        title: 'My Analytics',
        icon: <TrendingUp className="w-5 h-5" />,
        content: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>The Analytics page tracks your writing habits and helps you stay motivated.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Current Streak:</strong> Tracks how many consecutive days you've created or edited a note. Don't break the chain!</li>
                    <li><strong>Writing Persona:</strong> Our system analyzes your note patterns and assigns you a fun persona (like "Night Owl" or "Weekend Warrior").</li>
                    <li><strong>Productivity by Hour:</strong> A heatmap showing what time of day you are most active.</li>
                    <li><strong>Note Velocity:</strong> Compares your output this week versus last week to help you measure your momentum.</li>
                </ul>
            </div>
        )
    }
];

const adminDocumentation = {
    id: 'admin-guide',
    title: 'Admin Guide',
    icon: <ShieldAlert className="w-5 h-5" />,
    content: (
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="font-medium text-amber-600 dark:text-amber-400 border-b border-amber-200 dark:border-amber-900/50 pb-2 mb-4">
                This section is only visible to Administrators.
            </p>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-6">Manage Users</h4>
            <p>View all registered users, reset passwords, change roles, or suspend accounts. You can also export user lists to CSV or impersonate a user to troubleshoot their specific issues.</p>
            
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-6">Reporting & Analytics</h4>
            <p>Access platform-wide metrics:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Activity Heatmap:</strong> See global login and engagement trends.</li>
                <li><strong>Demographics:</strong> View the geographical distribution of your user base and their role breakdown.</li>
                <li><strong>System Health:</strong> Monitor Daily Active Users (DAU) versus Monthly Active Users (MAU).</li>
                <li><strong>Power Users:</strong> Identify your most active members.</li>
            </ul>

            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-6">Global Settings</h4>
            <p>Configure platform features, toggle AI integrations, and set a Global Announcement banner that displays at the top of every user's screen.</p>
        </div>
    )
};

export default function HelpIndex() {
    const { user } = usePage().props.auth;
    const isAdmin = user && user.role === 'admin';
    
    // Combine user docs with admin docs if applicable
    const allDocs = isAdmin ? [...documentation, adminDocumentation] : documentation;
    
    const [activeSection, setActiveSection] = useState(allDocs[0].id);

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl leading-tight">Knowledge Base</h2>}
        >
            <Head title="Help Center" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-3xl flex flex-col md:flex-row min-h-[600px] border border-gray-100 dark:border-gray-700">
                        
                        {/* Sidebar Navigation */}
                        <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-700 p-6 flex-shrink-0">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Topics</h3>
                            <nav className="space-y-1">
                                {allDocs.map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => setActiveSection(doc.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            activeSection === doc.id
                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`${activeSection === doc.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {doc.icon}
                                            </span>
                                            {doc.title}
                                        </div>
                                        {activeSection === doc.id && (
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                            {allDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className={`transition-opacity duration-300 ${activeSection === doc.id ? 'block animate-fade-in-up' : 'hidden'}`}
                                >
                                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                            {doc.icon}
                                        </div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                            {doc.title}
                                        </h1>
                                    </div>
                                    <div className="prose prose-indigo dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500">
                                        {doc.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
