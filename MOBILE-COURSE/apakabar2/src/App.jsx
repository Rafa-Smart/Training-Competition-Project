import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import HeaderComponent from './components/HeaderComponent'
import ArticleDetail from './pages/ArticleDetail'
import Discover from './pages/Discover'
import Bookmark from './pages/Bookmark'
import Settings from './pages/Settings'
import Navbar from './components/Navbar'
import Offline from './pages/Offline'
import Home from './pages/Home'

function App() {
  
  const [tab, setTab] = useState('home');
  const [article, setArticle] = useState(null) // ini nanti itu akan jadi slug string ya
  const [online, setOnline] = useState()
  const [theme, setTheme] = useState(localStorage.getItem('theme')||'system');
  const titles = {
    home:"ApaKabar",
    discover:"Discover",
    bookmark:"Bookmark",
    settings:"Settings"
  }
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement;
    if(theme == 'dark'){
      root.setAttribute('data-theme', 'dark') 
    }else if(theme == 'light'){
      root.setAttribute('data-theme', 'light')
    }else {
      const root =  document.documentElement;
      if(theme == 'dark'){
        root.setAttribute('data-theme', 'dark')
      }else if(theme == 'light'){
        root.setAttribute('data-theme', 'light')
      }else {
        const media = window.matchMedia('(prefers-color-schema: dark)');
        root.setAttribute('data-theme', media.matches ?'dark':"light");

        const handler = (e) => root.setAttribute('data-theme', e.matches ?'dark':'light');
        window.addEventListener('change', handler);
        return () => window.removeEventListener('change', handler);
      }
    }
  }, [theme])

  if(online) return <Offline></Offline>  
  const openArticle = (slug) => setArticle(sllug);
  const closeArticle = () => setArticle(null);

  return (
    <div id="app">
    {/* ini untuk HeaderComponent */}

    <HeaderComponent 
    title={article ? "Article": titles[tab]}
    showBack={!!article}
    onback={closeArticle}
    ></HeaderComponent>

    {/* ini untuk main */}
      <main>

      {/* kita kaish dulu pengecekan untuk artikel detailnya ya */}
      {
        article ? <ArticleDetail slug={article} onArticleClick={openArticle}></ArticleDetail>:(
         <>
          {tab == 'home' && <Home onArticleClick={openArticle}></Home>}
          {tab == 'discover' && <Discover onArticleClick={openArticle}></Discover>}
          {tab == 'bookmark' && <Bookmark onArticleClick={openArticle}></Bookmark>}
          {tab == 'settings' && <Settings onArticleClick={openArticle}></Settings>}
         </>
        )
      }

      </main>
      {/* ini untuk footer */}
      {!article && <Navbar setTab={setTab} tab={tab} ></Navbar>}
    </div>
  )
}

export default App
