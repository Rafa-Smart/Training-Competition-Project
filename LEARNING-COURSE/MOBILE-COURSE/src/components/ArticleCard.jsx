export default function ArticleCard({ article, onClick, onBookmark, isBookmarked }) {
  const { title, thumbnail, category, published_at, author } = article;
  const date = new Date(published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); 

  return (
    <article className="card" onClick={() => onClick(article.slug)} role="button" tabIndex={0}>
      {thumbnail && <img className="card-img" src={thumbnail} alt={title} loading="lazy" />}
      <div className="card-body">
        {category && <span className="card-cat">{category.name}</span>}
        <h2 className="card-title">{title}</h2>
        <div className="card-meta">
          <span>{author?.name} · {date}</span>
          {onBookmark && (
            <button className={`bm-btn ${isBookmarked ? "bm-active" : ""}`}
              onClick={e => { e.stopPropagation(); onBookmark(article); }}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}