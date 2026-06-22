import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';
import { Tags, Pencil, Trash2, Check, X } from 'lucide-react';

const TAG_COLORS = [
    { value: '#EF4444', label: 'Red' },
    { value: '#F97316', label: 'Orange' },
    { value: '#F59E0B', label: 'Yellow' },
    { value: '#10B981', label: 'Green' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#6B7280', label: 'Gray' }
];

export default function TagManagerModal({ isOpen, onClose, tags = [] }) {
    const [editingTag, setEditingTag] = useState(null);
    const [deletingTag, setDeletingTag] = useState(null);

    const { data, setData, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        name: '',
        color: ''
    });

    const startEditing = (tag) => {
        clearErrors();
        setEditingTag(tag.id);
        setData({
            name: tag.name,
            color: tag.color || ''
        });
    };

    const cancelEditing = () => {
        setEditingTag(null);
        reset();
        clearErrors();
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        put(route('tags.update', id), {
            preserveScroll: true,
            onSuccess: () => cancelEditing(),
        });
    };

    const handleDelete = (id) => {
        destroy(route('tags.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeletingTag(null),
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl" mobileFullWidth={true}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full">
                            <Tags className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tag Manager</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 space-y-3 max-h-[75dvh] sm:max-h-[60vh]">
                    {tags.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No tags found. Tags are created automatically when you add them to notes.</p>
                    ) : (
                        tags.map(tag => (
                            <div key={tag.id} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                                {editingTag === tag.id ? (
                                    <form onSubmit={(e) => handleUpdate(e, tag.id)} className="space-y-3">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="Tag name"
                                                    required
                                                />
                                                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {TAG_COLORS.map(c => (
                                                    <button
                                                        key={c.value}
                                                        type="button"
                                                        onClick={() => setData('color', c.value)}
                                                        className={`w-6 h-6 rounded-full border-2 ${data.color === c.value ? 'border-primary-500 scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: c.value }}
                                                        title={c.label}
                                                    />
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setData('color', '')}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${data.color === '' ? 'border-primary-500 scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                                                    title="Default / None"
                                                >
                                                    <X className="w-3 h-3 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <SecondaryButton type="button" onClick={cancelEditing} className="!py-1.5 !text-xs">Cancel</SecondaryButton>
                                            <PrimaryButton type="submit" disabled={processing} className="!py-1.5 !text-xs gap-1">
                                                <Check className="w-3 h-3" /> Save
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span 
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium"
                                                style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` } : { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}
                                            >
                                                #{tag.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {deletingTag === tag.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-red-500 font-medium">Are you sure?</span>
                                                    <button onClick={() => handleDelete(tag.id)} disabled={processing} className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded">Yes</button>
                                                    <button onClick={() => setDeletingTag(null)} className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded">No</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEditing(tag)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeletingTag(tag.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
}
