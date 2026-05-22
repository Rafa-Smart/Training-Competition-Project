import { useState } from "react";

const KEY = "bookmarks";
export default useBookmarks = () => {
  const [bookmarks, setbookmarks] = useState(
    JSON.parse(localStorage.getItem(KEY)) || [],
  );
  const toggle = (article) => {
    setbookmarks((prev) => {
      const ada = bookmarks.find((b) => b.slug == article.slug);
      // ini ga bisa pake bookmarks.includes(article.slug) ya, krena ini objek bukan 1 stirng atau gitu deh
      const next = ada
        ? bookmarks.filter((b) => b.slug != article.slug)
        : [ada, ...prev];
      localStorage.setItem(KEY, JSON.stringify(ada));
      return ada;
    });
  };

  const isBookmark = (article) => bookmarks.some(b => b.slug == article.slug);
  return [bookmarks, toggle, isBookmark]
};
