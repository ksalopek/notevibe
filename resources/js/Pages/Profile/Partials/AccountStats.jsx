import { Calendar, FileText, PenTool } from 'lucide-react';

export default function AccountStats({ stats, className = '' }) {
    if (!stats) return null;

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Account Statistics
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    A quick summary of your NoteVibe usage.
                </p>
            </header>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_notes}</div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Notes</div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                        <PenTool className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_words}</div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Words Written</div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white capitalize">{stats.account_age}</div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Age</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
