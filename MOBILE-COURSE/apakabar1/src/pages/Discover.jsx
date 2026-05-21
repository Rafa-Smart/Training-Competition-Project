import { useState, useEffect, useRef, useCallback } from "react";
import { getPosts, getCategories } from "../api/api.js";
import ArticleCard from "../components/ArticleCard";
import useBookmarks from "../hooks/useBookmark.js";
import useDebounce from "../hooks/useDebounce";
export default function Discover({ onArticleClick }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState([]); // ← array, bukan string tunggal
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toggle, isBookmarked } = useBookmarks();
  const debouncedQ = useDebounce(query, 700);
  const observerRef = useRef();

  // Toggle satu kategori: kalau sudah ada → hapus, kalau belum → tambah
  const toggleCat = slug => {
    setActiveCats(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  // Reset tiap filter berubah
  const catParam = activeCats.length ? activeCats.join(",") : undefined;

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQ, catParam]);

  // Fetch
  useEffect(() => {
    if (!hasMore) return;
    setLoading(true);
    getPosts({ page, per_page: 10, search: debouncedQ, category: catParam })
      .then(r => {
        const data = r.data || [];
        setPosts(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore((r.meta?.current_page || 1) < (r.meta?.last_page || 1));
      })
      .finally(() => setLoading(false));
  }, [page, debouncedQ, catParam]);

  // Infinite scroll
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
        {/* Tombol "All" — aktif kalau tidak ada kategori yang dipilih */}
        <button
          className={`cat-btn ${activeCats.length === 0 ? "active" : ""}`}
          onClick={() => setActiveCats([])}
        >All</button>

        {/* Setiap kategori bisa dipilih/batal secara independen */}
        {categories.map(c => (
          <button
            key={c.slug}
            className={`cat-btn ${activeCats.includes(c.slug) ? "active" : ""}`}
            onClick={() => toggleCat(c.slug)}
          >{c.name}</button>
        ))}
      </div>

      {/* Label kategori yang aktif */}
      {activeCats.length > 0 && (
        <p className="active-filter-label">
          Filter: {activeCats.join(", ")}
          <button className="clear-filter" onClick={() => setActiveCats([])}>✕ Clear</button>
        </p>
      )}

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



  // atau kalo mau pake addeventlistener bisa juga pake ini
  // Ganti useCallback observe dan observerRef dengan ini:
// useEffect(() => {
//   const main = document.querySelector("main"); // scroll container kita
  
//   const handleScroll = () => {
//     // Jarak dari bawah scroll container ke posisi scroll sekarang
//     const distanceFromBottom = main.scrollHeight - main.scrollTop - main.clientHeight;
    
//     // Kalau jarak < 300px dan masih ada data, naikkan page
//     if (distanceFromBottom < 300 && hasMore && !loading) {
//       setPage(p => p + 1);
//     }
//   };
  
//   main.addEventListener("scroll", handleScroll);
//   return () => main.removeEventListener("scroll", handleScroll); // cleanup!
// }, [hasMore, loading]); // re-register saat nilai ini berubah