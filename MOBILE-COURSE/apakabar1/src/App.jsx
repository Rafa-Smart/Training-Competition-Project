import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Bookmark from "./pages/Bookmark";
import Settings from "./pages/Settings";
import ArticleDetail from "./pages/ArticleDetail";
import Offline from "./pages/Offline";
import NavBar from "./components/NavBar";
import Header from "./components/Header";
import "./index.css";

export default function App() {
  const [tab, setTab] = useState("home");
  const [article, setArticle] = useState(null); // slug string
  const [online, setOnline] = useState(navigator.onLine);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else if (theme === "light") root.setAttribute("data-theme", "light");
    else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      root.setAttribute("data-theme", mq.matches ? "dark" : "light");
      const handler = e => root.setAttribute("data-theme", e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  if (!online) return <Offline />;

  const openArticle = slug => setArticle(slug);
  const closeArticle = () => setArticle(null);

  const titles = { home: "ApaKabar", discover: "Discover", bookmark: "Bookmark", settings: "Settings" };

  return (
    <div id="app">
      <Header title={article ? "Article" : titles[tab]} showBack={!!article} onBack={closeArticle} />
      <main>
        {article ? (
          <ArticleDetail slug={article} onArticleClick={openArticle} />
        ) : (
          <>
            {tab === "home" && <Home onArticleClick={openArticle} />}
            {tab === "discover" && <Discover onArticleClick={openArticle} />}
            {tab === "bookmark" && <Bookmark onArticleClick={openArticle} />}
            {tab === "settings" && <Settings theme={theme} setTheme={setTheme} />}
          </>
        )}
      </main>
      {!article && <NavBar tab={tab} setTab={setTab} />}
    </div>
  );
}