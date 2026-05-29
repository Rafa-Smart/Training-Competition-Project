import ArticleItem from "../components/ArticleItem";
import useBookmarks from "../hooks/useBookmarks";

const Bookmark = ({onClickArticle}) => {
    const [bookmarks, toggle, isBookmark] = useBookmarks()
    console.log({bookmarks})
    return <div className='page'>
        {
            bookmarks.length > 0 ? <div className='article-scroll-vertical'>
                {
                    bookmarks.map((article, index) => {
                        return <ArticleItem article={article} isBookmark={isBookmark} onBookmark={toggle} onClickItem={onClickArticle} key={index}></ArticleItem>
                    })
                }
            </div> : <h2>bookmark masih kosong</h2>
        }
    </div>
}

export default Bookmark;