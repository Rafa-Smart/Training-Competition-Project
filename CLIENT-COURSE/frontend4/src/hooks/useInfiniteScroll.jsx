import { useCallback, useEffect, useState } from "react";
import { apiPost } from "../api/post";

const useInfiniteScroll = (
  fetchFunction,
  initialPage,
  sizePage = 10
) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errors, setErrors] = useState(null);

  // ini fngsi load morenya

  const loadMore = useCallback(async () => {
    // disin kta hurs Stop jika sedang loading atau tidak ada data lagi
    if (loading || !hasMore) {
      return null;
    }
    setLoading(true);
    setErrors(null);

    try {
      const newDataPosts = await fetchFunction(page, sizePage);
      // setItems([...items, ...newDataPosts]);

      // // cek jika dat ayang ktia ambil itu sudah lebih kecil dari pageSize, artinya sdudah haibis, maka setLoadore agar false
      // if (newDataPosts.length < sizePage) setHasMore(false);

      // // disin kita tambahin juga untuk pagenya, agar nanti tiap kali
      // // fungsi ini di panggil di loadmore maka aakn fetch data dnegna data
      // // yang paling terbaru

      // // disini kti pake updater functional itu agar
      // // ketika di scroll beberapa kali oleh user, maka agar tidak race condition
      // // maka ktia selalu tambah dari yang sebelunya

      // setPage((prevPage) => prevPage + 1);


      // atau bisa juga serpti ini
      // Jika tidak ada data baru, set hasMore menjadi false
      if (newDataPosts.length === 0) {
        setHasMore(false);
      } else {
        setItems((prevItems) => [...prevItems, ...newDataPosts]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      setErrors(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, hasMore, sizePage, loading]);

  //   nah disini baru kti ambil data event dari user ketika dia scroll

  useEffect(
    () => {
      const handleScroll = () => {
        const cekScroll =
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100;

        if (cekScroll) {
          loadMore();
        }
      };

      // disni

      window.addEventListener("scroll", handleScroll);

      // disini kita return agar ketika user ganti halaman
      // maka event listenernya itu akand i hilangkan

      return () => window.removeEventListener("scroll", handleScroll);
    },
    [loadMore,
    hasMore,
    loading]
  );

  const reset = () => {
    setPage(initialPage);
    setItems([]);
    setHasMore(true);
    loadMore();
  };

  return {
    items, loading, hasMore, errors, reset
  };
};


export default useInfiniteScroll