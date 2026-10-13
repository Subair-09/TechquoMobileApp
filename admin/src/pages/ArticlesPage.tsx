import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { articleApi, categoryApi } from '../services/api.js';
import { Article, Category } from '../types/index.js';
import { Badge } from '../components/Badge.js';
import { ConfirmModal } from '../components/ConfirmModal.js';

export const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await articleApi.getAdminArticles({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: selectedCategory || undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setArticles(res.data);
        setTotalPages(res.pagination.pages || 1);
        setTotalCount(res.pagination.total || 0);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [page, statusFilter, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      if (article.status === 'published') {
        await articleApi.unpublishArticle(article._id);
      } else {
        await articleApi.publishArticle(article._id);
      }
      fetchArticles();
    } catch (err) {
      console.error('Failed to update article status:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await articleApi.deleteArticle(deleteTarget._id);
      setDeleteTarget(null);
      fetchArticles();
    } catch (err) {
      console.error('Failed to delete article:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Article Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Create, edit, review, and publish stories across TechQuo News
          </p>
        </div>

        <Link
          to="/articles/new"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#050505] hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl border border-neutral-200/90 p-4 shadow-2xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs border-b border-neutral-100">
          {['all', 'published', 'draft', 'scheduled', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, slug, or content..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </form>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-xs text-neutral-600">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <span>Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-neutral-100">
              <tr>
                <th className="py-3 px-5">Article</th>
                <th className="py-3 px-4 hidden md:table-cell">Category</th>
                <th className="py-3 px-4 hidden lg:table-cell">Author</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">Views</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                    <div className="inline-block w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-2"></div>
                    <p>Loading articles...</p>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
                  const catName =
                    typeof art.categoryId === 'object' && art.categoryId
                      ? art.categoryId.name
                      : 'General';
                  const authorName =
                    typeof art.authorId === 'object' && art.authorId
                      ? art.authorId.name
                      : 'TechQuo';

                  return (
                    <tr key={art._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3 max-w-lg">
                          <img
                            src={
                              art.coverImage ||
                              'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200'
                            }
                            alt={art.title}
                            className="w-14 h-11 rounded-md object-cover flex-shrink-0 bg-neutral-100 border border-neutral-200"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/articles/${art._id}/edit`}
                              className="font-semibold text-neutral-900 hover:text-blue-600 truncate block text-sm"
                            >
                              {art.title}
                            </Link>
                            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                              {art.excerpt}
                            </p>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              /{art.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                          {catName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-neutral-600">
                        {authorName}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={art.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right hidden sm:table-cell font-mono text-xs text-neutral-600">
                        <span className="inline-flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{(art.views ?? art.viewsCount ?? 0).toLocaleString()}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Publish/Unpublish toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(art)}
                            className={`p-1.5 rounded-md transition-colors ${
                              art.status === 'published'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900'
                            }`}
                            title={art.status === 'published' ? 'Unpublish' : 'Publish story'}
                          >
                            {art.status === 'published' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit button */}
                          <Link
                            to={`/articles/${art._id}/edit`}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            title="Edit story"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(art)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete story"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Showing {articles.length} of {totalCount} total stories
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action will permanently remove the story and cannot be undone.`}
        confirmLabel="Delete Article"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
