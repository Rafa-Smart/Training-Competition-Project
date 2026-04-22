import React, { useEffect, useRef } from 'react';

const InfiniteScroll = ({ onLoadMore, hasMore, loading, children }) => {
  const observerRef = useRef();
  const sentinelRef = useRef();

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const handleIntersection = (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <>
      {children}
      <div ref={sentinelRef} className="h-10 flex items-center justify-center">
        {loading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        )}
      </div>
    </>
  );
};

export default InfiniteScroll;