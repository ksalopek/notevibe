import React, { useEffect, Fragment, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { Menu, Transition } from '@headlessui/react';
import Tooltip from '@/Components/Tooltip';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import axios from 'axios';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered, CheckSquare,
    Quote, Minus, CornerDownLeft, Undo, Redo, Link as LinkIcon, Unlink, ChevronDown, Heading1, Heading2, Heading3, Type, Mic, Sparkles, Loader2
} from 'lucide-react';

// Toolbar component for the editor
const MenuBar = ({ editor }) => {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const recognitionRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                if (editor) {
                    editor.chain().focus().insertContent(transcript + ' ').run();
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, [editor]);

    const toggleDictation = () => {
        if (!recognitionRef.current) {
            alert('Your browser does not support Speech Recognition.');
            return;
        }
        
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const enhanceText = async () => {
        if (!editor || isEnhancing) return;

        const { from, to, empty } = editor.state.selection;
        
        // If selection is empty, enhance everything, else enhance selection
        const textToEnhance = empty ? editor.getText() : editor.state.doc.textBetween(from, to, ' ');
        
        if (!textToEnhance.trim()) return;

        setIsEnhancing(true);

        try {
            const response = await axios.post('/ai/enhance', { text: textToEnhance });
            const enhancedText = response.data.enhanced_text;

            if (enhancedText) {
                if (empty) {
                    editor.commands.setContent(enhancedText, false);
                } else {
                    editor.commands.insertContentAt({ from, to }, enhancedText);
                }
            }
        } catch (error) {
            console.error("AI Enhancement failed", error);
            alert(error.response?.data?.error || "Failed to enhance text.");
        } finally {
            setIsEnhancing(false);
        }
    };

    if (!editor) {
        return null;
    }

    const openLinkModal = () => {
        const previousUrl = editor.getAttributes('link').href;
        setLinkUrl(previousUrl || '');
        setIsLinkModalOpen(true);
    };

    const closeLinkModal = () => {
        setIsLinkModalOpen(false);
        setLinkUrl('');
    };

    const setLink = (e) => {
        e.preventDefault();
        
        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        }

        closeLinkModal();
    };

    // Define a reusable button component to avoid repetition
    const EditorButton = ({ onClick, disabled, isActive, children, title, customClass = '' }) => (
        <Tooltip content={title} placement="top">
            <button
                type="button" // <-- CRITICAL FIX: Prevents form submission
                onClick={onClick}
                disabled={disabled}
                className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
                    isActive ? 'bg-primary-600 text-white' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${customClass}`}
            >
                {children}
            </button>
        </Tooltip>
    );

    const Divider = () => <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>;

    const activeHeading = () => {
        if (editor.isActive('heading', { level: 1 })) return { name: 'Heading 1', icon: <Heading1 size={18} /> };
        if (editor.isActive('heading', { level: 2 })) return { name: 'Heading 2', icon: <Heading2 size={18} /> };
        if (editor.isActive('heading', { level: 3 })) return { name: 'Heading 3', icon: <Heading3 size={18} /> };
        return { name: 'Paragraph', icon: <Type size={18} /> };
    };

    const currentFormat = activeHeading();

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-md">
            {/* History & Dictation */}
            <EditorButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
                <Undo size={18} />
            </EditorButton>
            <EditorButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
                <Redo size={18} />
            </EditorButton>
            <EditorButton 
                title={isListening ? "Stop Dictation" : "Start Dictation"} 
                onClick={toggleDictation}
                customClass={isListening ? 'text-red-600 dark:text-red-500 animate-pulse bg-red-100 dark:bg-red-900/30' : ''}
            >
                <Mic size={18} />
            </EditorButton>

            {/* Temporarily disabled to avoid production API costs
            <EditorButton
                title={isEnhancing ? "Enhancing..." : "AI Enhance"}
                onClick={enhanceText}
                disabled={isEnhancing}
                customClass={isEnhancing ? 'text-primary-500 animate-pulse' : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'}
            >
                {isEnhancing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            </EditorButton>
            */}

            <Divider />

            {/* Format Dropdown */}
            <Menu as="div" className="relative inline-block text-left z-10">
                <div>
                    <Menu.Button className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {currentFormat.icon}
                        <span className="hidden sm:inline-block w-20 text-left">{currentFormat.name}</span>
                        <ChevronDown size={14} className="opacity-70" />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute left-0 mt-1 w-36 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700">
                        <div className="py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().setParagraph().run()}
                                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} ${editor.isActive('paragraph') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} group flex w-full items-center gap-2 px-3 py-2 text-sm`}
                                    >
                                        <Type size={16} /> Paragraph
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} ${editor.isActive('heading', { level: 1 }) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} group flex w-full items-center gap-2 px-3 py-2 text-sm`}
                                    >
                                        <Heading1 size={16} /> Heading 1
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} ${editor.isActive('heading', { level: 2 }) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} group flex w-full items-center gap-2 px-3 py-2 text-sm`}
                                    >
                                        <Heading2 size={16} /> Heading 2
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} ${editor.isActive('heading', { level: 3 }) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} group flex w-full items-center gap-2 px-3 py-2 text-sm`}
                                    >
                                        <Heading3 size={16} /> Heading 3
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>

            <Divider />

            {/* Inline Styles */}
            <EditorButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
                <Bold size={18} />
            </EditorButton>
            <EditorButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
                <Italic size={18} />
            </EditorButton>
            <EditorButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
                <Strikethrough size={18} />
            </EditorButton>
            <EditorButton title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
                <Code size={18} />
            </EditorButton>

            <Divider />

            {/* Lists */}
            <EditorButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
                <List size={18} />
            </EditorButton>
            <EditorButton title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
                <ListOrdered size={18} />
            </EditorButton>
            <EditorButton title="Checklist" onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')}>
                <CheckSquare size={18} />
            </EditorButton>

            <Divider />

            {/* Blocks & Links */}
            <EditorButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
                <Quote size={18} />
            </EditorButton>
            <EditorButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <Minus size={18} />
            </EditorButton>
            <EditorButton title="Hard Break" onClick={() => editor.chain().focus().setHardBreak().run()}>
                <CornerDownLeft size={18} />
            </EditorButton>
            <EditorButton
                title="Link"
                onClick={openLinkModal}
                isActive={editor.isActive('link')}
            >
                <LinkIcon size={18} />
            </EditorButton>
            <EditorButton title="Unlink" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}>
                <Unlink size={18} />
            </EditorButton>

            <Modal show={isLinkModalOpen} onClose={closeLinkModal} maxWidth="md">
                <form onSubmit={setLink} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Insert Link
                    </h2>
                    <div>
                        <InputLabel htmlFor="url" value="URL" />
                        <TextInput
                            id="url"
                            type="url"
                            className="mt-1 block w-full"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            isFocused={true}
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeLinkModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" onClick={setLink}>
                            Save
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, className = '' }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[150px] text-gray-900 dark:text-gray-100',
            },
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== content) {
            editor.commands.setContent(content, false);
        }
    }, [content, editor]);

    return (
        <div className={`border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-md shadow-sm flex flex-col ${className}`}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        </div>
    );
}
