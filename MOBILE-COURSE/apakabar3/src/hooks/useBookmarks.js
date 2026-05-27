import { useState } from "react";

const key = "apakabar_bookmarks";
const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem(key)) || []);
  const toggle = (article) => {
    // console.log(article)
    setBookmarks((prev) => {
      const ada = prev.find((data) => data.slug == article.slug);
      const next = ada
        ? prev.filter((data) => data.slug != article.slug)
        : [...prev, article];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };    

  const isBookmark = (slug) => bookmarks.some(data => data.slug == slug)
  return [bookmarks, toggle, isBookmark]
};

export default useBookmarks;
