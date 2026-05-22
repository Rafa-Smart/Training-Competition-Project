import { useState, useEffect } from "react";
import { getCategories } from "../api/api.js";

const PREF_KEY = "apakabar_prefs";
const THEMES = ["light", "dark", "system"];

export default function Settings({ theme, setTheme }) {
  const [categories, setCategories] = useState([]);
  const [prefs, setPrefs] = useState(JSON.parse(localStorage.getItem(PREF_KEY) || "[]"));

  useEffect(() => { getCategories().then(r => setCategories(r.data || [])); }, []);

  const togglePref = slug => {
    setPrefs(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      localStorage.setItem(PREF_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="page settings">
      <section>
        <h2 className="section-title">Theme</h2>
        <div className="theme-btns">
          {THEMES.map(t => (
            <button key={t} className={`theme-btn ${theme === t ? "active" : ""}`}
              onClick={() => { setTheme(t); localStorage.setItem("theme", t); }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Category Preferences</h2>
        <div className="cat-grid">
          {categories.map(c => (
            <button key={c.slug} className={`cat-chip ${prefs.includes(c.slug) ? "active" : ""}`}
                onClick={() => togglePref(c.slug)}>{c.name}</button>
            ))}
        </div>
      </section>
    </div>
  );
}