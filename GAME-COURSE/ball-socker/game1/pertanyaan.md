
ini baca aja https://chatgpt.com/c/69e375cf-a7b4-8321-bf0e-2a08218740fd

1. kenapa ga pake ini buat render, kenap harus pake requestAnimationFrame
setInterval(render, 16);

Masalah:
❌ nggak sinkron sama refresh rate monitor
❌ bisa lag / patah-patah
❌ tetap jalan walau tab nggak aktif (boros CPU)

Sedangkan requestAnimationFrame:
✅ sinkron sama layar (60Hz / 120Hz)
✅ lebih smooth
✅ auto pause kalau tab tidak aktif
✅ lebih hemat performa

2. kita harus pak arrow 