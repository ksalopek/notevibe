import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function AdvancedFilterDrawer({ isOpen, onClose, filters, onApply, folders }) {
    const [localFilters, setLocalFilters] = React.useState({
        folder_id: filters.folder_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        tags: filters.tags || '',
    });

    React.useEffect(() => {
        setLocalFilters({
            folder_id: filters.folder_id || '',
            date_from: filters.date_from || '',
            date_to: filters.date_to || '',
            tags: filters.tags || '',
        });
    }, [filters, isOpen]);

    const handleChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        const cleared = {
            folder_id: '',
            date_from: '',
            date_to: '',
            tags: '',
        };
        setLocalFilters(cleared);
        onApply(cleared);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Filters</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-6">
                            {/* Folder */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder</label>
                                <select
                                    value={localFilters.folder_id}
                                    onChange={(e) => handleChange('folder_id', e.target.value)}
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                >
                                    <option value="">All Folders</option>
                                    {folders && folders.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={localFilters.tags}
                                    onChange={(e) => handleChange('tags', e.target.value)}
                                    placeholder="e.g. work, urgent"
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.date_from}
                                        onChange={(e) => handleChange('date_from', e.target.value)}
                                        className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.date_to}
                                        onChange={(e) => handleChange('date_to', e.target.value)}
                                        className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 pb-24 sm:pb-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                            <SecondaryButton onClick={handleClear}>Clear</SecondaryButton>
                            <PrimaryButton onClick={handleApply}>Apply Filters</PrimaryButton>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
