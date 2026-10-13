import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, ArrowUpRight } from 'lucide-react';
import { Article } from '../types/index.js';
import { Badge } from './Badge.js';

interface RecentArticlesTableProps {
  articles: Article[];
}

export const RecentArticlesTable: React.FC<RecentArticlesTableProps> = ({ articles }) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Recent Articles</h3>
          <p className="text-xs text-neutral-500">Latest publications and drafts in review</p>
        </div>
        <Link
          to="/articles"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-neutral-900 hover:text-blue-600 transition-colors"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50/70 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-neutral-100">
            <tr>
              <th className="py-3 px-5">Story</th>
              <th className="py-3 px-4 hidden md:table-cell">Category</th>
              <th className="py-3 px-4 hidden sm:table-cell">Author</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Views</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                  No articles found. Start by creating a story!
                </td>
              </tr>
            ) : (
              articles.map((art) => {
                const categoryName =
                  typeof art.categoryId === 'object' && art.categoryId
                    ? art.categoryId.name
                    : 'Uncategorized';
                const authorName =
                  typeof art.authorId === 'object' && art.authorId
                    ? art.authorId.name
                    : 'Editor';

                return (
                  <tr key={art._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3 max-w-md">
                        <img
                          src={art.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200'}
                          alt={art.title}
                          className="w-12 h-10 rounded-md object-cover flex-shrink-0 bg-neutral-100 border border-neutral-200"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/articles/${art._id}/edit`}
                            className="font-medium text-neutral-900 hover:text-blue-600 truncate block text-sm"
                            title={art.title}
                          >
                            {art.title}
                          </Link>
                          <span className="text-[11px] text-neutral-400 font-mono block truncate">
                            /{art.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                        {categoryName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell text-neutral-600 text-xs">
                      {authorName}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={art.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-xs text-neutral-700">
                      <span className="inline-flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{(art.views ?? art.viewsCount ?? 0).toLocaleString()}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/articles/${art._id}/edit`}
                        className="inline-flex items-center p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                        title="Edit article"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
