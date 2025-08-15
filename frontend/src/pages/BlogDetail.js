import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogService } from '../services/blogService';
import { Clock, User, Tag, Heart, MessageCircle, BookmarkPlus, Bookmark, ArrowLeft, Lock, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const fetchBlogDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlog(id);
      setBlog(response.blog);
      setLikesCount(response.blog.likes_count || 0);
      
      // Set user interaction states if user is logged in
      if (isAuthenticated && response.blog) {
        setIsLiked(response.blog.isLiked || false);
        setIsSaved(response.blog.isSaved || false);
      }
    } catch (error) {
      toast.error('Failed to fetch blog details');
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await blogService.getComments(id);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Don't show error toast for comments as they're not critical
    }
  }, [id]);

  const fetchUserActions = useCallback(async () => {
    try {
      // Fetch user's like status for this blog
      const likesResponse = await blogService.getLikes(id);
      setIsLiked(likesResponse.isLiked);
      
      // Check if user has saved this blog (we need to add this method)
      // For now, we'll implement it in the getBlog response
    } catch (error) {
      console.error('Error fetching user actions:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchBlogDetail();
    fetchComments();
    if (isAuthenticated) {
      fetchUserActions();
    }
  }, [fetchBlogDetail, fetchComments, fetchUserActions, isAuthenticated]);

  const canViewContent = () => {
    if (!blog?.is_premium) return true;
    if (!isAuthenticated) return false;
    return user?.subscription_status === 'active' || user?.role === 'admin';
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await blogService.toggleLike(id);
      setIsLiked(response.liked);
      setLikesCount(response.likesCount);
      toast.success(response.liked ? 'Liked!' : 'Removed like');
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save posts');
      return;
    }

    try {
      const response = await blogService.toggleSave(id);
      setIsSaved(response.saved);
      toast.success(response.saved ? 'Saved to your collection' : 'Removed from saved');
    } catch (error) {
      toast.error('Failed to update save status');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setCommentLoading(true);
      await blogService.addComment(id, newComment);
      setNewComment('');
      await fetchComments(); // Refresh comments list
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog not found</h2>
          <Link to="/blogs" className="text-blue-600 hover:text-blue-500">
            Back to all blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Blog Header */}
        <header className="mb-8">
          {/* Category and Premium Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Tag className="h-3 w-3 mr-1" />
              {blog.category}
            </span>
            {blog.is_premium && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {blog.author_name}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {formatDate(blog.publish_date)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`inline-flex items-center px-4 py-2 rounded-lg border transition-colors ${
                isLiked
                  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </button>

            <button
              onClick={handleSave}
              className={`inline-flex items-center px-4 py-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              {isSaved ? (
                <Bookmark className="h-4 w-4 mr-2" />
              ) : (
                <BookmarkPlus className="h-4 w-4 mr-2" />
              )}
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </header>

        {/* Blog Image */}
        {blog.image_url && (
          <div className="mb-8">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-xl"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          {canViewContent() ? (
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br>') }} />
            </div>
          ) : (
            <div className="text-center py-12">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Premium Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This is premium content. Subscribe to read the full article.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {blog.excerpt}
                  </p>
                </div>
                <Link
                  to="/subscribe"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  Subscribe Now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleComment} className="mb-8">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Write your comment..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {commentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  <Link to="/login" className="text-blue-600 hover:text-blue-500">
                    Login
                  </Link>{' '}
                  to join the discussion
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {comment.user_name}
                      </span>
                    </div>
                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default BlogDetail;
