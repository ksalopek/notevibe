import React, { useState, useRef, useEffect } from 'react';

export default function SimpleNoteCard({ note, isSelected, onSelect, actions, isDeleted = false, badge }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            setIsOverflowing(contentRef.current.scrollHeight > 384); // max-h-96 is 384px
        }
    }, [note.content, note.notes]);

    return (
        <div className={`break-inside-avoid mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/50 dark:hover:shadow-primary-500/50 ${isSelected ? 'border-primary-500 ring-2 ring-primary-500 dark:ring-primary-500 dark:border-primary-500 bg-primary-50/10 dark:bg-primary-900/10 opacity-100' : 'border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100'}`}>
            <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg z-10" />
            <div className="absolute -top-3 -left-3 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={(e) => onSelect(note.id, e.target.checked)}
                    className={`w-6 h-6 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer shadow-sm ${isSelected ? 'opacity-100' : ''}`}
                    style={{ opacity: isSelected ? 1 : undefined }}
                />
            </div>
            
            <div className="flex justify-between items-start mb-4">
                <h2 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${isDeleted ? 'line-through' : ''}`}>{note.title}</h2>
                <div className="flex gap-2 relative z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    {actions}
                </div>
            </div>
            
            <div ref={contentRef} className={`relative ${!isExpanded ? 'max-h-96 overflow-hidden' : ''}`}>
                <div className="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: note.content }} />
                {note.notes && (
                    <div className="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: note.notes }} />
                )}
                
                {!isExpanded && isOverflowing && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
                )}
            </div>

            {isOverflowing && (
                <div className="mt-2 flex justify-center z-10 relative">
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
            )}

            {badge && (
                <p className={`mt-4 text-xs font-semibold ${isDeleted ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {badge}
                </p>
            )}
        </div>
    );
}
