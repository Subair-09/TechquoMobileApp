import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Sparkles,
  Tag as TagIcon,
  Globe,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { articleApi, categoryApi, authorApi } from '../services/api.js';
import { Article, Category, Author, ArticleStatus } from '../types/index.js';
import { ImageUploader } from '../components/ImageUploader.js';
import { RichTextEditor } from '../components/RichTextEditor.js';

export const ArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePublicId, setCoverImagePublicId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [featured, setFeatured] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Auto-slug generator
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  // Add Tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = currentTag.trim().toLowerCase().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Fetch initial metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, authRes] = await Promise.all([
          categoryApi.getCategories(),
          authorApi.getAuthors(),
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (authRes.success) setAuthors(authRes.data);

        // Pre-select first category and author if creating new
        if (!isEditing) {
          if (catRes.data.length > 0) setCategoryId(catRes.data[0]._id);
          if (authRes.data.length > 0) setAuthorId(authRes.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load categories/authors:', err);
      }
    };

    fetchMetadata();
  }, [isEditing]);

  // Load article if editing
  useEffect(() => {
    if (!isEditing || !id) return;

    const loadArticle = async () => {
      setIsLoading(true);
      try {
        const res = await articleApi.getArticle(id);
        if (res.success && res.data) {
          const art: Article = res.data;
          setTitle(art.title);
          setSlug(art.slug);
          setAutoSlug(false);
          setExcerpt(art.excerpt || '');
          setBody(art.body || '');
          setCoverImage(art.coverImage || '');
          setCoverImagePublicId(art.coverImagePublicId || '');
          setCategoryId(
            typeof art.categoryId === 'object' ? art.categoryId._id : art.categoryId
          );
          setAuthorId(
            typeof art.authorId === 'object' ? art.authorId._id : art.authorId
          );
          setTags(art.tags || []);
          setStatus(art.status);
          setFeatured(Boolean(art.featured));
          if (art.scheduledAt) {
            setScheduledAt(new Date(art.scheduledAt).toISOString().slice(0, 16));
          }
          setSeoTitle(art.seoTitle || '');
          setSeoDescription(art.seoDescription || '');
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        setError('Failed to fetch article details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [id, isEditing]);

  const handleSave = async (targetStatus?: ArticleStatus) => {
    if (!title.trim()) {
      setError('Article title is required.');
      return;
    }
    if (!excerpt.trim()) {
      setError('Article excerpt is required.');
      return;
    }
    if (!body.trim()) {
      setError('Article body is required.');
      return;
    }
    if (!coverImage) {
      setError('Please provide a cover image.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!authorId) {
      setError('Please select an author.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const finalStatus = targetStatus || status;

    const payload: Partial<Article> = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      excerpt: excerpt.trim(),
      body: body.trim(),
      coverImage,
      coverImagePublicId,
      categoryId,
      authorId,
      tags,
      status: finalStatus,
      featured,
      scheduledAt: finalStatus === 'scheduled' && scheduledAt ? scheduledAt : null,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    try {
      if (isEditing && id) {
        await articleApi.updateArticle(id, payload);
        setStatus(finalStatus);
        setSuccessMsg(
          finalStatus === 'published'
            ? 'Article published live to readers successfully!'
            : 'Article updated successfully.'
        );
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        const res = await articleApi.createArticle(payload);
        setStatus(finalStatus);
        setSuccessMsg(
          finalStatus === 'published'
            ? 'Article published live! Taking you to the story editor...'
            : 'Article draft saved! Taking you to the story editor...'
        );
        setTimeout(() => {
          navigate(`/articles/${res.data._id}/edit`);
        }, 1200);
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save article.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
          Loading article editor...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-neutral-200/80">
        <div className="flex items-center space-x-3">
          <Link
            to="/articles"
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900">
              {isEditing ? 'Edit Story' : 'New Story'}
            </h1>
            <p className="text-xs text-neutral-500">
              {isEditing ? `Editing /${slug}` : 'Compose an editorial technology article'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 shadow-2xs transition-all disabled:opacity-50 flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#050505] hover:bg-neutral-800 rounded-xl shadow-2xs transition-all disabled:opacity-50 flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{status === 'published' ? 'Update Published' : 'Publish Story'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Two-Column Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Core Editorial Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Slug */}
          <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. The Intelligence of Living: How LetPlant is Redefining Climate Tech"
                className="w-full px-4 py-3 text-lg font-serif font-bold text-neutral-900 bg-neutral-50/50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors placeholder:font-sans placeholder:font-normal placeholder:text-neutral-400 placeholder:text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  {autoSlug ? 'Lock Slug' : 'Auto-generate'}
                </button>
              </div>
              <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-600">
                <span className="text-neutral-400 select-none">techquo.news/</span>
                <input
                  type="text"
                  value={slug}
                  disabled={autoSlug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="flex-1 bg-transparent border-none focus:outline-none font-mono text-neutral-900 disabled:text-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Editorial Excerpt / Subhead
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="A compelling 1-2 sentence lead paragraph that appears in feeds and previews..."
                className="w-full p-3 text-sm bg-neutral-50/50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors leading-relaxed placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Full Body Markdown / Rich Text Editor */}
          <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs">
            <RichTextEditor
              value={body}
              onChange={setBody}
              label="Article Body"
              placeholder="Write the full story using editorial headings, quotes, bold callouts..."
            />
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Tags & Topics
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <TagIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and press Enter (e.g. AI, Climate, Fintech)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 text-neutral-800 font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Publishing Meta & Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publication Workflow Card */}
          <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">
              Publication Settings
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Editorial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 capitalize"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Live)</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Scheduled Date Picker */}
            {status === 'scheduled' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Publish At (Date & Time)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            )}

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Author
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              >
                {authors.map((auth) => (
                  <option key={auth._id} value={auth._id}>
                    {auth.name} ({auth.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Story Toggle */}
            <div className="pt-2 border-t border-neutral-100">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0 w-4 h-4"
                />
                <div className="flex items-center space-x-1.5 text-xs font-medium text-neutral-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Feature on Hero Carousel</span>
                </div>
              </label>
            </div>
          </div>

          {/* Media / Cover Image Card */}
          <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs">
            <ImageUploader
              value={coverImage}
              onChange={(url, pubId) => {
                setCoverImage(url);
                if (pubId) setCoverImagePublicId(pubId);
              }}
              label="Cover Image"
              helperText="Upload high-res editorial banner via Cloudinary"
            />
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-1.5 border-b border-neutral-100 pb-2">
              <Globe className="w-4 h-4 text-neutral-500" />
              <h3 className="text-sm font-semibold text-neutral-900">SEO & Social Meta</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Custom SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || 'Search engine title'}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Meta Description
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                placeholder={excerpt || 'Meta description for Google & Twitter...'}
                className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
