import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { router } from '@inertiajs/react';
import { Folder } from 'lucide-react';

export default function MoveNotesModal({ isOpen, onClose, selectedIds, folders }) {
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedFolderId('');
        }
    }, [isOpen]);

    const handleMove = () => {
        if (!selectedIds || selectedIds.length === 0) return;
        
        setIsMoving(true);
        router.post(route('notes.bulk'), { 
            action: 'move', 
            note_ids: selectedIds, 
            folder_id: selectedFolderId === 'none' ? null : selectedFolderId 
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsMoving(false);
                setSelectedFolderId('');
                onClose(true);
            },
            onError: () => {
                setIsMoving(false);
            }
        });
    };

    return (
        <Modal show={isOpen} onClose={() => onClose(false)} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full">
                        <Folder className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Move {selectedIds?.length || 0} {selectedIds?.length === 1 ? 'Note' : 'Notes'}
                    </h2>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Select a destination folder for the selected {selectedIds?.length === 1 ? 'note' : 'notes'}.
                </p>

                <div className="mb-6">
                    <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                    >
                        <option value="" disabled>Select a folder...</option>
                        <option value="none">-- Remove from Folder --</option>
                        {folders && folders.map(folder => (
                            <option key={folder.id} value={folder.id}>
                                {folder.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={() => onClose(false)}>Cancel</SecondaryButton>
                    <PrimaryButton 
                        onClick={handleMove} 
                        disabled={isMoving || selectedFolderId === ''}
                    >
                        Move
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
