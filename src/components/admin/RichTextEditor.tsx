import React, { useState, useRef, useEffect } from 'react';
import { formatContentHtml } from '../../utils/formatters.ts';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  AlertCircle,
  Eye,
  Edit3,
  Code2,
  RemoveFormatting,
  Trash2,
  Scissors,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

/**
 * Cleans pasted HTML from Word, Google Docs, Notion, or web pages,
 * preserving headlines, bold, italics, bullet lists, numbered lists, tables, and links.
 */
function cleanPastedHtml(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove unsafe or irrelevant tags
    doc.querySelectorAll('script, style, meta, link, noscript, xml').forEach((el) => el.remove());

    // Normalize styles and classes while preserving semantic tags
    doc.querySelectorAll('*').forEach((el) => {
      const tag = el.tagName.toLowerCase();

      // Remove Microsoft Word / Google Docs proprietary attributes
      el.removeAttribute('class');
      el.removeAttribute('style');

      if (tag === 'b') {
        const strong = doc.createElement('strong');
        strong.innerHTML = el.innerHTML;
        el.replaceWith(strong);
      } else if (tag === 'i') {
        const em = doc.createElement('em');
        em.innerHTML = el.innerHTML;
        el.replaceWith(em);
      }
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

/**
 * Converts markdown formatted text (headings, bold, bullet points) into clean HTML
 */
function parseMarkdownToHtml(text: string): string {
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  const processed = text
    .replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-[#0f172a] mt-3 mb-1.5">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-base sm:text-lg font-bold text-[#0f172a] mt-4 mb-2">$1</h3>')
    .replace(/^# (.*$)/gim, '<h2 class="text-lg sm:text-xl font-black text-[#0f172a] mt-4 mb-2">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = processed.split('\n');
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const ulMatch = line.match(/^[\*\-]\s+(.*)/);
    const olMatch = line.match(/^\d+\.\s+(.*)/);

    if (ulMatch) {
      if (inOl) {
        result.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        result.push('<ul class="list-disc pl-5 space-y-1.5 my-3">');
        inUl = true;
      }
      result.push(`  <li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (inUl) {
        result.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        result.push('<ol class="list-decimal pl-5 space-y-1.5 my-3">');
        inOl = true;
      }
      result.push(`  <li>${olMatch[1]}</li>`);
    } else {
      if (inUl) {
        result.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        result.push('</ol>');
        inOl = false;
      }
      if (line.trim().length > 0) {
        if (/^<h[1-6]/.test(line.trim())) {
          result.push(line);
        } else {
          result.push(`<p class="mb-3 leading-relaxed">${line}</p>`);
        }
      }
    }
  }

  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');

  return result.join('\n');
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write detailed content here...',
  minHeight = '220px',
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'html' | 'preview'>('visual');
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastEmittedHtmlRef = useRef<string>(value || '');

  // Synchronize value to visual editor when not focused or when mounting/switching modes
  useEffect(() => {
    if (editorRef.current && viewMode === 'visual') {
      const isFocused =
        typeof document !== 'undefined' &&
        (document.activeElement === editorRef.current || editorRef.current.contains(document.activeElement));

      if (!isFocused && editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
        lastEmittedHtmlRef.current = value || '';
      }
    }
  }, [value, viewMode]);

  // Handle direct input in Visual ContentEditable mode
  const handleVisualInput = () => {
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML;

    // Clean empty content so ghost tags don't linger
    const textContent = editorRef.current.innerText?.trim() || '';
    const hasMedia = editorRef.current.querySelector('img, iframe');
    const hasFilledTable = Array.from(editorRef.current.querySelectorAll('td, th')).some(
      (cell) => (cell.textContent?.trim() || '').length > 0
    );

    if (textContent === '' && !hasMedia && !hasFilledTable) {
      html = '';
      editorRef.current.innerHTML = '';
    }

    lastEmittedHtmlRef.current = html;
    onChange(html);
  };

  // Blur cleanup: ensure deleted empty content emits '' cleanly
  const handleBlur = () => {
    if (!editorRef.current) return;
    const textContent = editorRef.current.innerText?.trim() || '';
    const hasMedia = editorRef.current.querySelector('img, iframe');
    const hasFilledTable = Array.from(editorRef.current.querySelectorAll('td, th')).some(
      (cell) => (cell.textContent?.trim() || '').length > 0
    );

    if (textContent === '' && !hasMedia && !hasFilledTable) {
      editorRef.current.innerHTML = '';
      lastEmittedHtmlRef.current = '';
      onChange('');
    } else {
      const html = editorRef.current.innerHTML;
      lastEmittedHtmlRef.current = html;
      onChange(html);
    }
  };

  // Smart keyboard handler for Backspace and Delete keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);

      // Check if user selected entire content or editor is blank
      if (editorRef.current) {
        const fullText = editorRef.current.innerText?.trim() || '';
        const selectedText = selection.toString()?.trim() || '';
        if (selectedText.length > 0 && selectedText === fullText) {
          e.preventDefault();
          editorRef.current.innerHTML = '';
          lastEmittedHtmlRef.current = '';
          onChange('');
          return;
        }
      }

      // Check if cursor is inside an empty block container (callout, table, blockquote, heading)
      const node = range.startContainer;
      const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
      if (element && editorRef.current?.contains(element)) {
        const block = element.closest('table, blockquote, .p-4, div[class*="rounded"], h2, h3, h4');
        if (block && editorRef.current.contains(block)) {
          const text = block.textContent?.trim() || '';
          if (text === '') {
            e.preventDefault();
            block.remove();
            handleVisualInput();
            return;
          }
        }
      }
    }
  };

  // Execute formatting commands in Visual Mode
  const executeCommand = (command: string, arg?: string) => {
    if (viewMode !== 'visual') {
      setViewMode('visual');
      setTimeout(() => executeCommand(command, arg), 50);
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleVisualInput();
  };

  // Delete the currently focused or containing block (table, callout, blockquote, heading, list)
  const handleDeleteCurrentBlock = () => {
    if (viewMode !== 'visual' || !editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      // If nothing selected, ask if user wants to clear
      return;
    }
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    if (!element || !editorRef.current.contains(element)) return;

    // Find the enclosing block element
    const block = element.closest('table, blockquote, .p-4, div[class*="rounded"], h2, h3, h4, ul, ol');
    if (block && editorRef.current.contains(block)) {
      block.remove();
      handleVisualInput();
    } else {
      document.execCommand('delete');
      handleVisualInput();
    }
  };

  // Clear all content in one click
  const handleClearAll = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    lastEmittedHtmlRef.current = '';
    onChange('');
  };

  // Smart Paste Handler: Captures rich text formatting (bold, bullets, headings, lists)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const pastedHtml = clipboardData.getData('text/html');
    const pastedText = clipboardData.getData('text/plain');

    let contentToInsert = '';

    if (pastedHtml && pastedHtml.trim().length > 0) {
      // Clean HTML from Google Docs, Word, ChatGPT, or web pages
      contentToInsert = cleanPastedHtml(pastedHtml);
    } else if (pastedText && pastedText.trim().length > 0) {
      // Check if plain text has bullet points or markdown
      if (/^[\*\-]\s+|^\d+\.\s+|^\#{1,4}\s+|\*\*/m.test(pastedText)) {
        contentToInsert = parseMarkdownToHtml(pastedText);
      } else {
        contentToInsert = formatContentHtml(pastedText);
      }
    }

    if (contentToInsert) {
      document.execCommand('insertHTML', false, contentToInsert);
      handleVisualInput();
    }
  };

  const insertTable = () => {
    const tableTemplate = `
<table class="w-full text-left text-xs sm:text-sm border-collapse my-4 border border-[#e2e8f0]">
  <thead class="bg-[#fafafa]">
    <tr>
      <th class="p-3 border border-[#e2e8f0] font-bold text-[#0f172a]">Parameter / Category</th>
      <th class="p-3 border border-[#e2e8f0] font-bold text-[#0f172a]">Applicable Rate</th>
      <th class="p-3 border border-[#e2e8f0] font-bold text-[#0f172a]">Rules & Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-3 border border-[#e2e8f0]">Standard Baseline</td>
      <td class="p-3 border border-[#e2e8f0] font-semibold text-emerald-600">Standard Rate</td>
      <td class="p-3 border border-[#e2e8f0]">Primary statutory assumption</td>
    </tr>
    <tr>
      <td class="p-3 border border-[#e2e8f0]">Secondary Tier</td>
      <td class="p-3 border border-[#e2e8f0] font-semibold">Tier Rate</td>
      <td class="p-3 border border-[#e2e8f0]">Subject to statutory thresholds</td>
    </tr>
  </tbody>
</table>
`;
    if (viewMode === 'visual') {
      executeCommand('insertHTML', tableTemplate);
    } else {
      const nextVal = (value || '') + tableTemplate;
      lastEmittedHtmlRef.current = nextVal;
      onChange(nextVal);
    }
  };

  const insertCallout = (type: 'info' | 'warning' | 'success') => {
    let classes = 'p-4 rounded-xl my-4 text-xs sm:text-sm leading-relaxed ';
    let title = 'Pro Tip:';
    if (type === 'warning') {
      classes += 'bg-amber-50 border border-amber-200 text-amber-900';
      title = 'Important Warning:';
    } else if (type === 'success') {
      classes += 'bg-emerald-50 border border-emerald-200 text-emerald-900';
      title = 'Key Insight:';
    } else {
      classes += 'bg-blue-50 border border-blue-200 text-blue-900';
      title = 'Note:';
    }

    const template = `
<div class="${classes}">
  <strong>${title}</strong> Check your financial year and eligible Chapter VI-A deductions before filing.
</div>
`;
    if (viewMode === 'visual') {
      executeCommand('insertHTML', template);
    } else {
      const nextVal = (value || '') + template;
      lastEmittedHtmlRef.current = nextVal;
      onChange(nextVal);
    }
  };

  return (
    <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col">
      {/* Top Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-[#fafafa] border-b border-[#e2e8f0]">
        <div className="flex flex-wrap items-center gap-1">
          {/* Bold */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer font-bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            title="Underline (Ctrl+U)"
            className="p-1.5 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-[#e2e8f0] mx-1" />

          {/* Headline H2 */}
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            title="Heading 2 (Bold Headline)"
            className="px-2 py-1 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer text-xs font-black flex items-center gap-1"
          >
            <Heading2 className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>H2</span>
          </button>

          {/* Headline H3 */}
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            title="Heading 3 (Sub-headline)"
            className="px-2 py-1 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer text-xs font-bold flex items-center gap-1"
          >
            <Heading3 className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>H3</span>
          </button>

          <div className="w-[1px] h-4 bg-[#e2e8f0] mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet Points List"
            className="p-1.5 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List"
            className="p-1.5 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-[#e2e8f0] mx-1" />

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            title="Blockquote"
            className="p-1.5 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          {/* Table */}
          <button
            type="button"
            onClick={insertTable}
            title="Insert Structured Comparison Table"
            className="p-1.5 rounded hover:bg-white text-[#334155] hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>

          {/* Callouts */}
          <button
            type="button"
            onClick={() => insertCallout('info')}
            title="Insert Tip Callout"
            className="px-2 py-1 rounded hover:bg-white text-blue-600 border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer text-[11px] font-bold"
          >
            + Tip
          </button>

          <button
            type="button"
            onClick={() => insertCallout('warning')}
            title="Insert Warning Callout"
            className="px-2 py-1 rounded hover:bg-white text-amber-600 border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer text-[11px] font-bold flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            <span>Warning</span>
          </button>

          <div className="w-[1px] h-4 bg-[#e2e8f0] mx-1" />

          {/* Delete Current Block / Container */}
          <button
            type="button"
            onClick={handleDeleteCurrentBlock}
            title="Delete Current Block (Table, Callout, Heading, or Quote under cursor)"
            className="p-1.5 rounded hover:bg-amber-50 text-[#64748b] hover:text-amber-600 border border-transparent hover:border-amber-200 transition-all cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>

          {/* Remove formatting */}
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            title="Clear Selected Formatting"
            className="p-1.5 rounded hover:bg-white text-[#64748b] hover:text-red-500 border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>

          {/* Clear All Content */}
          <button
            type="button"
            onClick={handleClearAll}
            title="Clear All Content in this Editor"
            className="p-1.5 rounded hover:bg-rose-50 text-[#64748b] hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#eeeeee] p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-white text-[#2563eb] shadow-2xs'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Visual Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('html')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'html'
                ? 'bg-white text-[#0f172a] shadow-2xs'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span>HTML (&lt;&gt;)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-white text-[#2563eb] shadow-2xs'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {viewMode === 'visual' && (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleVisualInput}
          onBlur={handleBlur}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          style={{ minHeight }}
          className="w-full p-4 text-xs sm:text-sm text-[#0f172a] leading-relaxed focus:outline-none bg-white prose max-w-none overflow-y-auto font-sans"
          data-placeholder={placeholder}
        />
      )}

      {viewMode === 'html' && (
        <textarea
          ref={textareaRef}
          value={value || ''}
          onChange={(e) => {
            const nextVal = e.target.value;
            lastEmittedHtmlRef.current = nextVal;
            onChange(nextVal);
          }}
          placeholder="Edit raw HTML tags here..."
          style={{ minHeight }}
          className="w-full p-4 text-xs font-mono text-emerald-400 bg-[#1e1e1e] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#2563eb] resize-y block border-t border-[#333]"
        />
      )}

      {viewMode === 'preview' && (
        <div
          style={{ minHeight }}
          className="p-5 bg-white text-xs sm:text-sm text-[#334155] leading-relaxed overflow-y-auto prose prose-slate max-w-none border-t border-[#f0f0f0] whitespace-pre-line space-y-3 font-sans"
        >
          {value && value.trim().length > 0 ? (
            <div dangerouslySetInnerHTML={{ __html: formatContentHtml(value) }} />
          ) : (
            <span className="italic text-[#95979d]">
              No content entered yet. Switch back to Visual Editor to write or paste content.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
