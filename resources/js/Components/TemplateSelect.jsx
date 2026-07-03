import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check, FileText } from 'lucide-react';

export default function TemplateSelect({ value, onChange, templates }) {
    const selectedTemplate = templates.find(t => t.id == value) || null;

    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative z-10 w-48 shrink-0">
                <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white dark:bg-gray-900 py-1.5 pl-3 pr-10 text-left shadow-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-150 ease-in-out">
                    <span className="flex items-center gap-2 truncate text-gray-700 dark:text-gray-300">
                        <FileText className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                        <span className="truncate">
                            {selectedTemplate ? selectedTemplate.name : 'Use Template...'}
                        </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                    </span>
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none sm:text-sm">
                        <Listbox.Option
                            className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${
                                    active ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                }`
                            }
                            value=""
                        >
                            {({ selected }) => (
                                <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        None (Clear)
                                    </span>
                                    {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                            <Check className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                    ) : null}
                                </>
                            )}
                        </Listbox.Option>

                        {templates.map((template) => (
                            <Listbox.Option
                                key={template.id}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${
                                        active ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                    }`
                                }
                                value={template.id}
                            >
                                {({ selected }) => (
                                    <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {template.name}
                                        </span>
                                        {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                                <Check className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
}
