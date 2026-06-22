import React, { useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import Tooltip from '@/Components/Tooltip';
import { Pencil, Trash2, Folder, MoreHorizontal, Archive } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

export default function NoteCard({ note, startEditing, deleteNote, togglePin, toggleArchive, handleTagClick, updateNoteContent, moveNote, isSelected = false, onSelect = null }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Keep local state for HTML content to prevent React re-renders from wiping out optimistic checklist changes
    const [localContent, setLocalContent] = React.useState('');

    React.useEffect(() => {
        // Tiptap saves checkboxes as disabled="disabled". We must remove this so they can be clicked.
        setLocalContent(note.content ? note.content.replace(/<input type="checkbox" disabled="disabled"/g, '<input type="checkbox"').replace(/<input type="checkbox" disabled/g, '<input type="checkbox"') : '');
    }, [note.content]);

    const lastEdited = new Date(note.updated_at).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    const createdDate = new Date(note.created_at).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const handleContentClick = (e, field) => {
        // Only proceed if they clicked a checkbox input
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            e.stopPropagation();
            const checkbox = e.target;
            const li = checkbox.closest('li[data-type="taskItem"]');
            if (li) {
                const isChecked = checkbox.checked;
                const currentHtml = localContent;
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(currentHtml, 'text/html');
                
                const inputs = doc.querySelectorAll('input[type="checkbox"]');
                const listItems = doc.querySelectorAll('li[data-type="taskItem"]');
                
                const allRenderedInputs = e.currentTarget.querySelectorAll('input[type="checkbox"]');
                const clickedIndex = Array.from(allRenderedInputs).indexOf(checkbox);
                
                if (clickedIndex !== -1 && inputs[clickedIndex]) {
                    inputs[clickedIndex].checked = isChecked;
                    if (isChecked) {
                        inputs[clickedIndex].setAttribute('checked', 'checked');
                        if (listItems[clickedIndex]) listItems[clickedIndex].setAttribute('data-checked', 'true');
                    } else {
                        inputs[clickedIndex].removeAttribute('checked');
                        if (listItems[clickedIndex]) listItems[clickedIndex].setAttribute('data-checked', 'false');
                    }
                    const newHtml = doc.body.innerHTML;
                    
                    // Update local state so it immediately visually reflects the change and survives re-renders
                    setLocalContent(newHtml);

                    // Call the debounce handler from props to save to backend
                    if (updateNoteContent) {
                        updateNoteContent(note.id, field, newHtml);
                    }
                }
            }
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className={`break-inside-avoid mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 ${isSelected ? 'border-primary-500 ring-2 ring-primary-500 dark:ring-primary-500 dark:border-primary-500 bg-primary-50/10 dark:bg-primary-900/10' : (note.is_pinned ? 'border-primary-400 dark:border-primary-600' : 'border-gray-200 dark:border-gray-700')}`}
        >
            {onSelect && (
                <div className="absolute -top-3 -left-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => onSelect(note.id, e.target.checked)}
                        className={`w-6 h-6 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer shadow-sm ${isSelected ? 'opacity-100' : ''}`}
                        style={{ opacity: isSelected ? 1 : undefined }}
                    />
                </div>
            )}
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 pr-8">{note.title}</h2>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Tooltip content={note.is_pinned ? "Unpin" : "Pin"}>
                        <button 
                            onClick={() => togglePin(note)}
                            className={`p-1.5 rounded-full transition-all duration-200 border shadow-sm hover:shadow ${note.is_pinned ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 border-primary-200 dark:border-primary-800/50' : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 border-gray-200 dark:border-gray-600'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill={note.is_pinned ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                        </button>
                    </Tooltip>
                    <Tooltip content="Edit">
                        <button 
                            onClick={() => startEditing(note)} 
                            className="p-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full transition-all duration-200 border border-primary-200 dark:border-primary-800/50 shadow-sm hover:shadow"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </Tooltip>
                    <Menu as="div" className="relative inline-block text-left">
                        <Tooltip content="More Options">
                            <Menu.Button className="p-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 border border-gray-200 dark:border-gray-600 rounded-full transition-all duration-200 shadow-sm hover:shadow">
                                <MoreHorizontal className="w-4 h-4" />
                            </Menu.Button>
                        </Tooltip>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div className="px-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => moveNote(note.id)}
                                                className={`${
                                                    active ? 'bg-primary-500 text-white dark:bg-primary-600' : 'text-gray-900 dark:text-gray-100'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                            >
                                                <Folder className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Move to Folder
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => toggleArchive(note)}
                                                className={`${
                                                    active ? 'bg-amber-500 text-white dark:bg-amber-600' : 'text-gray-900 dark:text-gray-100'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                            >
                                                <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
                                                {note.is_archived ? "Unarchive Note" : "Archive Note"}
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                                <div className="px-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => deleteNote(note.id)}
                                                className={`${
                                                    active ? 'bg-red-500 text-white dark:bg-red-600' : 'text-red-600 dark:text-red-400'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Delete Note
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
                {/* Always visible pin icon if pinned, unless hovering (hovering shows the toggle buttons) */}
                {note.is_pinned && (
                    <div className="absolute top-4 right-4 group-hover:hidden text-primary-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
            
            <div className={`relative ${!isExpanded ? 'max-h-96 overflow-hidden' : ''}`}>
                {/* Link Preview (Top of Card) */}
                {note.link_previews && note.link_previews.length > 0 && (
                    <a href={note.link_previews[0].url} target="_blank" rel="noopener noreferrer" className="block mb-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors bg-gray-50 dark:bg-gray-800/50 group/preview">
                        {note.link_previews[0].image && (
                            <div className="w-full h-32 overflow-hidden bg-gray-100 dark:bg-gray-900">
                                <img src={note.link_previews[0].image} alt={note.link_previews[0].title} className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-300" />
                            </div>
                        )}
                        <div className="p-3">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{note.link_previews[0].title}</h3>
                            {note.link_previews[0].description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{note.link_previews[0].description}</p>
                            )}
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-wide truncate">{new URL(note.link_previews[0].url).hostname}</div>
                        </div>
                    </a>
                )}

                {localContent && localContent !== '<p></p>' && (
                    <div 
                        onClick={(e) => handleContentClick(e, 'content')} 
                        className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none leading-relaxed mt-4 text-slate-700 dark:text-slate-300 [&_input[type='checkbox']]:rounded [&_input[type='checkbox']]:text-primary-600 [&_input[type='checkbox']]:border-slate-300 dark:[&_input[type='checkbox']]:border-slate-600 dark:[&_input[type='checkbox']]:bg-slate-800 [&_input[type='checkbox']]:focus:ring-primary-500 [&_input[type='checkbox']]:w-4 [&_input[type='checkbox']]:h-4 [&_input[type='checkbox']]:cursor-pointer [&_input[type='checkbox']]:transition-colors [&_li[data-checked='true']]:text-slate-400 dark:[&_li[data-checked='true']]:text-slate-500 [&_li[data-checked='true']]:line-through" 
                        dangerouslySetInnerHTML={{ __html: localContent }} 
                    />
                )}

                
                {!isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
                )}
            </div>

            <div className="mt-2 flex justify-center">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-semibold flex items-center gap-1"
                >
                    {isExpanded ? (
                        <>Show Less <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg></>
                    ) : (
                        <>Read More <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg></>
                    )}
                </button>
            </div>

            {/* Display Tags */}
            {note.tags && note.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {note.tags.map(tag => {
                        const parts = tag.name.split('/');
                        const hasHierarchy = parts.length > 1;
                        const defaultStyle = { backgroundColor: '#F3F4F6', color: '#374151', borderColor: 'transparent' };
                        const colorStyle = tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` } : defaultStyle;
                        
                        return (
                            <button 
                                key={tag.id} 
                                onClick={() => handleTagClick(tag.name)}
                                className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full transition-colors cursor-pointer border hover:opacity-80"
                                style={colorStyle}
                            >
                                {hasHierarchy ? (
                                    <>
                                        <span className="opacity-60 font-medium mr-0.5">{parts[0]}/</span>
                                        <span>{parts.slice(1).join('/')}</span>
                                    </>
                                ) : (
                                    tag.name
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 font-medium flex justify-between">
                <span>Created {createdDate}</span>
                <span>Last edited {lastEdited}</span>
            </div>
        </motion.div>
    );
}
