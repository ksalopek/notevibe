import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, MoreVertical, Settings, Filter, X, Tag, Calendar, Pin, Link, CheckSquare, SlidersHorizontal } from 'lucide-react';
import Modal from './Modal';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import DangerButton from './DangerButton';
import Dropdown from './Dropdown';
import { useForm } from '@inertiajs/react';

export default function LibraryFilterDrawer({ isOpen, onClose, filters = {}, onApply, folders, tags = [], openTagManager, hideManagement = false, dateLabelPrefix = "Created" }) {
    // Local Filter State
    const [localFilters, setLocalFilters] = useState({
        folder_id: filters.folder_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        updated_from: filters.updated_from || '',
        updated_to: filters.updated_to || '',
        tags: filters.tags || '',
        is_pinned: filters.is_pinned === 'true' || filters.is_pinned === true,
        has_links: filters.has_links === 'true' || filters.has_links === true,
        has_tasks: filters.has_tasks === 'true' || filters.has_tasks === true,
    });

    useEffect(() => {
        setLocalFilters({
            folder_id: filters.folder_id || '',
            date_from: filters.date_from || '',
            date_to: filters.date_to || '',
            updated_from: filters.updated_from || '',
            updated_to: filters.updated_to || '',
            tags: filters.tags || '',
            is_pinned: filters.is_pinned === 'true' || filters.is_pinned === true,
            has_links: filters.has_links === 'true' || filters.has_links === true,
            has_tasks: filters.has_tasks === 'true' || filters.has_tasks === true,
        });
    }, [filters, isOpen]);

    const activeTagsArray = localFilters.tags ? localFilters.tags.split(',') : [];

    const handleChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleTagToggle = (tagName) => {
        let newTags = [...activeTagsArray];
        if (newTags.includes(tagName)) {
            newTags = newTags.filter(t => t !== tagName);
        } else {
            newTags.push(tagName);
        }
        handleChange('tags', newTags.join(','));
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
            updated_from: '',
            updated_to: '',
            tags: '',
            is_pinned: false,
            has_links: false,
            has_tasks: false,
        };
        setLocalFilters(cleared);
        onApply(cleared);
        onClose();
    };



    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[105]"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl z-[110] flex flex-col border-l border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Filter className="w-5 h-5 mr-2 text-primary-500" />
                                    Filters
                                </h2>
                                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto space-y-8">
                                
                                {/* Folders Section */}
                                <div>
                                    <div className="flex items-center justify-between px-1 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="flex items-center gap-2"><Folder className="w-4 h-4 text-primary-500" /> Folders</span>

                                    </div>
                                    <ul className="space-y-1">
                                        <li>
                                            <button
                                                onClick={() => handleChange('folder_id', '')}
                                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                                    !localFilters.folder_id 
                                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-medium' 
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <Folder className="w-4 h-4 mr-3 opacity-70" />
                                                All Notes
                                            </button>
                                        </li>
                                        {folders && folders.map(folder => (
                                            <li key={folder.id} className="flex items-center group">
                                                <button
                                                    onClick={() => handleChange('folder_id', folder.id.toString())}
                                                    className={`flex-1 flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                                        localFilters.folder_id === folder.id.toString()
                                                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-medium' 
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                    }`}
                                                >
                                                    <Folder className="w-4 h-4 mr-3 opacity-70" style={{ color: folder.color || 'inherit' }} />
                                                    <span className="truncate">{folder.name}</span>
                                                </button>
                                                

                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tags Section */}
                                {tags.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between px-1 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                                            <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary-500" /> Tags</span>

                                        </div>
                                        <div className="flex flex-wrap gap-2 px-1">
                                            {tags.map(tag => {
                                                const isActive = activeTagsArray.includes(tag.name);
                                                return (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => handleTagToggle(tag.name)}
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors shadow-sm ${
                                                            isActive 
                                                                ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-900 shadow-md' 
                                                                : 'hover:opacity-80'
                                                        }`}
                                                        style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` } : { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}
                                                    >
                                                        {tag.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Attributes Section */}
                                <div>
                                    <div className="flex items-center px-1 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 gap-2">
                                        <SlidersHorizontal className="w-4 h-4 text-primary-500" /> Attributes
                                    </div>
                                    <div className="space-y-3 px-1">
                                        <label className="flex items-center cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={localFilters.is_pinned} onChange={(e) => handleChange('is_pinned', e.target.checked)} className="sr-only peer" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                                            </div>
                                            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Pin className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" /> Pinned Notes Only</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={localFilters.has_links} onChange={(e) => handleChange('has_links', e.target.checked)} className="sr-only peer" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                                            </div>
                                            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Link className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" /> Contains Saved Links</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={localFilters.has_tasks} onChange={(e) => handleChange('has_tasks', e.target.checked)} className="sr-only peer" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                                            </div>
                                            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" /> Contains Checklists</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Date Range Section */}
                                <div>
                                    <div className="flex items-center px-1 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 gap-2">
                                        <Calendar className="w-4 h-4 text-primary-500" /> Date Ranges
                                    </div>
                                    <div className="space-y-4 px-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{dateLabelPrefix} From</label>
                                                <input
                                                    type="date"
                                                    value={localFilters.date_from}
                                                    onChange={(e) => handleChange('date_from', e.target.value)}
                                                    className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{dateLabelPrefix} To</label>
                                                <input
                                                    type="date"
                                                    value={localFilters.date_to}
                                                    onChange={(e) => handleChange('date_to', e.target.value)}
                                                    className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Updated From</label>
                                                <input
                                                    type="date"
                                                    value={localFilters.updated_from}
                                                    onChange={(e) => handleChange('updated_from', e.target.value)}
                                                    className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Updated To</label>
                                                <input
                                                    type="date"
                                                    value={localFilters.updated_to}
                                                    onChange={(e) => handleChange('updated_to', e.target.value)}
                                                    className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                                <SecondaryButton onClick={handleClear}>Clear Filters</SecondaryButton>
                                <PrimaryButton onClick={handleApply}>Apply Filters</PrimaryButton>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


        </>
    );
}
