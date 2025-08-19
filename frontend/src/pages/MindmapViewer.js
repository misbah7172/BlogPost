import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import InteractiveMindmap from '../components/InteractiveMindmap';
import mindmapService from '../services/mindmapService';
import { blogService } from '../services/blogService';
import { Map, ArrowLeft, Edit3, ExternalLink } from 'lucide-react';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';

const MindmapViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mindmap, setMindmap] = useState(null);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load mindmap
        const mindmapData = await mindmapService.getById(id);
        setMindmap(mindmapData);

        // Load associated blog if exists
        if (mindmapData.blog_id) {
          try {
            const blogResponse = await blogService.getBlog(mindmapData.blog_id);
            setBlog(blogResponse.blog || blogResponse);
          } catch (error) {
            console.log('Associated blog not found or not accessible');
          }
        }
      } catch (error) {
        console.error('Error loading mindmap:', error);
        setAlert({
          show: true,
          message: 'Mindmap not found or access denied',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (!mindmap) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert
            type="error"
            message="Mindmap not found or you don't have permission to view it."
          />
          <div className="mt-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mindmap.title}
                  </h1>
                  {mindmap.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {mindmap.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Edit button for admin */}
              {isAdmin && (
                <button
                  onClick={() => navigate(`/mindmap/edit/${mindmap.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              )}

              {/* View associated blog button */}
              {blog && (
                <button
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <ExternalLink size={16} />
                  View Blog Post
                </button>
              )}
            </div>
          </div>

          {/* Associated Blog Info */}
          {blog && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Related Blog Post:</strong> {blog.title}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This mindmap is associated with the blog post "{blog.title}". 
                Click "View Blog Post" to read the full article.
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

          {/* Mindmap Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-gray-600">
                  {new Date(mindmap.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <p className="text-gray-600">
                  {new Date(mindmap.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Author:</span>
                <p className="text-gray-600">
                  {mindmap.author_name || 'Blog Admin'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <p className="text-gray-600">
                  {blog ? 'Blog Mindmap' : 'Standalone Mindmap'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Read-only Interactive Mindmap */}
        <InteractiveMindmap
          mindmapData={mindmap}
          onSave={null}
          onDelete={null}
          readOnly={true}
          blogId={mindmap.blog_id}
        />

        {/* Instructions for viewers */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">How to Use This Mindmap</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use your mouse wheel to zoom in and out</li>
            <li>• Drag the canvas to pan around and explore different areas</li>
            <li>• Click on nodes to view their details</li>
            <li>• This is a read-only view - editing requires admin access</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          {blog && (
            <button
              onClick={() => navigate(`/blog/${blog.id}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink size={20} />
              Read Full Blog Post
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MindmapViewer;
