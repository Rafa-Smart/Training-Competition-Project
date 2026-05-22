import ArticleCard from "../components/ArticleCard";
import useBookmark from "../hooks/useBookmark"

const Bookmark =({onArticleClick}) => {
    const [bookmarks, toggle, isBookmark] = useBookmark();
    if(bookmarks.length <= 0){
        return <div className="page empty">
            <span>🔖</span>
            <p>ga ada bookmarknya cuy</p>
        </div>
    }
    return <div className="page">
        {bookmarks.map((article) => {
            <ArticleCard key={article.slug} article={article} isBookmarked={() => isBookmark(article.slug)} onBookmark={toggle}></ArticleCard>
        })}
    </div>
}
export default Bookmark