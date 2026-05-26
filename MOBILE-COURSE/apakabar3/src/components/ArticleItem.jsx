const ArticleItem = ({article, onClickItem, onBookmark, isBookmark}) => {
    console.log({article})
    const date = new Date(article.published_at).toLocaleDateString('id-ID', {
        month:'short',
        day:'numeric',
        year:'numeric'
    })
    // console.log({article})
    return <div className='article-item' onClick={() => onClickItem(article.slug)}>
        {article?.thumbnail && <img src={article.thumbnail} loading='lazy' className="article-img"></img>}
        {article && <div className='article-detail'>
        <div className='article-meta'>
            {article?.category && <span className='article-category'>{article?.category.name}</span>} {onBookmark && <button className={`btn-bookmark ${isBookmark?'active':''}`} onClick={(e) => {
                e.stopPropagation();
                onBookmark(article)
            }}>{isBookmark ? '🔖':"🔍"}</button>}   
        </div>
        <p className='article-title'>{article?.title}</p>
         
            <span className="article-name">{article?.author_name} - {date}</span>

        </div>}
    </div>
}

export default ArticleItem;