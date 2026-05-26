import { useEffect, useState } from "react";
import { api } from "../api/api";
const key = 'apakabar_preferensi'
const key_2 = 'apakabar_theme'
const themes = ['light', 'system', 'dark']
const Settings = ({theme, setTheme}) => {

    const [categories, setCategories] = useState([]);
    const [preferensi, setPreferensi] = useState(JSON.parse(localStorage.getItem(key)) || [])
    useEffect(() => {
        api.getCategories().then(response => {
            setCategories(response.data);
        })
    }, []) 
    
    const togglePreferensi = (category) => {
        setPreferensi(prev => {
            const next = prev.includes(category) ? prev.filter(preferensinya => preferensinya!=category):[...prev, category];
            localStorage.setItem(key, JSON.stringify(next));
            // console.log(next)
            return next
        })
    };



    return <div className='page-setting'>
        <section className='setting'>
        <h2>Theme Selection</h2>
         <div className='setting-flex'>
            {
                themes.map((themeN, index) => {
                    return <div key={index} className={`setting-item ${themeN == theme ? 'active':''}`} onClick={(e) => {setTheme(themeN);
                    
                    localStorage.setItem(key_2, themeN)}}>{themeN.charAt(0).toUpperCase() + themeN.slice(1)}</div>
                })
            }
            </div>
        </section>
        <section className='setting'>
        <h2>Preferensi Selection</h2>
              <div className='setting-flex'>
                  {
                    categories.map((category, index) => {
                        {/* ini itu bukan preferensi == category ya,karna dinsi ita ingin bandinign array gitu, d aga di array, jadi pake includes */}
                        return <div key={index} className={`setting-item ${preferensi.includes(category.slug) ?'active':'' }`} onClick={(e) => {togglePreferensi(category.slug);
                        // console.log(preferensi)
                        localStorage.setItem(key, JSON.stringify(preferensi)) }}><p style={{textAlign:'center'}}>{category.slug.charAt(0).toUpperCase() + category.slug.slice(1)}</p></div>
                    })
                }
              </div>

        </section>
    </div>
}

export default Settings;