import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function NoteCard({ note, startEditing, deleteNote, togglePin, handleTagClick }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Estimate if content is too long. 
    // We can use a ref in a real scenario, but for now we'll just check string length 
    // or rely on CSS line-clamp / max-height with a fade out.
    // We'll use CSS max-h-96 and a fade mask if it's not expanded.

    const lastEdited = new Date(note.updated_at).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className={`break-inside-avoid mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border ${note.is_pinned ? 'border-primary-400 dark:border-primary-600' : 'border-gray-200 dark:border-gray-700'} relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50`}
        >
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 pr-8">{note.title}</h2>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                        onClick={() => togglePin(note)}
                        className={`p-1.5 rounded-full transition-all duration-200 border shadow-sm hover:shadow ${note.is_pinned ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 border-primary-200 dark:border-primary-800/50' : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 border-gray-200 dark:border-gray-600'}`}
                        title={note.is_pinned ? "Unpin" : "Pin"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={note.is_pinned ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => startEditing(note)} 
                        className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full transition-all duration-200 border border-primary-200 dark:border-primary-800/50 shadow-sm hover:shadow"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => deleteNote(note.id)} 
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-full transition-all duration-200 border border-red-200 dark:border-red-800/50 shadow-sm hover:shadow"
                    >
                        Delete
                    </button>
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
                <div className="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: note.content }} />
                <div className="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: note.notes }} />
                
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
                    {note.tags.map(tag => (
                        <button 
                            key={tag.id} 
                            onClick={() => handleTagClick(tag.name)}
                            className="px-2 py-1 bg-gray-100 hover:bg-primary-100 dark:bg-gray-700 dark:hover:bg-primary-900/50 text-gray-700 hover:text-primary-700 dark:text-gray-300 dark:hover:text-primary-300 text-xs font-semibold rounded-full transition-colors cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-800/50"
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 font-medium">
                Last edited {lastEdited}
            </div>
        </motion.div>
    );
}
