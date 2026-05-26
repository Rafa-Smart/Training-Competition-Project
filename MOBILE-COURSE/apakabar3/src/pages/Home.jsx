import { useEffect, useState } from "react";
import ArticleItem from "../components/ArticleItem";
import { api } from "../api/api";
import useBookmarks from "../hooks/useBookmarks";
const key = "apakabar_preferensi";
const Home = ({ onClickArticle }) => {
  const [recomendations, setRecomendations] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [toggle, isBookmark] = useBookmarks();
  const preferensi = JSON.parse(localStorage.getItem(key));
//   console.log(preferensi)
  useEffect(() => {
    api
      .getPosts({
        per_page: 5,
        order_by: "latest",
      })
      .then((response) => setBreakingNews(response.data));

    //   Promise.all(
    //     preferensi.map((pref) => {
    //         return api.getPosts({category:pref.slug, ordey_by:'latest',per_page:3}).then((response) => {
    //             return response.data;
    //         })
    //     })
    //   ).then((results) => setRecomendations(results.flat()))
  }, []);
//   console.log(preferensi)
  return (
    <div className="page">
      <section className="home-section">
        <div className="home-heading">
          <h2>Breaking News</h2>
        </div>
        <div className="home-horizontal-scroll"></div>
      </section>
      <section className="home-section">
        <div className="home-heading">
          <h2>For You!</h2>
        </div>
        <div className="home-horizontal-scroll">{
            recomendations.map((article, index) => {
                return <ArticleItem article={article} isBookmark={isBookmark} onBookmark={toggle} onClickItem={onClickArticle} key={index}></ArticleItem>
            })
        }</div>
      </section>
    </div>
  );
};

export default Home;
