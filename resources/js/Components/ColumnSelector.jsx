import React from 'react';
import Dropdown from '@/Components/Dropdown';
import Tooltip from '@/Components/Tooltip';

export default function ColumnSelector({ columns, visibleColumns, toggleColumn }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <div>
                    <Tooltip content="Toggle Columns">
                        <button 
                            type="button" 
                            className="flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 transition-colors shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                        </button>
                    </Tooltip>
                </div>
            </Dropdown.Trigger>
            <Dropdown.Content align="right" width="48" autoClose={false}>
                <div className="p-2 space-y-1">
                    {columns.map(col => (
                        <label key={col.id} className="flex items-center px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors">
                            <input 
                                type="checkbox" 
                                checked={visibleColumns.includes(col.id)} 
                                onChange={() => toggleColumn(col.id)}
                                className="mr-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                            />
                            {col.label}
                        </label>
                    ))}
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}
