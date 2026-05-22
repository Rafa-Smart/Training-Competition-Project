import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Header from './components/Header'
import ArticleDetail from './pages/ArticleDetail'

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

  if(!online) return <Offline></Offline>  
  const operArticle = (slug) => setArticle(sllug);
  const closeArticle = () => setArticle(null);

  return (
    <div id="app">
    {/* ini untuk header */}

    <Header 
    title={article ? "Article": titles[tab]}
    showBack={!!article}
    onback={closeArticle}
    ></Header>

    {/* ini untuk main */}
      <main>

      {/* kita kaish dulu pengecekan untuk artikel detailnya ya */}
      {
        article ? <ArticleDetail ></ArticleDetail>:""
      }

      </main>
      {/* ini untuk footer */}
    </div>
  )
}

export default App
