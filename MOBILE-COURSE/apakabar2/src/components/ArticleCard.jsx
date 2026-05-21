export default ArticleCard = ({article, onClickBookmark, onBookmark, isBookmarked}) => {
    const date =  new Date(article.published_at).toLocaleDateString('id-ID',{
        month:'short',
        day:'numeric',
        year:"numeric"
    });
    return (
        <article className="card" onClick={() =>onClickBookmark(article.slug)}> 
        {article && <img className="card-img" src={article.thumbnail} loading="lazy" alt={title}></img>}
        <div className="card-body">
            <h2 className="card-title">{article.title}</h2>
            <div className="card-meta">
                <span>{article?.author.name} . {date}</span>
                <button 
                className={`btn-bookmark `}
                onClick={(e) => {
                    e.preventDefault();
                    onBookmark(article)
                }}
                >
                    {isBookmarked ?'📕' :'🧾'}
                </button>
            </div>
        </div>
        </article>
    )
}