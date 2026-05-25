const key = "apakabar_bookmarks";
const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const toggle = (slug) => {
    setBookmarks((prev) => {
      const ada = prev.find((data) => data.slug == slug);
      const next = ada
        ? prev.filter((data) => data.slug != slug)
        : [...prev, ada];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  const isBookmark = (slug) => bookmarks.some(data => data.slug == slug)
  return [bookmarks, toggle, isBookmark]
};

export default { useBookmarks };
