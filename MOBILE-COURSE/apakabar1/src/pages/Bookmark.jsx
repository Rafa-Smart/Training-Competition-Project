import useBookmarks from "../hooks/useBookmark.js";
import ArticleCard from "../components/ArticleCard";

export default function Bookmark({ onArticleClick }) {
  const { bookmarks, toggle, isBookmarked } = useBookmarks();

  if (!bookmarks.length) return (
    <div className="page empty">
      <span>🔖</span>
      <p>No bookmarks yet</p>
    </div>
  );

  return (
    <div className="page">
      {bookmarks.map(a => (
        <ArticleCard key={a.slug} article={a} onClick={onArticleClick}
          onBookmark={toggle} isBookmarked={isBookmarked(a.slug)} />
      ))}
    </div>
  );
}