import { useState, useEffect } from "react";
import { getPosts } from "../api/api.js";
import ArticleCard from "../components/ArticleCard";
import useBookmarks from "../hooks/useBookMark";
// test
const PREF_KEY = "apakabar_prefs";
 
export default function Home({ onArticleClick }) {
  const [breaking, setBreaking] = useState([]);
  const [recs, setRecs] = useState([]);
  const { toggle, isBookmarked } = useBookmarks();
 
  useEffect(() => {
    getPosts({ per_page: 5, order_by: "latest" })
      .then(r => setBreaking(r.data || []));
 
    const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "[]");
 
    if (!prefs.length) return; // tidak ada preferensi, recs tetap kosong
 
    // Fetch 3 artikel per kategori secara paralel, lalu gabungkan
    // jadi promise all itu dia akn dapatkan atauadalh koe yang bisa menjalankan banyak peritah skaligus lalu di gabungkan gitu ya
    // disni karena hasil dri tiap objek dari si fetch slugnya adalh array aka pas kita gabungin itu kita flat dulu ya jangan lupa
    Promise.all(
      prefs.map(slug => getPosts({ per_page: 3, category: slug, order_by: "latest" })
        .then(r => r.data || []))
    ).then(results => {
      // results = [[3 artikel teknologi], [3 artikel olahraga], ...]
      // flat() menggabungkan semua array jadi satu
      setRecs(results.flat());
    });
  }, []);
 
  return (
    <div className="page">
      <section>
        <h2 className="section-title">🔴 Breaking News</h2>
        <div className="breaking-scroll">
          {breaking.map(a => (
            <div className="breaking-card" key={a.slug} onClick={() => onArticleClick(a.slug)}>
              {a.thumbnail && <img src={a.thumbnail} alt={a.title} />}
              <div className="breaking-overlay">  
                {a.category && <span className="card-cat">{a.category.name}</span>}
                <p>{a.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
 
      <section>
        <h2 className="section-title">📌 For You</h2>
        {recs.length === 0
          ? <p className="muted-msg">Pilih kategori favorit di Settings untuk personalisasi.</p>
          : recs.map(a => ( 
              <ArticleCard key={a.slug} article={a} onClick={onArticleClick}
                onBookmark={toggle} isBookmarked={isBookmarked(a.slug)} />
            ))
        }
      </section>
    </div>
  );
}


// const PREF_KEY = "apakabar_prefs";

// export default function Home({ onArticleClick }) {
//   const [breaking, setBreaking] = useState([]);
//   const [recs, setRecs] = useState([]);
//   const { toggle, isBookmarked } = useBookmarks();

//   useEffect(() => {
//     // Breaking: selalu ambil 5 terbaru, tanpa filter kategori
//     getPosts({ per_page: 5, order_by: "latest" })
//       .then(r => setBreaking(r.data || []));

//     // Rekomendasi: pakai preferensi multi-kategori dari Settings
//     const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "[]");
//     // prefs = ["teknologi", "olahraga"] → catParam = "teknologi,olahraga"
//     // prefs = []                        → catParam = undefined (tidak dikirim)
//     const catParam = prefs.length ? prefs.join(",") : undefined;

//     getPosts({ per_page: 10, order_by: "latest", category: catParam })
//       .then(r => setRecs(r.data || []));
//   }, []);

//   return (
//     <div className="page">
//       <section>
//         <h2 className="section-title">🔴 Breaking News</h2>
//         <div className="breaking-scroll">
//           {breaking.map(a => (
//             <div className="breaking-card" key={a.slug} onClick={() => onArticleClick(a.slug)}>
//               {a.thumbnail && <img src={a.thumbnail} alt={a.title} />}
//               <div className="breaking-overlay">
//                 {a.category && <span className="card-cat">{a.category.name}</span>}
//                 <p>{a.title}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section>
//         <h2 className="section-title">📌 For You</h2>
//         {recs.length === 0
//           ? <p className="muted-msg">Pilih kategori favorit di Settings untuk personalisasi.</p>
//           : recs.map(a => (
//               <ArticleCard key={a.slug} article={a} onClick={onArticleClick}
//                 onBookmark={toggle} isBookmarked={isBookmarked(a.slug)} />
//             ))
//         }
//       </section>
//     </div>
//   );
// }