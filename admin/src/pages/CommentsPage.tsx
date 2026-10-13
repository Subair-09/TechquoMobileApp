import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  Trash2,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { commentApi } from '../services/api.js';
import { Comment, CommentStatus } from '../types/index.js';
import { Badge } from '../components/Badge.js';
import { ConfirmModal } from '../components/ConfirmModal.js';

export const CommentsPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | CommentStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await commentApi.getComments({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      if (res.success) {
        setComments(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      setError('Failed to fetch comments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      await commentApi.approveComment(id);
      setComments((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: 'approved' } : c))
      );
      showFeedback('Comment approved successfully. It is now published live.');
      fetchComments();
    } catch (err: any) {
      console.error('Failed to approve comment:', err);
      showFeedback(err?.response?.data?.message || 'Failed to approve comment.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await commentApi.rejectComment(id);
      setComments((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: 'rejected' } : c))
      );
      showFeedback('Comment rejected. It is hidden from public view.');
      fetchComments();
    } catch (err: any) {
      console.error('Failed to reject comment:', err);
      showFeedback(err?.response?.data?.message || 'Failed to reject comment.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await commentApi.deleteComment(deleteTarget._id);
      setDeleteTarget(null);
      showFeedback('Comment deleted permanently.');
      fetchComments();
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      showFeedback(err?.response?.data?.message || 'Failed to delete comment.', 'error');
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
            Comments Moderation
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Review community commentary, approve discussions, and flag inappropriate content
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-neutral-400 hover:text-neutral-700 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200/90 p-3 shadow-2xs flex items-center space-x-1">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs capitalize font-medium transition-all ${
              statusFilter === tab
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              Loading comments...
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            No comments found in this queue.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {comments.map((comm) => {
              const articleTitle =
                typeof comm.articleId === 'object' && comm.articleId
                  ? comm.articleId.title
                  : 'Article Discussion';

              return (
                <div
                  key={comm._id}
                  className="p-5 hover:bg-neutral-50/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-neutral-900 text-sm">
                        {comm.authorName}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        ({comm.authorEmail})
                      </span>
                      <Badge status={comm.status} />
                    </div>

                    <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-neutral-200/60 leading-relaxed font-sans">
                      "{comm.content || (comm as any).body}"
                    </p>

                    <div className="flex items-center space-x-2 text-xs text-neutral-500">
                      <span>On article:</span>
                      <span className="font-medium text-neutral-800 truncate">
                        {articleTitle}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-start flex-shrink-0">
                    {comm.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(comm._id)}
                        disabled={actionLoadingId === comm._id}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
                        title="Approve comment"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{actionLoadingId === comm._id ? 'Approving...' : 'Approve'}</span>
                      </button>
                    )}

                    {comm.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(comm._id)}
                        disabled={actionLoadingId === comm._id}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
                        title="Reject comment"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{actionLoadingId === comm._id ? 'Rejecting...' : 'Reject'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteTarget(comm)}
                      disabled={actionLoadingId === comm._id}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 rounded-lg transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to permanently delete this comment?"
        confirmLabel="Delete Comment"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
