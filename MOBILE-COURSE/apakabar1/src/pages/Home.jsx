import { useState, useEffect } from "react";
import { getPosts } from "../api/api.js";
import ArticleCard from "../components/ArticleCard";
import useBookmarks from "../hooks/useBookmark.js";

const PREF_KEY = "apakabar_prefs";

export default function Home({ onArticleClick }) {
  const [breaking, setBreaking] = useState([]);
  const [recs, setRecs] = useState([]);
  const { toggle, isBookmarked } = useBookmarks();
  const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "[]");

  useEffect(() => {
    getPosts({ per_page: 5, order_by: "latest" }).then(r => setBreaking(r.data || []));
    const catParam = prefs.length ? prefs.join(",") : undefined;
    getPosts({ per_page: 10, order_by: "latest", category: catParam }).then(r => setRecs(r.data || []));
  }, []);

  return (
    <div className="page">
      {/* Breaking News */}
      <section>
        <h2 className="section-title">🔴 Breaking News</h2>
        <div className="breaking-scroll">
          {breaking.map(a => (
            <div className="breaking-card" key={a.slug} onClick={() => onArticleClick(a.slug)}>
              {a.thumbnail && <img src={a.thumbnail} alt={a.title} />}
              <div className="breaking-overlay">
                {a.category && <span className="card-cat">{a.category.name}</span>}
                <p>{a.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="section-title">📌 For You</h2>
        {recs.map(a => (
          <ArticleCard key={a.slug} article={a} onClick={onArticleClick}
            onBookmark={toggle} isBookmarked={isBookmarked(a.slug)} />
        ))}
      </section>
    </div>
  );
}