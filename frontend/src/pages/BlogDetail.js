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
      <div className="min-h-screen bg-cream dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 border-2 border-black dark:border-dark-border mb-4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 border-2 border-black dark:border-dark-border mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 border-2 border-black dark:border-dark-border"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 border-2 border-black dark:border-dark-border"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 border-2 border-black dark:border-dark-border w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center brutal-card p-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Blog not found</h2>
          <Link to="/blogs" className="brutal-button-primary">
            Back to all blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center brutal-button-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Blog Header */}
        <header className="mb-8">
          {/* Category and Premium Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 border-2 border-black dark:border-dark-border text-sm font-medium bg-primary-500 text-white">
              <Tag className="h-3 w-3 mr-1" />
              {blog.category}
            </span>
            {blog.is_premium && (
              <span className="inline-flex items-center px-3 py-1 border-2 border-black dark:border-dark-border text-sm font-medium bg-accent-500 text-white">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4 border-b-2 border-black dark:border-dark-border pb-2">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 mb-6">
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
              className={`inline-flex items-center px-4 py-2 border-2 border-black dark:border-dark-border transition-colors font-medium ${
                isLiked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </button>

            <button
              onClick={handleSave}
              className={`inline-flex items-center px-4 py-2 border-2 border-black dark:border-dark-border transition-colors font-medium ${
                isSaved
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              className="inline-flex items-center px-4 py-2 border-2 border-black dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-dark-card font-medium"
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
              className="w-full h-64 object-cover border-2 border-black dark:border-dark-border"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="brutal-card p-8 mb-8">
          {canViewContent() ? (
            <div className="prose dark:prose-invert max-w-none blog-content">
              <div dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br>') }} />
            </div>
          ) : (
            <div className="text-center py-12">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-black dark:text-white mb-2">
                Premium Content
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                This is premium content. Subscribe to read the full article.
              </p>
              <div className="space-y-4">
                <div className="bg-cream dark:bg-dark-card p-4 border-2 border-black dark:border-dark-border">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {blog.excerpt}
                  </p>
                </div>
                <Link
                  to="/subscribe"
                  className="inline-flex items-center brutal-button bg-accent-500 hover:bg-accent-600 text-white"
                >
                  Subscribe Now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="brutal-card p-8">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-6 border-b-2 border-black dark:border-dark-border pb-2">
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
                    className="brutal-input"
                    placeholder="Write your comment..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="brutal-button-primary disabled:opacity-50"
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
              <div className="mb-8 p-4 bg-cream dark:bg-dark-card border-2 border-black dark:border-dark-border text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                    Login
                  </Link>{' '}
                  to join the discussion
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b-2 border-black dark:border-dark-border pb-6">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 border-2 border-black dark:border-dark-border bg-primary-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="ml-2 font-medium text-black dark:text-white">
                        {comment.user_name}
                      </span>
                    </div>
                    <span className="ml-auto text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 bg-cream dark:bg-dark-card border-2 border-black dark:border-dark-border">
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default BlogDetail;
