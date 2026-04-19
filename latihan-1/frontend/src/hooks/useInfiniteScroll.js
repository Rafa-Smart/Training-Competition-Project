import { useState, useEffect, useCallback } from "react";
// https://chat.deepseek.com/a/chat/s/e0c36e20-79c2-4c13-bc26-7a523fa7d6c4

const useInfiniteScroll = (fetchData, initialPage = 0, pageSize = 7) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  // Dalam useInfiniteScroll, kita mendefinisikan loadMore dengan useCallback karena fungsi ini digunakan dalam useEffect dan event listener. Dengan useCallback, kita ini memnstikan bahwa fungsi loadMore tidak berubah setiap render kecuali dependensinya berubah, sehingga mencegah event listener dipasang berulang-ulang.
  const loadMore = useCallback(async () => {
    // disin kta hurs Stop jika sedang loading atau tidak ada data lagi
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      // PANGGIL FUNGSI fetchData DARI PARAMETER
      const newData = await fetchData(page, pageSize);
      // TAMBAH DATA BARU KE DATA LAMA
      setData((prev) => [...prev, ...newData]);
      // CEK APAKAH MASIH ADA DATA LAGI
      if (newData.length < pageSize) setHasMore(false); // Berhenti request

      // NAIKKAN HALAMAN UNTUK REQUEST BERIKUTNYA
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, pageSize, loading, hasMore]);

  useEffect(() => {
    //     window.innerHeight: Tinggi area pandang (viewport) browser dalam piksel. Ini adalah bagian dari halaman web yang terlihat di jendela browser.

    // window.scrollY: Jumlah piksel yang telah di-scroll ke bawah dari atas halaman. Nilainya 0 saat di paling atas, dan bertambah seiring kita scroll ke bawah.

    // document.body.offsetHeight: Tinggi penuh dari seluruh badan dokumen (body) dalam piksel, termasuk bagian yang tidak terlihat (yang perlu di-scroll).

    // disini kereana kita pasangnya itu event listenernya itu di wndow, maka keitika di scroll di manapun
    // maka akan memicu iini, begitu pula ketika kita sedang scroll di home
    // karena kita memanggil useInfinite ini, maka nanti fungsi listener windownya akan terdetech
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;

      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        !loading &&
        hasMore
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore, loading, hasMore]);

  return {
    data,
    loading,
    hasMore,
    error,
    refresh: () => {
      setPage(initialPage);
      setData([]);
      setHasMore(true);
      loadMore();
    },
  };
};

export default useInfiniteScroll;

// 6. Tentang setPage(prev => prev + 1);
// Mengapa menggunakan functional updater?

// Perbandingan:
// Cara langsung: setPage(page + 1)

// Cara functional updater: setPage(prev => prev + 1)

// Alasannya:
// Di dalam fungsi loadMore, kita memiliki dependency page di dalam array dependency useCallback. Namun, karena loadMore menggunakan page yang di-capture dari closure, jika kita menggunakan setPage(page + 1), maka nilai page yang digunakan adalah nilai saat fungsi loadMore dibuat. Jika ada beberapa pemanggilan loadMore sebelum state diperbarui, maka semua pemanggilan akan menggunakan nilai page yang sama, yang bisa menyebabkan bug.

// Dengan functional updater setPage(prev => prev + 1), React akan memberikan nilai terbaru dari state page (yang mungkin sudah berubah karena pemanggilan sebelumnya) ke dalam fungsi updater. Jadi, meskipun ada beberapa pemanggilan setPage secara berurutan, setiap pemanggilan akan mendapatkan nilai prev yang benar (nilai sebelumnya).

// Contoh Kasus:
// Misalkan page awal = 0.
// Kita panggil loadMore dua kali cepat-cepat (sebelum state diperbarui).

// Dengan setPage(page + 1):
// Kedua pemanggilan menggunakan page = 0, jadi keduanya akan mengatur page menjadi 1. Ini salah karena seharusnya naik menjadi 2.

// Dengan setPage(prev => prev + 1):
// Pemanggilan pertama: prev = 0 -> jadi 1.
// Pemanggilan kedua: prev = 1 (karena sudah diperbarui) -> jadi 2.

// Oleh karena itu, functional updater lebih aman ketika state update bergantung pada nilai state sebelumnya, terutama di dalam fungsi yang mungkin dipanggil beberapa kali sebelum state diperbarui.
