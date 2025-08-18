import { useState, useEffect } from 'react';

const useVisitorCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateVisitorCount = () => {
      try {
        // Get or create visitor count from localStorage
        let visitorCount = localStorage.getItem('blog360_visitor_count');
        const lastVisit = localStorage.getItem('blog360_last_visit');
        const sessionId = localStorage.getItem('blog360_session_id');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (!visitorCount) {
          // First time visitor - initialize with a realistic base count
          visitorCount = Math.floor(Math.random() * 8000) + 12000; // Random base count between 12,000-20,000
          localStorage.setItem('blog360_visitor_count', visitorCount.toString());
          localStorage.setItem('blog360_last_visit', now.toString());
          localStorage.setItem('blog360_session_id', generateSessionId());
        } else {
          // Check if this is a new session (more than 1 hour since last visit)
          if (!lastVisit || (now - parseInt(lastVisit)) > oneHour) {
            // Increment count for new session
            const increment = Math.floor(Math.random() * 3) + 1; // Random increment 1-3 to simulate other visitors
            visitorCount = parseInt(visitorCount) + increment;
            localStorage.setItem('blog360_visitor_count', visitorCount.toString());
            localStorage.setItem('blog360_last_visit', now.toString());
            
            // Update session ID for new session
            if (!sessionId || (now - parseInt(lastVisit)) > oneHour) {
              localStorage.setItem('blog360_session_id', generateSessionId());
            }
          }
        }
        
        setCount(parseInt(visitorCount));
        setLoading(false);
      } catch (error) {
        console.error('Error updating visitor count:', error);
        // Fallback to a default count
        setCount(15247);
        setLoading(false);
      }
    };

    const generateSessionId = () => {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    // Small delay to make the loading state visible
    const timer = setTimeout(updateVisitorCount, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const formatCount = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return {
    count,
    formattedCount: formatCount(count),
    loading
  };
};

export default useVisitorCount;
