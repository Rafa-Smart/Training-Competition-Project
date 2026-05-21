import { useEffect, useState } from "react";
import { api } from "../api/api";

const KEY = "pref";
const themes = ["light", "dark", "system"];
export default Settings = ({ theme, setTheme }) => {
  const [categories, setCategories] = useState([]);
  const [prefs, setPrefs] = useState(
    JSON.parse(localStorage.getItem(KEY)) || [],
  );

  useEffect(() => {
    api.getCategories().then((data) => setCategories(data.data || []));
  }, []);

  const toggle = (slug) => {
    setPrefs(prev => {
        let next  = prefs.includes(slug) ? prefs.filter(e => e != slug):[...prev, slug]
        localStorage.setItem(KEY, JSON.stringify(next))
        return next
    })
  }

  return (
    <div className="page settings">
        <section>
            <h3 className="section-title">Theme</h3>
           <div className="theme-btns">
            {
                themes.map((t) => {
                    return <button 
                    key={t}
                    className={`btn-theme ${t == theme}`}
                    onClick={(e) => {
                        e.preventDefault();
                        setPrefs(t)
                        localStorage.setItem(KEY, t)
                    } }
                    >{t.charAt(0).toUpperCase() + t.slice
                    (1)}</button>
                })
            }
           </div>
        </section>
        <section>
            <h3 className="section-title">Category Preferences</h3>
            <div className="category-grid">
                {
                    categories.map((category) => {
                        return <button className={`btn-category ${prefs.includes(category.slug) ? "active":""}`}
                        onClick={() => toggle(category.slug)}>{category.name}</button>
                    })
                }
            </div>
        </section>
    </div>
  )
};
