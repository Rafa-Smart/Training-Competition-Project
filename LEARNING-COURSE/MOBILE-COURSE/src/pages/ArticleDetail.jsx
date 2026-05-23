import { useState, useEffect } from "react";
import { getPost, getPosts } from "../api/api.js";
import ArticleCard from "../components/ArticleCard";
import useBookmarks from "../hooks/useBookmark.js";

export default function ArticleDetail({ slug, onArticleClick }) {
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const { toggle, isBookmarked } = useBookmarks();

  useEffect(() => {
    setPost(null);
    getPost(slug).then(r => {
      const data = r.data;
      setPost(data);
      if (data?.category?.slug) {
        getPosts({ category: data.category.slug, per_page: 10 }).then(res => {
          setRelated((res.data || []).filter(a => a.slug !== slug).slice(0, 3));
        });
      }
    });
  }, [slug]);

  if (!post) return <div className="page"><span className="loader center" /></div>;

  const date = new Date(post.published_at).toLocaleDateString("id-ID", { dateStyle: "long" });

  return (
    <div className="page article">
      {post.thumbnail && <img className="article-img" src={post.thumbnail} alt={post.title} />}
      <div className="article-body">
        {post.category && <span className="card-cat">{post.category.name}</span>}
        <h1 className="article-title">{post.title}</h1>
        <div className="article-meta">
          <span>{post.author?.name}</span>
          <span>{date}</span>
          <span>👁 {post.visited_count?.toLocaleString()}</span>  
        </div>

        <button className={`bm-full ${isBookmarked(slug) ? "bm-active" : ""}`}
          onClick={() => toggle(post)} aria-label="Bookmark">
          {isBookmarked(slug) ? "🔖 Bookmarked" : "＋ Bookmark"}
        </button>

        <div className="article-content" dangerouslySetInnerHTML={{ __html: post.body }} />

        {post.tags?.length > 0 && (
          <div className="tags">
            {post.tags.map(t => <span key={t.name} className="tag">#{t.name}</span>)}
          </div>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="section-title">Related</h2>
            {related.map(a => (
              <ArticleCard key={a.slug} article={a} onClick={onArticleClick}
                onBookmark={toggle} isBookmarked={isBookmarked(a.slug)} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}