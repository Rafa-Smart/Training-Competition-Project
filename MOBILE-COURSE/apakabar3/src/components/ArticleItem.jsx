const ArticleItem = ({article, onClickItem, obBookmark, isBookmark}) => {
    const date = new Date(article.published_at).toLocaleDateString('id-ID', {
        month:'short',
        day:'numeric',
        year:'numeric'
    })
    return <div className='article-item' onclick={onClickItem}>
        {article?.thumbnail && <img src={article.thumbnail} loading='lazy'></img>}
        {article && <div className='article-detail'>
        {article?.category && <span >{article?.category.name}</span>}
        <h2>{article?.title}</h2>
        <div className='article-meta'>
            <span >{article?.author.name} - {date}</span>
            {onBookmark && <button className={`btn-bookmark ${isBookmark?'active':''}`} onclick={(e) => {
                e.stopPropagation();
                onBookmark(article)
            }}>{isBookmark ? '🔖':"🔍"}</button>}
        </div>
        </div>}
    </div>
}

export default ArticleItem;