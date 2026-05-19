import { useState, useEffect, useRef, useCallback } from "react";
import { getPosts, getCategories } from "../api/api.js";
import ArticleCard from "../components/ArticleCard";
import useBookmarks from "../hooks/useBookmark.js";
import useDebounce from "../hooks/useDebounce";

export default function Discover({ onArticleClick }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toggle, isBookmarked } = useBookmarks();
  const debouncedQ = useDebounce(query, 700);
  const observerRef = useRef();
  const sentinelRef = useRef();

  // Reset on filter change
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQ, activeCat]);

  // Fetch page
  useEffect(() => {
    if (!hasMore) return;
    setLoading(true);
    getPosts({ page, per_page: 10, search: debouncedQ, category: activeCat })
      .then(r => {
        const data = r.data || [];
        setPosts(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore((r.meta?.current_page || 1) < (r.meta?.last_page || 1));
      })
      .finally(() => setLoading(false));
  }, [page, debouncedQ, activeCat]);

  // Infinite scroll observer
  const observe = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) setPage(p => p + 1);
    }, { rootMargin: "200px" });
    if (node) observerRef.current.observe(node);
  }, [hasMore, loading]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data || []));
  }, []);

  return (
    <div className="page">
      <input className="search-input" type="search" placeholder="Search articles..."
        value={query} onChange={e => setQuery(e.target.value)} aria-label="Search" />

      <div className="cat-filter">
        <button className={`cat-btn ${activeCat === "" ? "active" : ""}`} onClick={() => setActiveCat("")}>All</button>
        {categories.map(c => (
          <button key={c.slug} className={`cat-btn ${activeCat === c.slug ? "active" : ""}`}
            onClick={() => setActiveCat(c.slug)}>{c.name}</button>
        ))}
      </div>

      {posts.map(a => (
        <ArticleCard key={a.slug} article={a} onClick={onArticleClick}
          onBookmark={toggle} isBookmarked={isBookmarked(a.slug)} />
      ))}

      <div ref={observe} className="sentinel">
        {loading && <span className="loader" />}
        {!hasMore && posts.length > 0 && <p className="end-msg">All caught up ✓</p>}
      </div>
    </div>
  );
}