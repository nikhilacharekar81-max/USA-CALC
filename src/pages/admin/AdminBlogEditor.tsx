import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '@tiptap/extension-font-size';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline as UnderlineExtension } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import LinkExtension from '@tiptap/extension-link';
import { Table as TableExtension, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Image as ImageIcon,
  Tag,
  Folder,
  Calculator,
  Eye,
  Code,
  List,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  ListOrdered,
  Link,
  Link2Off,
  Table,
  Quote,
  Minus,
  Check,
  X,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Globe,
  Edit,
  Trash2,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { BlogPost, BlogCategory, BlogSubcategory } from '../../types/schema.ts';
import { api } from '../../services/api.ts';
import { sanitizeBlogContent } from '../../utils/sanitizeHtml.ts';

interface AdminBlogEditorProps {
  post: BlogPost | null;
  onBack: () => void;
  onSaved: () => void;
}

interface ExtractedLink {
  index: number;
  url: string;
  text: string;
  isNewTab: boolean;
  isNofollow: boolean;
  isExternal: boolean;
}

// Helper to reliably parse all links from content HTML
const extractLinksFromContent = (html: string): ExtractedLink[] => {
  if (!html) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const anchors = Array.from(doc.querySelectorAll('a'));
    return anchors.map((a, idx) => {
      const href = a.getAttribute('href') || '';
      const text = a.textContent?.trim() || href;
      const target = a.getAttribute('target');
      const rel = a.getAttribute('rel') || '';
      return {
        index: idx,
        url: href,
        text,
        isNewTab: target === '_blank',
        isNofollow: rel.includes('nofollow'),
        isExternal: href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'),
      };
    });
  } catch {
    return [];
  }
};

export const AdminBlogEditor: React.FC<AdminBlogEditorProps> = ({ post, onBack, onSaved }) => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [subcategories, setSubcategories] = useState<BlogSubcategory[]>([]);

  const [formData, setFormData] = useState<Partial<BlogPost>>(
    post || {
      title: '',
      slug: '',
      excerpt: '',
      content: '<h2>Introduction</h2><p>Start writing your tax article, policy breakdown, or scheme guide here with full formatting...</p>',
      featuredImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      category: 'Tax Planning',
      blogCategoryId: '',
      blogSubcategoryId: '',
      tags: ['Tax Planning', 'FY 2026-27'],
      author: {
        name: 'CA Rajesh Sharma',
        role: 'Senior Tax Consultant',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'Practicing Chartered Accountant specializing in direct taxation.',
      },
      status: 'published',
      readTimeMinutes: 5,
      isFeatured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ['tax calculator', 'fy 2026-27'],
      embeddedCalculators: ['income-tax-calculator'],
      showFeaturedImage: true,
    }
  );

  // Initialize form data when post prop changes
  useEffect(() => {
    if (post) {
      const clean = sanitizeBlogContent(post.content || '');
      setFormData({
        ...post,
        content: clean,
      });
      setTagInput((post.tags || []).join(', '));
      setKeywordInput((post.seoKeywords || []).join(', '));
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(clean);
      }
    } else {
      const initialContent = '<h2>Introduction</h2><p>Start writing your article here with full formatting...</p>';
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: initialContent,
        featuredImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
        category: 'Tax Planning',
        blogCategoryId: '',
        blogSubcategoryId: '',
        tags: ['Tax Planning', 'FY 2026-27'],
        author: {
          name: 'CA Rajesh Sharma',
          role: 'Senior Tax Consultant',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bio: 'Practicing Chartered Accountant specializing in direct taxation.',
        },
        status: 'published',
        readTimeMinutes: 5,
        isFeatured: false,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ['tax calculator', 'fy 2026-27'],
        embeddedCalculators: ['income-tax-calculator'],
        showFeaturedImage: true,
      });
      setTagInput('Tax Planning, FY 2026-27');
      setKeywordInput('tax calculator, fy 2026-27');
      setEditorMode('visual');
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [post]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tagInput, setTagInput] = useState((formData.tags || []).join(', '));
  const [keywordInput, setKeywordInput] = useState((formData.seoKeywords || []).join(', '));
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');

  // Custom Link Modal State (Fixed Viewport-Centered Modal)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [linkNofollow, setLinkNofollow] = useState(false);

  // Specific target link being edited (if triggered from sidebar list or clicked anchor)
  const [targetLinkIndex, setTargetLinkIndex] = useState<number | null>(null);

  // Floating Contextual Bubble Bar when cursor/click lands on a link
  const [floatingLinkBar, setFloatingLinkBar] = useState<{
    url: string;
    text: string;
    isNewTab: boolean;
    isNofollow: boolean;
    index?: number;
  } | null>(null);

  // Custom Inline Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false,
      }),
      TextStyle,
      FontSize,
      FontFamily,
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-[#2563eb] underline hover:text-[#1d4ed8] font-semibold cursor-pointer transition-colors',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TableExtension.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse w-full my-6 text-sm border border-slate-200 rounded-xl overflow-hidden',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-slate-100 font-bold text-slate-900 border border-slate-200 p-3 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-200 p-3 text-slate-700',
        },
      }),
    ],
    editorProps: {
      transformPastedHTML(html) {
        return sanitizeBlogContent(html);
      },
    },
    content: sanitizeBlogContent(formData.content || ''),
    onCreate: ({ editor }) => {
      const initial = sanitizeBlogContent(formData.content || '<h2>Introduction</h2><p>Start writing your article here with full formatting...</p>');
      editor.commands.setContent(initial);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({ ...prev, content: html }));
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive('link')) {
        const attrs = editor.getAttributes('link');
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ') || attrs.href || '';
        setFloatingLinkBar({
          url: attrs.href || '',
          text: text,
          isNewTab: attrs.target === '_blank',
          isNofollow: (attrs.rel || '').includes('nofollow'),
        });
      }
    },
  });

  // Keep editor synchronized with formData when switched externally
  useEffect(() => {
    if (editor && !editor.isDestroyed && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content || '');
    }
  }, [formData.content, editor]);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K to edit/insert link
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openLinkModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  useEffect(() => {
    const fetchTaxonomies = async () => {
      try {
        const [cats, subs] = await Promise.all([
          api.adminGetBlogCategories(),
          api.adminGetBlogSubcategories(),
        ]);
        setCategories(cats);
        setSubcategories(subs);
      } catch (err) {
        console.error('Failed to load taxonomies in editor:', err);
      }
    };
    fetchTaxonomies();
  }, []);

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !post
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug,
      seoTitle: !prev.seoTitle || prev.seoTitle === prev.title ? val : prev.seoTitle,
    }));
  };

  const handleExcerptChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      excerpt: val,
      seoDescription: !prev.seoDescription || prev.seoDescription === prev.excerpt ? val : prev.seoDescription,
    }));
  };

  const insertTagHelper = (tag: string) => {
    const currentTags = formData.tags || [];
    if (!currentTags.includes(tag)) {
      const updated = [...currentTags, tag];
      setFormData((prev) => ({ ...prev, tags: updated }));
      setTagInput(updated.join(', '));
    }
  };

  const insertKeywordHelper = (kw: string) => {
    const currentKw = formData.seoKeywords || [];
    if (!currentKw.includes(kw)) {
      const updated = [...currentKw, kw];
      setFormData((prev) => ({ ...prev, seoKeywords: updated }));
      setKeywordInput(updated.join(', '));
    }
  };

  // Helper to safely insert HTML content into Tiptap
  const insertHTMLAtCursor = (html: string) => {
    if (editor && !editor.isDestroyed) {
      editor.chain().focus().insertContent(html).run();
    }
  };

  // Trigger Link Edit Dialog with full options
  const openLinkModal = (customHref?: string, customText?: string, targetIndex?: number) => {
    let currentHref = '';
    let currentText = '';
    let currentTarget = true;
    let currentNofollow = false;

    if (targetIndex !== undefined) {
      setTargetLinkIndex(targetIndex);
    } else {
      setTargetLinkIndex(null);
    }

    if (customHref !== undefined) {
      currentHref = customHref;
      currentText = customText || '';
    } else if (editor) {
      const linkAttrs = editor.getAttributes('link');
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');

      currentHref = linkAttrs.href || '';
      currentTarget = linkAttrs.target === '_blank';
      currentNofollow = (linkAttrs.rel || '').includes('nofollow');
      currentText = selectedText || '';
    }

    setLinkUrl(currentHref);
    setLinkText(currentText);
    setLinkNewTab(currentTarget !== false);
    setLinkNofollow(currentNofollow);
    setIsLinkModalOpen(true);
  };

  // Apply or update link in both Tiptap & document HTML
  const handleInsertLink = () => {
    const cleanUrl = linkUrl.trim();
    if (!cleanUrl) return;

    let relString = 'noopener noreferrer';
    if (linkNofollow) relString += ' nofollow';
    const targetAttr = linkNewTab ? '_blank' : null;
    const cleanText = linkText.trim();

    // Case 1: Editing a specific indexed link (e.g., from Article Links Manager or clicked anchor)
    if (targetLinkIndex !== null && targetLinkIndex !== undefined) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(formData.content || '', 'text/html');
        const anchors = doc.querySelectorAll('a');
        if (anchors[targetLinkIndex]) {
          const a = anchors[targetLinkIndex];
          a.setAttribute('href', cleanUrl);
          if (cleanText) a.textContent = cleanText;
          if (linkNewTab) a.setAttribute('target', '_blank');
          else a.removeAttribute('target');
          if (linkNofollow) a.setAttribute('rel', 'noopener noreferrer nofollow');
          else a.setAttribute('rel', 'noopener noreferrer');

          const newHtml = doc.body.innerHTML;
          setFormData((prev) => ({ ...prev, content: newHtml }));
          if (editor && !editor.isDestroyed) {
            editor.commands.setContent(newHtml);
          }
        }
      } catch (err) {
        console.error('Error updating specific link by index:', err);
      }
    } else if (editor) {
      // Case 2: Editing current selection in Tiptap
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (cleanText && (!hasSelection || editor.state.doc.textBetween(from, to, ' ') !== cleanText)) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .insertContent({
            type: 'text',
            text: cleanText,
            marks: [
              {
                type: 'link',
                attrs: {
                  href: cleanUrl,
                  target: targetAttr,
                  rel: relString,
                },
              },
            ],
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({
            href: cleanUrl,
            target: targetAttr,
            rel: relString,
          })
          .run();
      }
    }

    setIsLinkModalOpen(false);
    setTargetLinkIndex(null);
    setFloatingLinkBar({
      url: cleanUrl,
      text: cleanText || cleanUrl,
      isNewTab: linkNewTab,
      isNofollow: linkNofollow,
    });
  };

  // Remove active link or indexed link
  const handleRemoveLink = (indexToRemove?: number) => {
    if (indexToRemove !== undefined) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(formData.content || '', 'text/html');
        const anchors = doc.querySelectorAll('a');
        if (anchors[indexToRemove]) {
          const a = anchors[indexToRemove];
          const textNode = doc.createTextNode(a.textContent || a.getAttribute('href') || '');
          a.parentNode?.replaceChild(textNode, a);

          const newHtml = doc.body.innerHTML;
          setFormData((prev) => ({ ...prev, content: newHtml }));
          if (editor && !editor.isDestroyed) {
            editor.commands.setContent(newHtml);
          }
        }
      } catch (err) {
        console.error('Error removing link by index:', err);
      }
    } else if (editor) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setIsLinkModalOpen(false);
    setTargetLinkIndex(null);
    setFloatingLinkBar(null);
  };

  // Image insertion
  const openImageModal = () => {
    setImageUrl('');
    setImageCaption('');
    setIsImageModalOpen(true);
  };

  const handleInsertImage = () => {
    if (!imageUrl || !editor) return;
    const html = `<figure class="my-6 text-center select-text"><img src="${imageUrl}" alt="${imageCaption || 'Article Illustration'}" class="rounded-3xl border border-slate-200 shadow-sm w-full h-auto max-h-[440px] object-cover" />${imageCaption ? `<figcaption class="text-center text-xs text-slate-400 mt-2 font-medium">${imageCaption}</figcaption>` : ''}</figure><p><br></p>`;
    editor.chain().focus().insertContent(html).run();
    setIsImageModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Article title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const tagsArray = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const keywordsArray = keywordInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      // Auto-compute read time if needed
      const rawText = (formData.content || '').replace(/<[^>]*>/g, ' ');
      const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;
      const computedReadTime = Math.max(1, Math.ceil(wordCount / 200));

      const cleanContent = sanitizeBlogContent(formData.content || '');

      const payload = {
        ...formData,
        content: cleanContent,
        tags: tagsArray,
        seoKeywords: keywordsArray,
        readTimeMinutes: formData.readTimeMinutes || computedReadTime,
        seoTitle: formData.seoTitle?.trim() || formData.title?.trim(),
        seoDescription: formData.seoDescription?.trim() || formData.excerpt?.trim(),
      };

      const url = post ? `/api/admin/blogs/${post.id}` : '/api/admin/blogs';
      const method = post ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('calc_admin_token') || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save blog post');
      }

      setSuccessMessage('Article, links, and SEO metadata saved successfully!');
      setTimeout(() => {
        onSaved();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Error saving article');
    } finally {
      setSaving(false);
    }
  };

  // Realtime Character Counts
  const seoTitleCount = (formData.seoTitle || formData.title || '').length;
  const seoDescCount = (formData.seoDescription || formData.excerpt || '').length;

  // Extract all hyperlinks present in current article content
  const allArticleLinks = extractLinksFromContent(formData.content || '');

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#0f172a]">
              {post ? 'Edit Blog Article & SEO' : 'Create New Blog Article'}
            </h1>
            <p className="text-xs text-[#64748b]">
              Continuous-page Rich Canvas Editor with live link editing and full search engine metadata.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : post ? 'Update Article & SEO' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-bold animate-in fade-in">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#2563eb]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SEAMLESS WRITING CANVAS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Slug */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">Article Title</label>
              <input
                type="text"
                required
                placeholder="Enter an engaging SEO article title..."
                value={formData.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0f172a]">URL Permalink Slug</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Permanent Link: /blog/{formData.slug || 'slug'}
                </span>
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden px-3">
                <span className="text-xs text-slate-400 font-medium">/blog/</span>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full p-2.5 bg-transparent text-xs font-bold text-[#0f172a] focus:outline-none font-mono"
                  placeholder="scheme-guide-article-slug"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0f172a]">Short Excerpt / Summary</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(formData.excerpt || '').length} characters
                </span>
              </div>
              <textarea
                rows={2}
                placeholder="Brief summary for article cards, search snippets, and social sharing..."
                value={formData.excerpt || ''}
                onChange={(e) => handleExcerptChange(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>
          </div>

          {/* Unified Rich Text Canvas Frame */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Visual Editor vs Code Source Toggle Tabs */}
            <div className="p-3 bg-slate-100 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-1.5 bg-white/80 p-1.5 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setEditorMode('visual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    editorMode === 'visual'
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visual Canvas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    editorMode === 'code'
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>HTML Code view</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                  Tip: Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-700 font-mono text-[10px]">Ctrl+K</kbd> to edit links
                </span>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2563eb]" />
                  <span>Editorial Canvas</span>
                </div>
              </div>
            </div>

            {/* FORMATTING TOOLBAR */}
            <div className="p-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center gap-1.5 select-none">
              {/* Heading Dropdown */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val === '<h1>') editor?.chain().focus().toggleHeading({ level: 1 }).run();
                  else if (val === '<h2>') editor?.chain().focus().toggleHeading({ level: 2 }).run();
                  else if (val === '<h3>') editor?.chain().focus().toggleHeading({ level: 3 }).run();
                  else editor?.chain().focus().setParagraph().run();
                  e.target.value = '';
                }}
                disabled={editorMode === 'code'}
                className="px-2 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-700 outline-none cursor-pointer"
                title="Format Selection Header"
              >
                <option value="">Paragraph / Header</option>
                <option value="<p>">Normal Paragraph (P)</option>
                <option value="<h2>">Heading 2 (H2)</option>
                <option value="<h3>">Heading 3 (H3)</option>
                <option value="<h1>">Heading 1 (H1)</option>
              </select>

              <span className="w-px h-5 bg-slate-300 mx-1" />

              {/* Font Selector */}
              <select
                onChange={(e) => {
                  if (e.target.value) editor?.chain().focus().setFontFamily(e.target.value).run();
                  e.target.value = '';
                }}
                disabled={editorMode === 'code'}
                className="px-2 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-700 outline-none cursor-pointer"
                title="Select Font"
              >
                <option value="">Font</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>

              {/* Text Size Selector */}
              <select
                onChange={(e) => {
                  const size = e.target.value;
                  if (size) editor?.chain().focus().setFontSize(size).run();
                  e.target.value = '';
                }}
                disabled={editorMode === 'code'}
                className="px-2 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-700 outline-none cursor-pointer"
                title="Select Text Size"
              >
                <option value="">Size</option>
                <option value="16px">16px (Normal Body - Default)</option>
                <option value="14px">14px (Caption / Small)</option>
                <option value="18px">18px (Medium / Lead)</option>
                <option value="20px">20px (Subheading)</option>
                <option value="24px">24px (Title)</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  if (!editor) return;
                  const currentHtml = editor.getHTML();
                  const cleaned = currentHtml
                    .replace(/<h1[^>]*>\s*<span[^>]*style="[^"]*(?:font-size:\s*14px|font-weight:\s*400)[^"]*"[^>]*>([\s\S]*?)<\/span>\s*<\/h1>/gi, '<p>$1</p>')
                    .replace(/(style="[^"]*)font-size:\s*(?:10|11|12|13|14)px;?([^"]*")/gi, '$1$2')
                    .replace(/(style="[^"]*)font-size:\s*(?:10|10\.5|11)pt;?([^"]*")/gi, '$1$2')
                    .replace(/style="\s*"/gi, '');
                  editor.commands.setContent(cleaned);
                  setFormData((prev) => ({ ...prev, content: cleaned }));
                }}
                disabled={editorMode === 'code'}
                className="px-2 py-1.5 bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#2563eb] rounded-lg border border-slate-300 text-xs font-bold cursor-pointer transition-colors"
                title="Normalize Paragraph Sizes: Removes small rogue fonts and converts misformatted headings to standard body paragraphs"
              >
                Normalize Sizes
              </button>

              <span className="w-px h-5 bg-slate-300 mx-1" />

              {/* Basic Styles */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={editorMode === 'code'}
                className={`p-1.5 rounded-lg border cursor-pointer shadow-3xs transition-colors ${
                  editor?.isActive('bold')
                    ? 'bg-emerald-100 border-[#2563eb] text-[#2563eb]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={editorMode === 'code'}
                className={`p-1.5 rounded-lg border cursor-pointer shadow-3xs transition-colors ${
                  editor?.isActive('italic')
                    ? 'bg-emerald-100 border-[#2563eb] text-[#2563eb]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                disabled={editorMode === 'code'}
                className={`p-1.5 rounded-lg border cursor-pointer shadow-3xs transition-colors ${
                  editor?.isActive('underline')
                    ? 'bg-emerald-100 border-[#2563eb] text-[#2563eb]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                disabled={editorMode === 'code'}
                className={`p-1.5 rounded-lg border cursor-pointer shadow-3xs transition-colors ${
                  editor?.isActive('strike')
                    ? 'bg-emerald-100 border-[#2563eb] text-[#2563eb]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-slate-300 mx-1" />

              {/* Alignment */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                disabled={editorMode === 'code'}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer shadow-3xs"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                disabled={editorMode === 'code'}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer shadow-3xs"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                disabled={editorMode === 'code'}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer shadow-3xs"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-slate-300 mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                disabled={editorMode === 'code'}
                className={`p-1.5 rounded-lg border cursor-pointer shadow-3xs transition-colors ${
                  editor?.isActive('bulletList')
                    ? 'bg-emerald-100 border-[#2563eb] text-[#2563eb]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                disabled={editorMode === 'code'}
                className={`p-1.5 rounded-lg border cursor-pointer shadow-3xs transition-colors ${
                  editor?.isActive('orderedList')
                    ? 'bg-emerald-100 border-[#2563eb] text-[#2563eb]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-slate-300 mx-1" />

              {/* LINK EDIT & INSERT BUTTONS */}
              <button
                type="button"
                onClick={() => openLinkModal()}
                disabled={editorMode === 'code'}
                className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold text-xs shadow-3xs cursor-pointer transition-colors ${
                  editor?.isActive('link')
                    ? 'bg-[#2563eb] text-white border-[#2563eb]'
                    : 'bg-white hover:bg-[#eff6ff] text-[#2563eb] border-[#dbeafe]'
                }`}
                title="Edit / Insert Hyperlink (Ctrl+K)"
              >
                <Link className="w-4 h-4" />
                <span>{editor?.isActive('link') ? 'Edit Link' : 'Add Link'}</span>
              </button>

              {editor?.isActive('link') && (
                <button
                  type="button"
                  onClick={() => handleRemoveLink()}
                  disabled={editorMode === 'code'}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Remove Current Link"
                >
                  <Link2Off className="w-4 h-4" />
                  <span>Unlink</span>
                </button>
              )}

              <span className="w-px h-5 bg-slate-300 mx-1" />

              {/* Insert Image Block inline */}
              <button
                type="button"
                onClick={openImageModal}
                disabled={editorMode === 'code'}
                className="p-1.5 bg-[#eff6ff] hover:bg-[#2563eb] text-[#2563eb] hover:text-white rounded-lg border border-[#bfdbfe] flex items-center gap-1 text-xs font-black cursor-pointer shadow-3xs transition-all"
                title="Insert Image Inline"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Add Image</span>
              </button>

              {/* Quotation & Table & Callout Elements */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                disabled={editorMode === 'code'}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer"
                title="Blockquote Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editor) {
                    editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run();
                  }
                }}
                disabled={editorMode === 'code'}
                className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-3xs transition-colors ${
                  editor?.isActive('table')
                    ? 'bg-emerald-100 border-[#2563eb] text-[#2563eb]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Insert Table (Rows & Columns)"
              >
                <Table className="w-4 h-4" />
                <span>Table</span>
              </button>

              {editor?.isActive('table') && (
                <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 animate-in fade-in duration-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mr-1">Table:</span>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="px-2 py-0.5 bg-white text-emerald-800 text-[11px] font-bold rounded border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                    title="Add Row Below"
                  >
                    +Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className="px-2 py-0.5 bg-white text-rose-700 text-[11px] font-bold rounded border border-rose-200 hover:bg-rose-50 cursor-pointer"
                    title="Delete Row"
                  >
                    -Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="px-2 py-0.5 bg-white text-emerald-800 text-[11px] font-bold rounded border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                    title="Add Column Right"
                  >
                    +Col
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className="px-2 py-0.5 bg-white text-rose-700 text-[11px] font-bold rounded border border-rose-200 hover:bg-rose-50 cursor-pointer"
                    title="Delete Column"
                  >
                    -Col
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded border border-rose-300 hover:bg-rose-200 cursor-pointer"
                    title="Delete Entire Table"
                  >
                    Delete
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  insertHTMLAtCursor(
                    `<div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-semibold my-4">
                      <p class="font-extrabold text-[#0f172a] mb-1">📢 Important Guidelines:</p>
                      <p class="m-0 text-emerald-800 font-medium">Add important warnings, deadlines, or registration instructions here...</p>
                    </div>`
                  )
                }
                disabled={editorMode === 'code'}
                className="px-2.5 py-1.5 bg-[#eff6ff] text-[#2563eb] hover:bg-[#1d4ed8] hover:text-white rounded-lg text-xs font-bold border border-[#bfdbfe] cursor-pointer"
                title="Callout Alert Box"
              >
                Callout Box
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                disabled={editorMode === 'code'}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer"
                title="Horizontal Divider Line"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().unsetAllMarks().run()}
                disabled={editorMode === 'code'}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                title="Clear Formatting Style"
              >
                Tx
              </button>

              <button
                type="button"
                onClick={() => {
                  const currentHtml = editor ? editor.getHTML() : formData.content || '';
                  const cleaned = sanitizeBlogContent(currentHtml);
                  setFormData((prev) => ({ ...prev, content: cleaned }));
                  if (editor && !editor.isDestroyed) {
                    editor.commands.setContent(cleaned);
                  }
                  setSuccessMessage('Cleaned dark boxes, code blocks & normalized text!');
                  setTimeout(() => setSuccessMessage(''), 3000);
                }}
                disabled={editorMode === 'code'}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 cursor-pointer flex items-center gap-1.5 shadow-3xs transition-colors ml-auto sm:ml-0"
                title="Strip dark boxes, pre/code blocks, pasted AI components, and normalize paragraphs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Clean Formatting</span>
              </button>
            </div>

            {/* FLOATING ACTION TOOLTIP (Shown when any link is clicked or active) */}
            {floatingLinkBar && (
              <div className="sticky top-0 z-30 p-3 bg-gradient-to-r from-emerald-50 via-slate-50 to-white border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-1 duration-150">
                <div className="flex items-center gap-2 text-xs text-slate-800 font-medium overflow-hidden">
                  <span className="font-extrabold text-[#2563eb] uppercase tracking-wider text-[10px] bg-[#bfdbfe] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Link className="w-3 h-3" />
                    <span>Link Selected</span>
                  </span>
                  {floatingLinkBar.text && (
                    <span className="font-bold text-[#0f172a] max-w-[160px] truncate" title={floatingLinkBar.text}>
                      "{floatingLinkBar.text}"
                    </span>
                  )}
                  <span className="text-slate-400">&rarr;</span>
                  <a
                    href={floatingLinkBar.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-700 hover:underline max-w-[260px] truncate font-mono flex items-center gap-1"
                  >
                    <span>{floatingLinkBar.url}</span>
                    <ExternalLink className="w-3 h-3 inline shrink-0" />
                  </a>
                  {floatingLinkBar.isNewTab && (
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      new-tab
                    </span>
                  )}
                  {floatingLinkBar.isNofollow && (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      nofollow
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openLinkModal(floatingLinkBar.url, floatingLinkBar.text, floatingLinkBar.index)}
                    className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(floatingLinkBar.index)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFloatingLinkBar(null)}
                    className="p-1 bg-transparent hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* SINGLE RICH TEXT CANVAS AREA */}
            <div
              className="p-6 min-h-[550px] relative bg-white"
              onClick={(e) => {
                let target = e.target as HTMLElement | null;
                let foundAnchor: HTMLAnchorElement | null = null;
                while (target && target !== e.currentTarget) {
                  if (target.tagName === 'A') {
                    foundAnchor = target as HTMLAnchorElement;
                    break;
                  }
                  target = target.parentElement;
                }
                if (foundAnchor) {
                  e.preventDefault();
                  const href = foundAnchor.getAttribute('href') || '';
                  const text = foundAnchor.textContent?.trim() || '';
                  const isNewTab = foundAnchor.getAttribute('target') === '_blank';
                  const isNofollow = (foundAnchor.getAttribute('rel') || '').includes('nofollow');

                  // Find index among all anchors in document
                  const allAnchors = Array.from(e.currentTarget.querySelectorAll('a'));
                  const idx = allAnchors.indexOf(foundAnchor);

                  setFloatingLinkBar({
                    url: href,
                    text: text || href,
                    isNewTab,
                    isNofollow,
                    index: idx >= 0 ? idx : undefined,
                  });
                }
              }}
            >
              {editorMode === 'visual' ? (
                <EditorContent
                  editor={editor}
                  className="min-h-[500px] prose prose-emerald max-w-none text-[#0f172a] text-base sm:text-lg leading-relaxed focus:outline-none font-sans"
                />
              ) : (
                <textarea
                  id="blog-content-editor-textarea"
                  rows={26}
                  value={formData.content || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, content: val }));
                    if (editor && !editor.isDestroyed) {
                      editor.commands.setContent(val || '');
                    }
                  }}
                  className="w-full min-h-[500px] p-5 font-mono text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white leading-relaxed shadow-inner"
                  placeholder="<p>Enter raw HTML tags here...</p>"
                />
              )}
            </div>

            {/* Canvas Word Count & Status Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-4">
                <span>
                  Words: <strong className="text-slate-700">{(formData.content || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length}</strong>
                </span>
                <span>
                  Estimated Read Time: <strong className="text-slate-700">{Math.max(1, Math.ceil((formData.content || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length / 200))} min</strong>
                </span>
                <span>
                  Links in Document: <strong className="text-emerald-700 font-bold">{allArticleLinks.length}</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Click any link directly to edit &bull; Press Ctrl+Z to undo
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR SIDEBAR (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* ARTICLE LINKS MANAGER CARD (All links in this article) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2563eb] flex items-center justify-center">
                  <Link className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Links in this Article</h3>
                  <p className="text-[11px] text-slate-400">Manage, edit, or test all hyperlinks</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full">
                {allArticleLinks.length} {allArticleLinks.length === 1 ? 'Link' : 'Links'}
              </span>
            </div>

            {allArticleLinks.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400 space-y-2">
                <p>No hyperlinks detected in this article yet.</p>
                <button
                  type="button"
                  onClick={() => openLinkModal()}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-[#2563eb] border border-[#2563eb]/30 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-3xs"
                >
                  + Add First Link
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {allArticleLinks.map((item) => (
                  <div
                    key={item.index}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-200 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#0f172a] truncate" title={item.text}>
                          {item.text || 'Untitled Link'}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700 truncate" title={item.url}>
                          {item.url}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openLinkModal(item.url, item.text, item.index)}
                          className="p-1.5 bg-white hover:bg-emerald-100 text-[#2563eb] rounded-lg border border-slate-200 cursor-pointer transition-colors"
                          title="Edit this Link"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-pointer transition-colors"
                          title="Test Link in New Tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(item.index)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-500 rounded-lg border border-slate-200 cursor-pointer transition-colors"
                          title="Remove this Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      {item.isNewTab ? (
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                          Opens in New Tab
                        </span>
                      ) : (
                        <span className="bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          Same Tab
                        </span>
                      )}
                      {item.isNofollow ? (
                        <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-200">
                          rel="nofollow"
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                          Dofollow
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => openLinkModal()}
              className="w-full py-2 bg-slate-100 hover:bg-[#eff6ff] text-[#2563eb] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-dashed border-[#2563eb]/40 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert New Hyperlink</span>
            </button>
          </div>

          {/* SEO & SEARCH ENGINE META TAGS CARD (Prominent Meta Title & Description) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2563eb] flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">SEO Meta Title &amp; Description</h3>
                  <p className="text-[11px] text-slate-400">Search engine indexing &amp; SERP preview</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full uppercase">
                SEO Suite
              </span>
            </div>

            {/* Quick Auto-Sync helper */}
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
              <span className="text-emerald-900 font-medium text-[11px]">
                Sync with Article Title &amp; Excerpt?
              </span>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    seoTitle: prev.title || '',
                    seoDescription: prev.excerpt || '',
                  }));
                }}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-[#2563eb] border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                Auto-Fill SEO
              </button>
            </div>

            {/* Meta Title Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Search Meta Title (Page Title)
                </label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    seoTitleCount === 0
                      ? 'text-slate-400'
                      : seoTitleCount <= 60
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {seoTitleCount} / 60 chars {seoTitleCount > 60 && '(Long)'}
                </span>
              </div>
              <input
                type="text"
                value={formData.seoTitle || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                placeholder={formData.title || 'Enter custom search meta title...'}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Rendered as &lt;title&gt; tag in HTML head and shown in Google search result headlines. Defaults to Article Title.
              </p>
            </div>

            {/* Meta Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Search Meta Description (Snippet)
                </label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    seoDescCount === 0
                      ? 'text-slate-400'
                      : seoDescCount >= 120 && seoDescCount <= 160
                      ? 'text-emerald-600'
                      : seoDescCount > 160
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  {seoDescCount} / 160 chars {seoDescCount > 160 && '(Truncted in SERP)'}
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                placeholder={formData.excerpt || 'Enter search engine snippet description (recommended 140-160 chars)...'}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white leading-relaxed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Rendered as &lt;meta name="description"&gt; in HTML head. Compelling descriptions improve click-through rates from search engines.
              </p>
            </div>

            {/* SEO Keywords Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target SEO Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => {
                  setKeywordInput(e.target.value);
                  const parsed = e.target.value.split(',').map((k) => k.trim()).filter(Boolean);
                  setFormData((prev) => ({ ...prev, seoKeywords: parsed }));
                }}
                placeholder="education loan, vidyalaxmi scheme, interest subsidy"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['tax calculator', 'vidyalaxmi 2026', 'loan subsidy', 'section 80C'].map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => insertKeywordHelper(kw)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-[#2563eb] text-slate-600 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    + {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Google Search Result Realtime Preview Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Google Search Live Preview
                </span>
                <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                  Desktop &amp; Mobile
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 font-mono truncate">
                https://calcplatform.org &rsaquo; blog &rsaquo; {formData.slug || 'article-slug'}
              </div>
              <div className="text-sm font-bold text-[#1a0dab] hover:underline leading-snug line-clamp-1 cursor-pointer">
                {formData.seoTitle || formData.title || 'Enter your Article Title'}
              </div>
              <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {formData.seoDescription || formData.excerpt || 'Your article search engine summary description will appear here under your page link.'}
              </div>
            </div>
          </div>

          {/* Publish Settings Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-3">
              Publishing Settings
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Article Status</label>
              <select
                value={formData.status || 'published'}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as any }))
                }
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0f172a]"
              >
                <option value="published">Published (Live on Site)</option>
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-700">Featured Article Hero</span>
              <input
                type="checkbox"
                checked={formData.isFeatured || false}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="w-5 h-5 text-[#2563eb] rounded-md border-slate-300 focus:ring-[#2563eb] cursor-pointer"
              />
            </div>
          </div>

          {/* Category & Tags Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#2563eb]" />
              <span>Category &amp; Taxonomies</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Blog Category</label>
              <select
                value={formData.blogCategoryId || ''}
                onChange={(e) => {
                  const catId = e.target.value;
                  const selectedCat = categories.find((c) => c.id === catId);
                  setFormData((prev) => ({
                    ...prev,
                    blogCategoryId: catId,
                    category: selectedCat ? selectedCat.name : prev.category,
                    blogSubcategoryId: '',
                  }));
                }}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0f172a]"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.blogCategoryId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subcategory</label>
                <select
                  value={formData.blogSubcategoryId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, blogSubcategoryId: e.target.value }))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0f172a]"
                >
                  <option value="">Select Subcategory (Optional)...</option>
                  {subcategories
                    .filter((s) => s.blogCategoryId === formData.blogCategoryId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tags</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  const parsed = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                  setFormData((prev) => ({ ...prev, tags: parsed }));
                }}
                placeholder="Direct Tax, Section 80C, Loan Scheme"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-[#0f172a]"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {['Tax Planning', 'FY 2026-27', 'Scholarship', 'Education Loan', 'Direct Tax'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => insertTagHelper(t)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-[#2563eb] text-slate-600 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Cover Image Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#2563eb]" />
                <span>Featured Cover Image</span>
              </span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={formData.showFeaturedImage !== false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, showFeaturedImage: e.target.checked }))}
                  className="w-4 h-4 text-[#2563eb] rounded border-slate-300 focus:ring-[#2563eb]"
                />
                <span>Show in Post</span>
              </label>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Upload File</label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-[#2563eb] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEvent) => {
                          const base64 = uploadEvent.target?.result as string;
                          setFormData((prev) => ({ ...prev, featuredImage: base64 }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#0f172a]">
                    <ImageIcon className="w-4 h-4 text-[#2563eb]" />
                    <span>Upload image from computer</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Or Paste Image URL</label>
                <input
                  type="url"
                  value={formData.featuredImage || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-[#0f172a]"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {formData.featuredImage && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-100">
                  <img
                    src={formData.featuredImage}
                    alt="Cover preview"
                    className="w-full h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, featuredImage: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full cursor-pointer transition-colors"
                    title="Remove Cover Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Embedded Calculator Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#2563eb]" />
              <span>Embed Calculator Widget</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Interactive Calculator to Embed</label>
              <select
                value={formData.embeddedCalculators?.[0] || 'none'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    embeddedCalculators: e.target.value === 'none' ? [] : [e.target.value],
                  }))
                }
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0f172a]"
              >
                <option value="none">None</option>
                <option value="income-tax-calculator">Income Tax Calculator (Enterprise)</option>
                <option value="old-vs-new-tax-regime">Old vs New Tax Regime Calculator</option>
                <option value="tds">TDS Calculator</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Embeds the interactive calculator directly at the bottom of the article for readers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED VIEWPORT-CENTERED LINK EDIT MODAL (Always front and center anywhere on page) */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#2563eb] flex items-center justify-center shadow-xs">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0f172a]">
                    {targetLinkIndex !== null || editor?.isActive('link')
                      ? 'Edit Hyperlink & Anchor Text'
                      : 'Insert Hyperlink'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Target destination URL, anchor text, and SEO target options.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setTargetLinkIndex(null);
                }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Destination URL (href) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://pmvidyalaxmi.co.in or /blog/article-slug"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white"
                  autoFocus
                />
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold">Quick prefix:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!linkUrl.startsWith('https://')) setLinkUrl(`https://${linkUrl.replace(/^http:\/\//, '')}`);
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono cursor-pointer"
                  >
                    https://
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!linkUrl.startsWith('/blog/')) setLinkUrl(`/blog/${linkUrl.replace(/^\//, '')}`);
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono cursor-pointer"
                  >
                    /blog/
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Strip tracking parameters like utm_source
                      try {
                        const u = new URL(linkUrl);
                        u.searchParams.delete('utm_source');
                        u.searchParams.delete('utm_medium');
                        u.searchParams.delete('utm_campaign');
                        setLinkUrl(u.toString());
                      } catch {
                        // ignore if invalid URL
                      }
                    }}
                    className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#2563eb] px-2 py-0.5 rounded font-bold cursor-pointer border border-[#2563eb]/30"
                  >
                    Clean UTM tags
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Display Anchor Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Official Application Guidelines Portal"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Text displayed to the reader. If changed, updates the link label in the article.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none font-bold">
                  <input
                    type="checkbox"
                    checked={linkNewTab}
                    onChange={(e) => setLinkNewTab(e.target.checked)}
                    className="w-4 h-4 text-[#2563eb] rounded border-slate-300 focus:ring-[#2563eb]"
                  />
                  <span>Open link in new browser tab (target="_blank")</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none font-bold">
                  <input
                    type="checkbox"
                    checked={linkNofollow}
                    onChange={(e) => setLinkNofollow(e.target.checked)}
                    className="w-4 h-4 text-[#2563eb] rounded border-slate-300 focus:ring-[#2563eb]"
                  />
                  <span>Add rel="nofollow" (Instruct search bots not to pass PageRank)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {(targetLinkIndex !== null || editor?.isActive('link')) ? (
                <button
                  type="button"
                  onClick={() => handleRemoveLink(targetLinkIndex !== null ? targetLinkIndex : undefined)}
                  className="px-3.5 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Link</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLinkModalOpen(false);
                    setTargetLinkIndex(null);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  disabled={!linkUrl.trim()}
                  className="px-5 py-2 text-xs font-bold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIXED VIEWPORT-CENTERED IMAGE MODAL */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#2563eb] flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0f172a]">Insert Content Image Illustration</h3>
                  <p className="text-[11px] text-slate-400">Embed high-resolution images inside paragraphs.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Image URL (HTTPS) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Image Caption / Alt Text</label>
                <input
                  type="text"
                  placeholder="Education loan scheme application steps diagram"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!imageUrl}
                className="px-5 py-2 text-xs font-bold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
