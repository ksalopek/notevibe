import React, { useState } from 'react';
import { Combobox } from '@headlessui/react';

export default function TagAutocompleteInput({ value = '', onChange, tags = [], className = '', placeholder = 'Tags...' }) {
    const [query, setQuery] = useState('');
    
    // Split the comma separated string to get current tags array
    const currentTags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Filter available tags that are NOT already selected
    const availableTags = tags.filter(t => !currentTags.includes(t.name));

    const filteredTags =
        query === ''
            ? availableTags
            : availableTags.filter((tag) =>
                tag.name.toLowerCase().includes(query.toLowerCase())
            );

    const handleSelect = (selectedTag) => {
        if (!selectedTag) return;
        
        // Prevent duplicates
        if (currentTags.includes(selectedTag.name)) {
            setQuery('');
            return;
        }

        const newTags = [...currentTags, selectedTag.name];
        onChange(newTags.join(', '));
        setQuery('');
    };

    const removeTag = (tagToRemove) => {
        const newTags = currentTags.filter(t => t !== tagToRemove);
        onChange(newTags.join(', '));
    };

    return (
        <div className={`relative ${className}`}>
            <Combobox value={null} onChange={handleSelect}>
                <div className="flex flex-wrap gap-2 p-2 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md shadow-sm border focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-colors">
                    {currentTags.map(tag => {
                        const tagObj = tags.find(t => t.name === tag);
                        const color = tagObj?.color;
                        return (
                            <span 
                                key={tag} 
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium"
                                style={color ? { backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` } : { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); removeTag(tag); }}
                                    className="hover:text-red-500 ml-1 font-bold focus:outline-none"
                                >
                                    &times;
                                </button>
                            </span>
                        );
                    })}
                    <Combobox.Input
                        className="flex-1 min-w-[120px] border-none p-0 focus:ring-0 bg-transparent text-sm dark:text-gray-300"
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={() => query}
                        placeholder={currentTags.length === 0 ? placeholder : ''}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && query) {
                                e.preventDefault();
                                // Select top suggestion or create new
                                if (filteredTags.length > 0) {
                                    handleSelect(filteredTags[0]);
                                } else {
                                    // Create new tag from query
                                    handleSelect({ name: query.trim() });
                                }
                            } else if (e.key === ',' && query) {
                                e.preventDefault();
                                handleSelect({ name: query.trim() });
                            } else if (e.key === 'Backspace' && query === '' && currentTags.length > 0) {
                                removeTag(currentTags[currentTags.length - 1]);
                            }
                        }}
                    />
                </div>
                <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredTags.length === 0 && query !== '' ? (
                        <div 
                            className="relative cursor-pointer select-none py-2 px-4 text-primary-600 dark:text-primary-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSelect({ name: query.trim() })}
                        >
                            Create "{query}"
                        </div>
                    ) : (
                        filteredTags.map((tag) => (
                            <Combobox.Option
                                key={tag.id}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                                        active ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                    }`
                                }
                                value={tag}
                            >
                                {({ selected }) => (
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: tag.color || '#9CA3AF' }}
                                        />
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {tag.name}
                                        </span>
                                    </div>
                                )}
                            </Combobox.Option>
                        ))
                    )}
                </Combobox.Options>
            </Combobox>
        </div>
    );
}
