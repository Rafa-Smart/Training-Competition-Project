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

    // ini yg langsung dari sistemnya ya yang atas itu yang via click
    else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      root.setAttribute("data-theme", mq.matches ? "dark" : "light");

      const handler = e => root.setAttribute("data-theme", e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  if (!online) return <Offline />;
  // Letaknya setelah kedua useEffect penting — ini bukan kebetulan. Hooks di React tidak boleh dipanggil secara kondisional. Kalau kita taruh guard clause ini sebelum useEffect, maka saat online === false, useEffect tidak akan dipanggil sama sekali, dan React akan error karena jumlah hooks berubah antar render. Dengan menaruhnya setelah semua hooks, kita memastikan hooks selalu dipanggil dengan urutan yang sama di setiap render.

  const openArticle = slug => setArticle(slug);
  const closeArticle = () => setArticle(null);

  const titles = { home: "ApaKabar", discover: "Discover", bookmark: "Bookmark", settings: "Settings" }; 

  return (
    <div id="app">
      <Header title={article ? "Article" : titles[tab]} showBack={!!article} 
      // jadgi gini untuk yang !! itu dia aknamengubah nilai apaun jadi nilai boolean murni,misalnya ada isinya berati kan truthy nah dia akn di ! pertma maka aka jadi false, llau setelah itu di ! lagi aka dari false akna jadi true nahh
      
      onBack={closeArticle} />
      <main>
          {/* jadi kalo artikelnya ada atau ketika artikel di klik artinya kan buka artiel detail maka tampiilin detailnya */}
        {article ? (
          <ArticleDetail slug={article} onArticleClick={openArticle} />
        ) : (
          <>
          {/* jadi gini si tab ini berubah ketika di klik ya, nah di kliknya itu di komponen navbar */}

          {/* disni kita kirim open articke ke komponen ya bukan jalanin fungsinya
          jadi alanin fungsinya itu di komponennya */}
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