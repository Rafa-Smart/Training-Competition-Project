import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css' 
import Header from './components/Header'
import Navbar from './components/Navbar'
import ArticleDetail from './pages/ArticleDetail'
import Home from './pages/Home'
import Discover from './pages/Discover'
import Bookmark from './pages/Bookmark'
import Settings from './pages/Settings'
import Offline from './pages/Offline'
const key_2 = 'apakabar_theme'
function App() { 
  const [tab, setTab] = useState('home');
  const [article, setArticle] = useState(null);
  const [online, setOnline] = useState(navigator.onLine)
  const [theme, setTheme]=useState(localStorage.getItem(key_2) || 'system')

  useEffect(() => {
    const on = setOnline(true);
    const off = setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if(theme=='dark'){
      root.setAttribute('data-theme', 'dark');
    }else if(theme=='light'){
      root.setAttribute('data-theme', 'light')
    }else {
      const mq = window.matchMedia('(prefers-color-schema: dark)');
      root.setAttribute('data-theme', mq.matches =='dark' ?'dark':'light');

      const handle = (e) => root.setAttribute('data-theme', e.matches =='dark'?'dark':'light');
      mq.addEventListener('change', handle);
      return () => mq.removeEventListener('change', handle)
    }
  },[theme]) 

  const openArticle = (slug) => setArticle(slug);
  const closeArticle = () => setArticle(null);
  const titles = {home:"Home", discover:"Discover", bookmark:"Bookmark", settings:"Settings"}

  if(online)return <Offline></Offline>

  return (
    <>
      <div id='app'>
        <Header onBack={closeArticle} showback={!!article} title={article ?'Article' :titles[tab]}></Header>
                    {/* NAH INI WAJIB BANGET KTIA KASIH KEY DISNI, KARENA GINI KETIAK KITA SET ARTICLE YA DARI SI DETAIL ARTICLE
          KA KALO KOMPONENNAY MASIH SAMA MAKA TIDAK AKAN DI RENDER, JADI DISNI KITA KA MAU BUKA DETIAL PAGE TAPI KITA UDHA DI DETAIL PAGE, MAKANYA OPEN ARTICLENYA ENGGA JAALN GITUU, MAKANYA DISNI KITA WAJIB PAKE KEY UNTUK PEMBEDA, JAID KALO AD ASETsTATE MAKA AKAN DI RELOAD LAGI KARENA KEYNYA BERBEDA */}
        <main>
          {
            article ? (<ArticleDetail key={article} onClickArticle={openArticle} slug={article}></ArticleDetail>) :(
              <>
                {tab == 'home' && <Home onClickArticle={openArticle}></Home>}
                {tab == 'discover' && <Discover onClickArticle={openArticle}></Discover>}
                {tab == 'bookmark' && <Bookmark onClickArticle={openArticle}></Bookmark>}
                {tab == 'settings' && <Settings setTheme={setTheme} theme={theme}></Settings>}
              </>
            )

          }
        </main>
        {
          !article && <Navbar setTab={setTab} tab={tab} ></Navbar>
        }
      </div>
    </>
  )
}

export default App
