import { useCallback, useState } from "react";
import { transactionApi } from "../api/transaction";

export default useInfiniteScroll = (params = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const fetchPage = useCallback(
    async (pageNumber, reset = false) => {
      setLoading(true);
      try {
        const response = await transactionApi.index({
          ...params, // Filter dari luar (misal: month, year, wallet_id)
          page: pageNumber,
          per_page: 25,
        });

        const data = response.data; // { current_page, data: [...], last_page, total }

        if (reset) {
          // jadi reset ini akna di panggil kalo misalnya
          // dia akna jadi false kalo masih ada hasmore dan tidak lading (artinya semua datanya itu akan di tambahin agi)
          // dan akna di pangil menjadi true
          // kalo di panggil di reload (artinay semua datanya langsung di replace)

          // jadi jika di reset maka erplace semua datnaya yang lama
          setTransactions(data.data); // ini itu pake paginate ya jadi engga ada atribute transactions
        } else {
          // nah kalo mislnya engga di reset maka dia akna ambah lagi data baru ke data yang udah ada
          setTransactions((prev) => [...prev, data.data]);
        }

        // nah dinsi ita caek apkah ini adalah dat ayang terakhir
        setHasMore(data.current_page < data.last_page);
        // jika iya lebih kecil maka lansung aja hasmore atau minta lag (artiya masih ada)
        // tapi kalo false artinya udah habis
        // nah sekarnag kita perbatui si pagenya pake   current_page
        setPage(data.current_page);
        // console.log(data);
      } catch (e) {
        console.log("gagal ngambil data ", e);
      } finally {
        setLoading(false);
      }

      // jadi disni kenapa ktia pake jsonstringy ? karena INGAT KALO DI JS ITU
      // dia kan kalo membandingkan objek itu berdasarkan referensi / alamatnya bukan isinya
      // jadi kalo misalnya kita bnaidign objek yang sama itu sebenernya aakn false akrna beda penyimpanan memory
      // nah sedangkan dinsi kita kan seallu bandingkan si param yang di mana param ini adalah objek, makanya kita harus parse dulu ke string jadi meskipun isinya sma akan tetep true baru alo isinya beda maka akan re create lagi si fugisnya (INAGAT KARA YANG ADADI DEPDENDENCIESNYA INI BERBEDA INI DASAR BANGAT)
    },
    [JSON.stringify(params)],
  );

  // Load halaman berikutnya (dipanggil saat klik "Load More")
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPage(page + 1, false); // NAH DISINI KITA RESET
    }
  };

  const reload = () => {
    setTransactions([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, true); // NAH DINSI KITA ENGGA RESET YA
  };

  return {transactions, loading, hasMore, loadMore, reload, fetchPage}
};


