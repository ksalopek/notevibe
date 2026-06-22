import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { router } from '@inertiajs/react';
import { Tags } from 'lucide-react';
import TagAutocompleteInput from './TagAutocompleteInput';

export default function BulkTagModal({ isOpen, onClose, selectedIds, tags = [] }) {
    const [tagNames, setTagNames] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTagNames('');
        }
    }, [isOpen]);

    const handleAction = (actionType) => {
        if (!selectedIds || selectedIds.length === 0 || !tagNames) return;
        
        const tagsArray = tagNames.split(',').map(t => t.trim()).filter(Boolean);
        if (tagsArray.length === 0) return;

        if (actionType === 'add_tags') setIsAdding(true);
        if (actionType === 'remove_tags') setIsRemoving(true);

        router.post(route('notes.bulk'), { 
            action: actionType, 
            note_ids: selectedIds, 
            tag_names: tagsArray
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdding(false);
                setIsRemoving(false);
                setTagNames('');
                onClose(true);
            },
            onError: () => {
                setIsAdding(false);
                setIsRemoving(false);
            }
        });
    };

    return (
        <Modal show={isOpen} onClose={() => onClose(false)} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full">
                        <Tags className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Bulk Tag {selectedIds?.length || 0} {selectedIds?.length === 1 ? 'Note' : 'Notes'}
                    </h2>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Select tags to add or remove from the selected {selectedIds?.length === 1 ? 'note' : 'notes'}.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                    <TagAutocompleteInput 
                        value={tagNames} 
                        onChange={setTagNames} 
                        tags={tags} 
                        placeholder="Select or type tags..." 
                    />
                </div>

                <div className="flex justify-between gap-3 mt-6">
                    <SecondaryButton onClick={() => onClose(false)}>Cancel</SecondaryButton>
                    <div className="flex gap-2">
                        <SecondaryButton 
                            onClick={() => handleAction('remove_tags')} 
                            disabled={isAdding || isRemoving || !tagNames}
                            className="!text-red-600 dark:!text-red-400"
                        >
                            Remove
                        </SecondaryButton>
                        <PrimaryButton 
                            onClick={() => handleAction('add_tags')} 
                            disabled={isAdding || isRemoving || !tagNames}
                        >
                            Add Tags
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
