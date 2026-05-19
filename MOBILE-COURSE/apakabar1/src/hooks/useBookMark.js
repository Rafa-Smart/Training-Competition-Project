import { useState } from "react";

const KEY = "apakabar_bookmarks";
const load = () => JSON.parse(localStorage.getItem(KEY) || "[]");

export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(load);

  const toggle = (article) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.slug === article.slug);
      const next = exists ? prev.filter(b => b.slug !== article.slug) : [article, ...prev];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const isBookmarked = (slug) => bookmarks.some(b => b.slug === slug);
  return { bookmarks, toggle, isBookmarked };
}