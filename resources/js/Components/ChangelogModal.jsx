import { Dialog } from '@headlessui/react';
import Modal from '@/Components/Modal';
import { changelogData } from '@/data/changelog';
import PrimaryButton from '@/Components/PrimaryButton';
import { Sparkles } from 'lucide-react';

export default function ChangelogModal({ show, onClose }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6 text-gray-900 dark:text-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-lg shadow-primary-500/20 text-white">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                            What's New in NoteVibe
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {changelogData.map((release, index) => (
                        <div key={release.version} className={`relative pb-8 ${index !== changelogData.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                            <div className="flex items-baseline gap-4 mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    {release.version}
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {release.date}
                                </span>
                                {index === 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                        Latest
                                    </span>
                                )}
                            </div>

                            {release.features && release.features.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        ✨ Features & Enhancements
                                    </h4>
                                    <ul className="space-y-2">
                                        {release.features.map((feature, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-primary-500 mt-1">•</span>
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {release.fixes && release.fixes.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        🐛 Bug Fixes
                                    </h4>
                                    <ul className="space-y-2">
                                        {release.fixes.map((fix, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-red-400 mt-1">•</span>
                                                <span className="text-gray-700 dark:text-gray-300">{fix}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton onClick={onClose}>
                        Awesome, thanks!
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
