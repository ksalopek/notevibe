import React, { useEffect, Fragment, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Youtube } from '@tiptap/extension-youtube';
import { common, createLowlight } from 'lowlight';
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
    Quote, Minus, CornerDownLeft, Undo, Redo, Link as LinkIcon, Unlink, ChevronDown, Heading1, Heading2, Heading3, Type, Mic, Sparkles, Loader2,
    Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Highlighter, Superscript as SuperscriptIcon, Subscript as SubscriptIcon, Image as ImageIcon, Table as TableIcon, Code2, Video as YoutubeIcon, Trash2
} from 'lucide-react';

const lowlight = createLowlight(common);

// Toolbar component for the editor
const MenuBar = ({ editor }) => {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
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

    const openImageModal = () => {
        setImageUrl('');
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setImageUrl('');
    };

    const setImage = (e) => {
        e.preventDefault();
        if (imageUrl !== '') {
            editor.chain().focus().setImage({ src: imageUrl }).run();
        }
        closeImageModal();
    };

    const openYoutubeModal = () => {
        setYoutubeUrl('');
        setIsYoutubeModalOpen(true);
    };

    const closeYoutubeModal = () => {
        setIsYoutubeModalOpen(false);
        setYoutubeUrl('');
    };

    const setYoutube = (e) => {
        e.preventDefault();
        if (youtubeUrl !== '') {
            editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
        }
        closeYoutubeModal();
    };

    // Define a reusable button component to avoid repetition
    const EditorButton = ({ onClick, disabled, isActive, children, title, customClass = '' }) => (
        <Tooltip content={title} placement="top">
            <button
                type="button" // <-- CRITICAL FIX: Prevents form submission
                onClick={onClick}
                disabled={disabled}
                className={`p-1 rounded-md transition-colors flex items-center justify-center ${
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
        <div className="flex flex-col border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-md">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
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

                <Divider />

                {/* Format Dropdown */}
                <Menu as="div" className="relative inline-block text-left z-10">
                    <div>
                        <Menu.Button className="flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
                <EditorButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>
                    <UnderlineIcon size={18} />
                </EditorButton>
                <EditorButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
                    <Strikethrough size={18} />
                </EditorButton>
                <EditorButton title="Superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()} disabled={!editor.can().chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')}>
                    <SuperscriptIcon size={18} />
                </EditorButton>
                <EditorButton title="Subscript" onClick={() => editor.chain().focus().toggleSubscript().run()} disabled={!editor.can().chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')}>
                    <SubscriptIcon size={18} />
                </EditorButton>
                
                <Divider />
                
                <Tooltip content="Text Color" placement="top">
                    <input type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} data-testid="setColor" className="w-6 h-6 p-0 border-0 cursor-pointer rounded overflow-hidden" title="Text Color" />
                </Tooltip>
                
                <Menu as="div" className="relative inline-block text-left z-10">
                    <div>
                        <Tooltip content="Highlight Color" placement="top">
                            <Menu.Button className="p-1 rounded-md transition-colors flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                <Highlighter size={18} />
                            </Menu.Button>
                        </Tooltip>
                    </div>
                    <Transition as={Fragment}>
                        <Menu.Items className="absolute left-0 mt-1 p-2 w-[140px] origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700 flex flex-wrap gap-1 z-20">
                            {['#ffeb3b', '#f44336', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#ffffff', '#000000', 'transparent'].map(color => (
                                <button key={color} type="button" onClick={() => color === 'transparent' ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().toggleHighlight({ color }).run()} className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs" style={{ backgroundColor: color === 'transparent' ? '' : color }}>
                                    {color === 'transparent' && '❌'}
                                </button>
                            ))}
                        </Menu.Items>
                    </Transition>
                </Menu>

            </div>
            
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
                {/* Alignment */}
                <EditorButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}>
                    <AlignLeft size={18} />
                </EditorButton>
                <EditorButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}>
                    <AlignCenter size={18} />
                </EditorButton>
                <EditorButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}>
                    <AlignRight size={18} />
                </EditorButton>
                <EditorButton title="Align Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}>
                    <AlignJustify size={18} />
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
                <EditorButton title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
                    <Code size={18} />
                </EditorButton>
                <EditorButton title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')}>
                    <Code2 size={18} />
                </EditorButton>
                <EditorButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus size={18} />
                </EditorButton>
                
                <Divider />

                <EditorButton title="Link" onClick={openLinkModal} isActive={editor.isActive('link')}>
                    <LinkIcon size={18} />
                </EditorButton>
                <EditorButton title="Unlink" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}>
                    <Unlink size={18} />
                </EditorButton>
                
                <EditorButton title="Image" onClick={openImageModal}>
                    <ImageIcon size={18} />
                </EditorButton>
                <EditorButton title="YouTube" onClick={openYoutubeModal}>
                    <YoutubeIcon size={18} />
                </EditorButton>

                <Menu as="div" className="relative inline-block text-left z-10">
                    <div>
                        <Tooltip content="Table" placement="top">
                            <Menu.Button className="p-1 rounded-md transition-colors flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                <TableIcon size={18} />
                            </Menu.Button>
                        </Tooltip>
                    </div>
                    <Transition as={Fragment}>
                        <Menu.Items className="absolute left-0 mt-1 w-48 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700 p-1 flex flex-col gap-1 z-20">
                            <Menu.Item>{({ active }) => (<button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-300 w-full text-left px-2 py-1 text-sm rounded`}>Insert Table</button>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-300 w-full text-left px-2 py-1 text-sm rounded disabled:opacity-50`}>Add Column Before</button>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-300 w-full text-left px-2 py-1 text-sm rounded disabled:opacity-50`}>Add Column After</button>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-red-600 dark:text-red-400 w-full text-left px-2 py-1 text-sm rounded disabled:opacity-50`}>Delete Column</button>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-300 w-full text-left px-2 py-1 text-sm rounded disabled:opacity-50`}>Add Row Before</button>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-300 w-full text-left px-2 py-1 text-sm rounded disabled:opacity-50`}>Add Row After</button>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<button type="button" onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-red-600 dark:text-red-400 w-full text-left px-2 py-1 text-sm rounded disabled:opacity-50`}>Delete Row</button>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<button type="button" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()} className={`${active ? 'bg-red-50 dark:bg-red-900/20' : ''} text-red-600 dark:text-red-400 w-full text-left px-2 py-1 text-sm rounded disabled:opacity-50 font-bold border-t border-gray-200 dark:border-gray-700 mt-1 pt-1`}>Delete Table</button>)}</Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>

            </div>

            <Modal show={isLinkModalOpen} onClose={closeLinkModal} maxWidth="md">
                <form onSubmit={setLink} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Insert Link</h2>
                    <div>
                        <InputLabel htmlFor="url" value="URL" />
                        <TextInput id="url" type="url" className="mt-1 block w-full" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" isFocused={true} />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeLinkModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" onClick={setLink}>Save</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={isImageModalOpen} onClose={closeImageModal} maxWidth="md">
                <form onSubmit={setImage} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Insert Image</h2>
                    <div>
                        <InputLabel htmlFor="imageUrl" value="Image URL" />
                        <TextInput id="imageUrl" type="url" className="mt-1 block w-full" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" isFocused={true} />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeImageModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" onClick={setImage}>Insert</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={isYoutubeModalOpen} onClose={closeYoutubeModal} maxWidth="md">
                <form onSubmit={setYoutube} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Insert YouTube Video</h2>
                    <div>
                        <InputLabel htmlFor="youtubeUrl" value="YouTube URL" />
                        <TextInput id="youtubeUrl" type="url" className="mt-1 block w-full" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." isFocused={true} />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeYoutubeModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" onClick={setYoutube}>Insert</PrimaryButton>
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
            TaskItem.configure({ nested: true }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Superscript,
            Subscript,
            Image.configure({ inline: true, allowBase64: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            CodeBlockLowlight.configure({ lowlight }),
            Youtube.configure({ inline: false, width: 640, height: 480 }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[150px] text-gray-900 dark:text-gray-100 editor-content',
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
