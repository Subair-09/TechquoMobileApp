import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  Twitter,
  Linkedin,
  AlertCircle,
  CheckCircle2,
  Search,
  Mail,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { authorApi } from '../services/api.js';
import { Author } from '../types/index.js';
import { Modal } from '../components/Modal.js';
import { ImageUploader } from '../components/ImageUploader.js';

export const AuthorsPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [role, setRole] = useState('Staff Writer');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [reassignAuthorId, setReassignAuthorId] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAuthors = async () => {
    setIsLoading(true);
    try {
      const res = await authorApi.getAuthors();
      if (res.success) {
        setAuthors(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load authors:', err);
      setError('Failed to fetch authors.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const openCreateModal = () => {
    setEditingAuthor(null);
    setName('');
    setSlug('');
    setRole('Staff Writer');
    setEmail('');
    setBio('');
    setAvatar('');
    setTwitter('');
    setLinkedin('');
    setWebsite('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (author: Author) => {
    setEditingAuthor(author);
    setName(author.name);
    setSlug(author.slug);
    setRole(author.role);
    setEmail(author.email || '');
    setBio(author.bio || '');
    setAvatar(author.avatarUrl || author.avatar || '');
    setTwitter(author.twitter || '');
    setLinkedin(author.linkedin || '');
    setWebsite(author.website || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingAuthor) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      role: role.trim(),
      email: email.trim() || undefined,
      bio: bio.trim(),
      avatarUrl: avatar.trim() || undefined,
      avatar: avatar.trim() || undefined,
      twitter: twitter.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      website: website.trim() || undefined,
    };

    try {
      if (editingAuthor) {
        await authorApi.updateAuthor(editingAuthor._id, payload);
        setSuccessMessage(`Author "${name.trim()}" updated successfully.`);
      } else {
        await authorApi.createAuthor(payload);
        setSuccessMessage(`New author "${name.trim()}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchAuthors();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Save author failed:', err);
      setError(err.response?.data?.message || 'Failed to save author.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (author: Author) => {
    setDeleteTarget(author);
    setDeleteError(null);
    // Find default replacement author (if this author has stories)
    const otherAuthors = authors.filter((a) => a._id !== author._id);
    if (otherAuthors.length > 0) {
      setReassignAuthorId(otherAuthors[0]._id);
    } else {
      setReassignAuthorId('');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const hasArticles = (deleteTarget.articleCount ?? 0) > 0;
    if (hasArticles && !reassignAuthorId) {
      setDeleteError('Please choose a replacement author to reassign the stories to.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await authorApi.deleteAuthor(
        deleteTarget._id,
        hasArticles ? reassignAuthorId : undefined
      );

      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      setSuccessMessage(res.message || `Author "${deletedName}" deleted successfully.`);
      fetchAuthors();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Delete author failed:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete author.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim()) return authors;
    const query = searchQuery.toLowerCase().trim();
    return authors.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.role.toLowerCase().includes(query) ||
        a.slug.toLowerCase().includes(query) ||
        (a.email && a.email.toLowerCase().includes(query))
    );
  }, [authors, searchQuery]);

  const otherAuthorsForReassign = useMemo(() => {
    if (!deleteTarget) return [];
    return authors.filter((a) => a._id !== deleteTarget._id);
  }, [authors, deleteTarget]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Authors & Writers
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Manage journalists, contributing columnists, and editorial staff
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#050505] hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Author</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Counter Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search authors by name, role, or email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-neutral-500 font-mono">
          <span>{filteredAuthors.length}</span>
          <span>{filteredAuthors.length === 1 ? 'author' : 'authors'}</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-neutral-900 underline hover:text-neutral-700 font-sans"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Authors Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
            Loading authors...
          </p>
        </div>
      ) : filteredAuthors.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-xs text-neutral-400">
          {searchQuery ? 'No authors matching your search criteria.' : 'No authors registered yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAuthors.map((auth) => {
            const avatarSrc = auth.avatarUrl || auth.avatar;
            return (
              <div
                key={auth._id}
                className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-neutral-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={auth.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-700 font-bold text-sm bg-neutral-200">
                            {auth.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-neutral-900 text-sm truncate">{auth.name}</h3>
                        <p className="text-xs text-neutral-500 truncate">{auth.role}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      {auth.articleCount ?? 0} {auth.articleCount === 1 ? 'story' : 'stories'}
                    </span>
                  </div>

                  {auth.email && (
                    <div className="flex items-center space-x-1.5 mt-2.5 text-[11px] text-neutral-500">
                      <Mail className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{auth.email}</span>
                    </div>
                  )}

                  <p className="text-xs text-neutral-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {auth.bio || 'Editorial journalist at TechQuo News.'}
                  </p>

                  {/* Social links */}
                  <div className="flex items-center space-x-3 mt-4 text-neutral-400">
                    {auth.twitter && (
                      <a
                        href={`https://twitter.com/${auth.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Twitter / X"
                        className="hover:text-blue-500 transition-colors"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {auth.linkedin && (
                      <a
                        href={auth.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        title="LinkedIn"
                        className="hover:text-blue-700 transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {auth.website && (
                      <a
                        href={auth.website}
                        target="_blank"
                        rel="noreferrer"
                        title="Personal Website"
                        className="hover:text-neutral-800 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    /{auth.slug}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(auth)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(auth)}
                      title="Delete Author"
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Author Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAuthor ? 'Edit Author Profile' : 'Create Author Profile'}
        subtitle="Public editorial author credentials, biography, and Cloudinary portrait"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploader
            value={avatar}
            onChange={(url) => setAvatar(url)}
            label="Avatar Photo"
            helperText="Author portrait photo uploaded directly to Cloudinary"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Nurudeen Adewale"
              required
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Editorial Role *
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Technology Editor"
                required
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Slug (URL Identifier) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="nurudeen-adewale"
                required
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="writer@techquo.news"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Biography
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Author background, expertise, beats, and focus areas..."
              className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Twitter / X Handle
              </label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@username"
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Personal Website URL
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <span>{isSubmitting ? 'Saving...' : editingAuthor ? 'Update Author' : 'Create Author'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Reassign Author Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Author"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-full flex-shrink-0 bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Are you sure you want to delete author &ldquo;{deleteTarget?.name}&rdquo;?
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                This action will permanently delete the author&apos;s editorial profile.
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          {/* If the author has articles, offer safe story reassignment */}
          {deleteTarget && (deleteTarget.articleCount ?? 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-800 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  {deleteTarget.articleCount} {deleteTarget.articleCount === 1 ? 'story is' : 'stories are'} attributed to this author.
                </span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                To prevent orphaned articles, select another active author to reassign these stories to before deletion:
              </p>

              {otherAuthorsForReassign.length > 0 ? (
                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 uppercase tracking-wider mb-1">
                    Reassign stories to:
                  </label>
                  <div className="relative">
                    <select
                      value={reassignAuthorId}
                      onChange={(e) => setReassignAuthorId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
                    >
                      {otherAuthorsForReassign.map((auth) => (
                        <option key={auth._id} value={auth._id}>
                          {auth.name} ({auth.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-600 font-medium">
                  No other active authors available. Please create a replacement author first before deleting this author.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={
                isDeleting ||
                Boolean(deleteTarget && (deleteTarget.articleCount ?? 0) > 0 && !reassignAuthorId)
              }
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center space-x-2"
            >
              {isDeleting && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <span>
                {(deleteTarget?.articleCount ?? 0) > 0
                  ? 'Reassign & Delete Author'
                  : 'Delete Author'}
              </span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
