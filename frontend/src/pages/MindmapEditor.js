import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import InteractiveMindmap from '../components/InteractiveMindmap';
import mindmapService from '../services/mindmapService';
import { blogService } from '../services/blogService';
import { Map, ArrowLeft, Save, Trash2, Share2 } from 'lucide-react';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';

const MindmapEditor = () => {
  const { id, blogId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mindmap, setMindmap] = useState(null);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load existing mindmap
        if (id) {
          const mindmapData = await mindmapService.getById(id);
          setMindmap(mindmapData);
          setTitle(mindmapData.title || '');
          setDescription(mindmapData.description || '');

          // Load associated blog if exists
          if (mindmapData.blog_id) {
            const blogResponse = await blogService.getBlog(mindmapData.blog_id);
            setBlog(blogResponse.blog || blogResponse);
          }
        }
        // Load mindmap by blog ID
        else if (blogId) {
          let existingMindmap = null;
          try {
            const mindmapData = await mindmapService.getByBlogId(blogId);
            setMindmap(mindmapData);
            setTitle(mindmapData.title || '');
            setDescription(mindmapData.description || '');
            existingMindmap = mindmapData;
          } catch (error) {
            // No mindmap exists for this blog yet
            console.log('No mindmap found for blog, creating new one');
          }

          // Load blog data
          const blogResponse = await blogService.getBlog(blogId);
          const blogData = blogResponse.blog || blogResponse;
          setBlog(blogData);
          
          // Set default title if creating new mindmap and no title is set
          if (!existingMindmap && blogData) {
            setTitle(`${blogData.title} - Mindmap`);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setAlert({
          show: true,
          message: 'Error loading mindmap data',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, blogId]);

  const handleSave = async (mindmapData) => {
    if (!title.trim()) {
      setAlert({
        show: true,
        message: 'Please enter a title for the mindmap',
        type: 'error'
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        data: mindmapData,
        blog_id: blogId || mindmap?.blog_id || null
      };

      let result;
      if (mindmap?.id) {
        // Update existing mindmap
        result = await mindmapService.update(mindmap.id, payload);
      } else {
        // Create new mindmap
        result = await mindmapService.create(payload);
      }

      setMindmap(result);
      setAlert({
        show: true,
        message: 'Mindmap saved successfully!',
        type: 'success'
      });

      // Navigate to the saved mindmap if it was a new creation
      if (!mindmap?.id && result.id) {
        navigate(`/mindmap/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving mindmap:', error);
      setAlert({
        show: true,
        message: 'Error saving mindmap. Please try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!mindmap?.id) return;

    if (window.confirm('Are you sure you want to delete this mindmap? This action cannot be undone.')) {
      try {
        await mindmapService.delete(mindmap.id);
        setAlert({
          show: true,
          message: 'Mindmap deleted successfully',
          type: 'success'
        });
        
        // Navigate back after short delay
        setTimeout(() => {
          if (blog) {
            navigate(`/blog/${blog.id}`);
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      } catch (error) {
        console.error('Error deleting mindmap:', error);
        setAlert({
          show: true,
          message: 'Error deleting mindmap',
          type: 'error'
        });
      }
    }
  };

  const handleShare = async () => {
    if (mindmap?.id) {
      const url = `${window.location.origin}/mindmap/view/${mindmap.id}`;
      try {
        await navigator.clipboard.writeText(url);
        setAlert({
          show: true,
          message: 'Mindmap link copied to clipboard!',
          type: 'success'
        });
      } catch (error) {
        // Fallback for browsers that don't support clipboard API
        prompt('Copy this link to share the mindmap:', url);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert
            type="error"
            message="Access denied. Only administrators can create and edit mindmaps."
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Map className="text-blue-600" size={24} />
                <h1 className="text-2xl font-bold text-gray-900">
                  {mindmap?.id ? 'Edit Mindmap' : 'Create Mindmap'}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {mindmap?.id && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
              )}
              {mindmap?.id && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Associated Blog Info */}
          {blog && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Associated Blog Post:</strong> {blog.title}
              </p>
            </div>
          )}

          {/* Alert */}
          {alert.show && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ show: false, message: '', type: 'success' })}
            />
          )}

          {/* Mindmap Details Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Mindmap Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mindmap title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description (optional)..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Mindmap */}
        <InteractiveMindmap
          mindmapData={mindmap}
          onSave={handleSave}
          onDelete={handleDelete}
          readOnly={false}
          blogId={blogId}
        />

        {/* Save Button - Mobile Friendly */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              // Trigger save with current mindmap data
              const mindmapComponent = document.querySelector('canvas');
              if (mindmapComponent) {
                handleSave({
                  nodes: [],
                  connections: [],
                  metadata: { saved: new Date().toISOString() }
                });
              }
            }}
            disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors text-lg font-medium"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Mindmap'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default MindmapEditor;
