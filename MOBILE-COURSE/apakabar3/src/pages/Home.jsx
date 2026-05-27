import { useEffect, useState } from "react";
import ArticleItem from "../components/ArticleItem";
import { api } from "../api/api";
import useBookmarks from "../hooks/useBookmarks";
const key = "apakabar_preferensi";
const Home = ({ onClickArticle }) => {
  const [recomendations, setRecomendations] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [bookmarks, toggle, isBookmark] = useBookmarks();
  const [loading, setLoading] = useState(false);
  const preferensi = JSON.parse(localStorage.getItem(key))||[];
  //   console.log(preferensi)
  useEffect(() => {
    setLoading(true);
    api
      .getPosts({
        per_page: 5,
        order_by: "latest",
      })
      .then((response) => setBreakingNews(response.data));

    Promise.all(
      preferensi.map((pref) => {
        return api
          .getPosts({ category: pref, ordey_by: "latest", per_page: 3 })
          .then((response) => {
            return response.data;
          });
      }),
    )
      .then((results) => setRecomendations(results.flat()))
      .finally(() => setLoading(false));
  }, []);
  //   console.log(preferensi)
  return (
    <div className="page-home hide-scrollbar">
      <section className="home-section h">
        <div className="home-heading">
          <h3>Breaking News</h3>
        </div>
        <div className="home-horizontal-scroll hide-scrollbar">
            {
                loading ? <span className='loading center'></span>: breakingNews.map((article) => {
                    return <div className='horizontal-item' onClick={() => onClickArticle(article.slug)}>
                                {
                                    <>
                                        {article.thumbnail && <img className='item-img' src={article.thumbnail}></img>}
                                    <div className='item-body'>
                                        <p className='item-body-category'  >{article.category.name}</p>
                                        <p className='item-body-title'>{article.title}</p>
                                    </div>
                                    </>
                                }
                           </div>
                })
            }
        </div>
      </section>


      <section className="home-section v ">
        <div style={{marginBottom:'14px'}} className="home-heading">
          <h3>For You!</h3>
        </div>
        {loading ? (
          <span className="loading center"></span>
        ) : (
          <div className="home-vertical-scroll hide-scrollbar">
            {
                recomendations.length == 0 ? <p className='center'>Piih dulu categorynya di setting</p>: recomendations.map((article, index) => {
              return (
                <ArticleItem
                  article={article}
                  isBookmark={isBookmark}
                  onBookmark={toggle}
                  onClickItem={onClickArticle}
                  key={index}
                ></ArticleItem>
              );
            })
            }
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
