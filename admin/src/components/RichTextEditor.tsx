import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Eye,
  Edit,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label = 'Article Body',
  placeholder = 'Write the full editorial piece here...',
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 10);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          {label}
        </label>
        <div className="flex items-center space-x-2 text-xs text-neutral-400 font-mono">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>~{readingTime} min read</span>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-neutral-900 transition-colors">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-50/80 border-b border-neutral-200">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-neutral-300 mx-1"></div>
            <button
              type="button"
              onClick={() => insertFormatting('## ')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Heading 2"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Heading 3"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-neutral-300 mx-1"></div>
            <button
              type="button"
              onClick={() => insertFormatting('> ')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- ')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('1. ')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://...)')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`')}
              className="p-1.5 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Write / Preview Tab toggle */}
          <div className="flex items-center space-x-1 bg-neutral-200/70 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'write'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Textarea or Preview Body */}
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={16}
            className="w-full p-4 text-sm font-sans text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-y leading-relaxed font-normal"
          />
        ) : (
          <div className="p-6 min-h-[384px] bg-white text-neutral-800 font-sans leading-relaxed text-sm overflow-y-auto space-y-4">
            {value.trim() ? (
              value.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="font-serif text-2xl font-bold text-neutral-900 mt-4 mb-2">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="font-serif text-xl font-bold text-neutral-900 mt-3 mb-1">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={idx}
                      className="border-l-4 border-neutral-900 pl-4 py-1 italic font-serif text-neutral-700 bg-neutral-50 rounded-r"
                    >
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                return (
                  <p key={idx} className="text-neutral-700 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })
            ) : (
              <p className="text-neutral-400 italic">No content to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
