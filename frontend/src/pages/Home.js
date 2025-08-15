import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Star, Clock } from 'lucide-react';
import { blogService } from '../services/blogService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { LoadingCard } from '../components/ui/Loading';
import { formatDate, truncateText, calculateReadingTime } from '../utils/helpers';

const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [stats, setStats] = useState({ totalBlogs: 0, totalUsers: 0, premiumBlogs: 0 });
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured blogs (latest 6 blogs)
        const blogsResponse = await blogService.getBlogs({ limit: 6 });
        setFeaturedBlogs(blogsResponse.blogs || []);

        // You can fetch stats from admin API if available
        setStats({
          totalBlogs: 150,
          totalUsers: 1200,
          premiumBlogs: 45
        });
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Quality Content',
      description: 'Curated educational content covering programming, databases, and software development.'
    },
    {
      icon: Users,
      title: 'Expert Authors',
      description: 'Learn from industry professionals and experienced developers.'
    },
    {
      icon: Star,
      title: 'Premium Access',
      description: 'Get exclusive access to advanced tutorials and in-depth guides.'
    },
    {
      icon: Clock,
      title: 'Regular Updates',
      description: 'New content published regularly to keep you up-to-date with latest trends.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">
              Learn. Code. Grow.
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Your ultimate destination for educational content, programming tutorials, 
              and software development guidance. Join thousands of learners advancing their careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/blogs">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Explore Blogs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {!isAuthenticated ? (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                    Get Started Free
                  </Button>
                </Link>
              ) : (
                <Link to="/subscribe">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                    Upgrade to Premium
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 border-2 border-black dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-black dark:text-white mb-2">
                {stats.totalBlogs}+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Quality Articles
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500 border-2 border-black dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-black dark:text-white mb-2">
                {stats.totalUsers}+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Active Learners
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 border-2 border-black dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-black dark:text-white mb-2">
                {stats.premiumBlogs}+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Premium Tutorials
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-cream dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Why Choose EduBlog?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide comprehensive educational resources designed to help you 
              master programming and software development.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="brutal-card p-6 text-center card-hover">
                  <div className="w-12 h-12 bg-primary-500 border-2 border-black dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="py-16 bg-white dark:bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Latest Articles
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover our most recent educational content
              </p>
            </div>
            <Link to="/blogs">
              <Button variant="outline">
                View All Blogs
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <article key={blog.id} className="brutal-card card-hover">
                  {blog.image_url && (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-48 object-cover border-b-2 border-black dark:border-dark-border"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium border border-black dark:border-dark-border">
                        {blog.category}
                      </span>
                      {blog.is_premium && (
                        <span className="px-2 py-1 bg-accent-500 text-white text-xs font-medium border border-black dark:border-dark-border">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {truncateText(blog.excerpt || blog.content, 120)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{formatDate(blog.created_at)}</span>
                      <span>{calculateReadingTime(blog.content)} min read</span>
                    </div>
                    <Link to={`/blog/${blog.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Read More
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-shadow">
            Ready to Level Up Your Skills?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our premium community and get access to exclusive content, 
            advanced tutorials, and personalized learning paths.
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Start Learning Today
                </Button>
              </Link>
              <Link to="/subscribe">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-accent-600">
                  View Premium Plans
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/subscribe">
              <Button size="lg" variant="secondary">
                Upgrade to Premium
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
