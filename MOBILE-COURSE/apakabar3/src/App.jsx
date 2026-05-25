import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css' 
const key_2 = 'apakabar_theme'
function App() { 
  const [tab, setTab] = useState('home');
  const [article, setArticle] = useState(null);
  const [online, setOnline] = useState(navigator.onLine)
  const [theme, setTheme]=useState(locaStorage.get(key_2) || 'system')

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
      root.setAttribute('data-color', 'dark');
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

  return (
    <></>
  )
}

export default App
