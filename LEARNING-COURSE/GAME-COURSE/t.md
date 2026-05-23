# MASTER IMPLEMENTATION BRIEF

## Premium Website Sales Platform untuk Produk Website & Aplikasi

Dokumen ini adalah satu file master untuk dipakai AI/engineer agar bisa membangun website penjualan jasa/produk digital secara lengkap dengan **Next.js + Supabase + Prisma**. Fokusnya adalah website yang terlihat premium, modern, dan benar-benar bisa dikelola penuh dari backend tanpa hardcode konten.

---

# 1) ARAH PRODUK

Website ini adalah **platform katalog + penjualan** untuk sebuah studio/bisnis digital yang menjual:

* website toko online
* landing page
* company profile
* website UMKM
* dashboard sistem
* aplikasi Android Flutter
* jasa maintenance
* jasa integrasi WhatsApp / payment gateway

Website harus terasa seperti **premium digital studio + store**. Pengunjung harus bisa:

* melihat showcase produk
* membuka halaman detail produk
* melihat mockup / screenshot / case study
* membaca testimoni
* memilih layanan
* mengirim inquiry via form
* klik WhatsApp
* login/register untuk fitur lanjut

Admin harus bisa mengelola semua konten melalui database dan dashboard.

---

# 2) ARAH DESIGN YANG DISARANKAN

## Kesimpulan design terbaik

Design paling cocok untuk website ini adalah:

**Premium light theme / white theme** dengan nuansa:

* clean
* elegant
* modern
* editorial
* soft luxury
* sangat rapi
* minim ornamen berlebihan
* tidak terlihat seperti template AI generik

## Kenapa ini paling cocok

Karena kamu menjual jasa yang butuh kepercayaan. Untuk jualan produk digital, user lebih percaya pada tampilan yang:

* luas dan lega
* tipografi kuat
* ada ruang putih yang cukup
* ada mockup besar
* ada storytelling visual
* ada banyak bukti nyata seperti screenshot, hasil kerja, dan testimoni

## Gaya visual yang dipakai

Gunakan kombinasi:

* background putih / off-white
* section card dengan border tipis dan shadow halus
* accent color yang elegan, misalnya navy, emerald, slate, atau gold tipis
* gradient hanya sebagai aksen ringan
* ilustrasi minimal, fokus ke mockup asli
* foto / screenshot produk sebagai pusat perhatian
* animasi halus, jangan berlebihan

## Ciri design premium

Agar tidak terlihat AI:

* gunakan tipografi yang konsisten
* layout grid yang stabil
* headline kuat, pendek, dan tajam
* CTA jelas
* tidak terlalu banyak efek glow berlebihan
* gambar mockup ditempatkan seperti presentasi brand profesional
* card produk harus terasa seperti katalog butik digital, bukan marketplace murahan

## Struktur estetika yang disarankan

### Hero section

* headline besar
* subheadline singkat
* 2 CTA
* preview mockup besar
* statistik singkat

### Showcase section

* katalog produk unggulan dalam grid premium
* masing-masing card berisi mockup, nama produk, harga, kategori, badge

### Case study section

* tampilkan hasil kerja nyata dengan storytelling

### Services section

* jelaskan jasa dalam format card mewah

### Testimonial section

* tampilkan review yang rapi dan terpercaya

### FAQ section

* sederhana, tidak ramai

### Final CTA section

* ajakan konsultasi via WhatsApp

---

# 3) SISTEM DESAIN / DESIGN SYSTEM

## Warna

Gunakan palet seperti:

* Primary: navy / deep slate
* Accent: emerald / gold / indigo
* Background: white, snow, soft gray
* Text: charcoal / slate
* Border: gray sangat tipis

## Tipografi

Pakai kombinasi:

* Heading: modern geometric sans atau elegant sans
* Body: clean sans yang sangat readable

Aturan:

* heading tegas
* paragraf pendek
* gunakan ukuran font yang berjenjang jelas

## Spacing

* section harus lega
* card jangan terlalu rapat
* padding besar pada hero
* margin antar section cukup panjang

## Komponen visual penting

* premium navbar
* hero mockup frame
* product cards
* category filter
* pricing badge
* feature list
* testimonial card
* FAQ accordion
* CTA banner
* admin table
* rich text editor
* image uploader

## Animasi

Gunakan animasi halus:

* fade up
* stagger section
* hover micro-interactions
* card lift ringan
* smooth page transition

Jangan gunakan animasi berlebihan yang mengganggu kesan profesional.

---

# 4) STRUKTUR WEBSITE / PAGE MAP

## Public pages

* `/` → homepage
* `/products` → katalog produk
* `/products/[slug]` → detail produk
* `/services` → daftar layanan
* `/services/[slug]` → detail layanan
* `/projects` → case studies / portfolio
* `/projects/[slug]` → detail project
* `/testimonials` → halaman testimonial
* `/contact` → kontak
* `/about` → tentang brand
* `/login` → login
* `/register` → register
* `/forgot-password` → reset password

## Dashboard pages

* `/dashboard` → ringkasan user
* `/dashboard/inquiries` → inquiry user
* `/dashboard/orders` → riwayat order
* `/dashboard/profile` → profil

## Admin pages

* `/admin` → admin overview
* `/admin/products` → CRUD produk
* `/admin/products/new` → tambah produk
* `/admin/products/[id]` → edit produk
* `/admin/services` → CRUD layanan
* `/admin/testimonials` → CRUD testimonial
* `/admin/categories` → CRUD kategori
* `/admin/projects` → CRUD case study
* `/admin/faqs` → CRUD FAQ
* `/admin/homepage-sections` → atur homepage
* `/admin/site-settings` → setting global
* `/admin/inquiries` → inbox inquiry

---

# 5) STACK TEKNOLOGI

Gunakan stack berikut:

* **Next.js App Router**
* **TypeScript**
* **Supabase**

  * Auth
  * Postgres Database
  * Storage
* **Prisma ORM**
* **Tailwind CSS**
* **shadcn/ui**
* **Framer Motion**
* **Zod**
* **React Hook Form**
* **Lucide React**
* **Sonner / Toast notifications**
* **Recharts** bila butuh statistik dashboard

---

# 6) STRUKTUR FOLDER YANG DISARANKAN

```bash
src/
  app/
    (marketing)/
      page.tsx
      products/
        page.tsx
        [slug]/page.tsx
      services/
        page.tsx
        [slug]/page.tsx
      projects/
        page.tsx
        [slug]/page.tsx
      testimonials/page.tsx
      contact/page.tsx
      about/page.tsx

    (auth)/
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx

    (dashboard)/
      dashboard/page.tsx
      dashboard/inquiries/page.tsx
      dashboard/orders/page.tsx
      dashboard/profile/page.tsx

    (admin)/
      admin/page.tsx
      admin/products/page.tsx
      admin/products/new/page.tsx
      admin/products/[id]/page.tsx
      admin/services/page.tsx
      admin/testimonials/page.tsx
      admin/categories/page.tsx
      admin/projects/page.tsx
      admin/faqs/page.tsx
      admin/homepage-sections/page.tsx
      admin/site-settings/page.tsx
      admin/inquiries/page.tsx

    api/
      upload/route.ts
      whatsapp/route.ts
      webhooks/route.ts

  components/
    ui/
    layout/
    sections/
    cards/
    forms/
    navigation/

  features/
    auth/
    products/
    services/
    projects/
    testimonials/
    inquiries/
    admin/

  lib/
    supabase/
      client.ts
      server.ts
      admin.ts
    prisma.ts
    utils.ts
    constants.ts
    validators.ts

  server/
    actions/
      auth.actions.ts
      product.actions.ts
      service.actions.ts
      project.actions.ts
      testimonial.actions.ts
      inquiry.actions.ts
      settings.actions.ts
    repositories/
      product.repo.ts
      service.repo.ts
      project.repo.ts
      inquiry.repo.ts

prisma/
  schema.prisma
  migrations/

public/
  images/
  mockups/
  icons/
```

---

# 7) ALUR DATA / MEKANISME SISTEM

## Semua konten harus dinamis

Tidak boleh hardcode konten penting di component jika datanya bisa diubah dari database.

Konten yang wajib dinamis:

* produk
* category
* services
* testimonial
* project/case study
* FAQ
* homepage sections
* site settings
* WhatsApp number
* hero content
* CTA text

## Mekanisme CRUD

Semua CRUD sebaiknya menggunakan server actions atau route handler yang jelas.

### Create

Admin isi form → validasi Zod → simpan ke Supabase/Prisma → refresh UI.

### Read

Halaman publik membaca data dari database.

### Update

Admin edit form → validasi → update database → cache revalidate.

### Delete

Lebih aman gunakan soft delete:

* `is_active = false`
* atau `status = archived`

---

# 8) AUTH DAN ROLE

## Supabase Auth

Gunakan Supabase Auth untuk:

* register
* login
* logout
* reset password
* session handling

## Role user

* `admin` → full access
* `client` → akses dashboard client
* `visitor` → hanya browsing

## Aturan akses

* admin dapat CRUD semua data
* client hanya dapat melihat data miliknya
* public hanya membaca data published

## Security wajib

* aktifkan RLS di Supabase
* jangan expose service role key ke client
* validasi input dengan Zod
* upload file dibatasi tipe dan ukuran
* slug harus unik

---

# 9) INTEGRASI WHATSAPP

Harus ada 2 mekanisme:

## Mekanisme 1: tombol cepat

Tombol WhatsApp langsung membuka chat dengan pesan otomatis.

Format pesan:

* nama produk
* nama user
* minat user
* link produk
* CTA konsultasi

## Mekanisme 2: inquiry form

User isi form di website → data masuk ke tabel `inquiries` → user diarahkan ke WhatsApp atau mendapat konfirmasi.

## Data WhatsApp harus bisa diubah dari admin

Simpan di tabel `whatsapp_settings`:

* nomor
* default message
* label tombol
* status aktif

---

# 10) STRATEGI SHOWCASE PRODUK

Setiap produk wajib tampil sangat visual.

Komponen detail produk:

* cover mockup utama
* galeri screenshot
* badge kategori
* harga
* deskripsi singkat
* detail fitur
* benefit
* stack teknologi
* estimasi pengerjaan
* revisi
* FAQ produk
* tombol order / konsultasi
* testimoni terkait

## Layout detail produk yang bagus

Susunan halaman detail produk ideal:

1. hero detail
2. mockup besar
3. overview singkat
4. fitur utama
5. screenshot gallery
6. benefit section
7. paket harga / pricing
8. testimonial terkait
9. FAQ
10. CTA WhatsApp

---

# 11) DATABASE ARCHITECTURE

Gunakan PostgreSQL di Supabase, dikelola via Prisma.

## Tabel inti

* `profiles`
* `categories`
* `products`
* `product_media`
* `product_features`
* `product_sections`
* `services`
* `projects`
* `testimonials`
* `faqs`
* `site_settings`
* `homepage_sections`
* `inquiries`
* `orders`
* `whatsapp_settings`

## Relasi utama

* `categories` 1..n `products`
* `products` 1..n `product_media`
* `products` 1..n `product_features`
* `products` 1..n `product_sections`
* `projects` dapat terhubung ke `products`
* `profiles` terhubung ke `auth.users`
* `inquiries` bisa terhubung ke `products` dan `profiles`

---

# 12) INSTRUKSI UNTUK FILE `database.sql`

Buat file bernama:

`database.sql`

Isi file ini harus berisi:

1. pembuatan extension yang diperlukan
2. pembuatan tabel-tabel
3. foreign key relationship
4. index penting
5. seed dummy data
6. seed gambar dummy yang nanti mudah diganti
7. contoh data untuk homepage, produk, service, testimonial, FAQ, dan site settings

## Aturan dummy image

Gunakan URL gambar dummy sementara seperti:

* placeholder image URL
* random image URL
* atau path lokal `/images/placeholder/...`

Nanti semua gambar dummy harus mudah diganti dari Supabase Storage.

---

# 13) CONTOH STRUKTUR ISI `database.sql`

Berikut contoh isi SQL yang harus dibuat. Ini adalah baseline yang bisa langsung dipakai lalu disesuaikan.

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES
-- =========================
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  name text not null,
  email text unique not null,
  phone text,
  avatar_url text,
  role text not null default 'client' check (role in ('admin', 'client', 'visitor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- CATEGORIES
-- =========================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- PRODUCTS
-- =========================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  title text not null,
  slug text unique not null,
  short_description text,
  full_description text,
  price numeric(12,2) not null default 0,
  discount_price numeric(12,2),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  cover_image text,
  preview_video_url text,
  delivery_time text,
  revision_count int default 0,
  tech_stack text,
  whatsapp_message text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- PRODUCT MEDIA
-- =========================
create table if not exists product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  type text not null default 'screenshot' check (type in ('mockup', 'screenshot', 'banner', 'detail')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================
-- PRODUCT FEATURES
-- =========================
create table if not exists product_features (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  title text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================
-- PRODUCT SECTIONS
-- =========================
create table if not exists product_sections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  section_type text not null,
  title text,
  content jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- SERVICES
-- =========================
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  price_start numeric(12,2),
  estimated_duration text,
  icon text,
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- PROJECTS / CASE STUDIES
-- =========================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,
  problem text,
  solution text,
  result text,
  cover_image text,
  client_name text,
  industry text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- TESTIMONIALS
-- =========================
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  position text,
  message text not null,
  rating int not null default 5 check (rating between 1 and 5),
  avatar_url text,
  project_name text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================
-- FAQ
-- =========================
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- SITE SETTINGS
-- =========================
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  type text not null default 'text',
  updated_at timestamptz not null default now()
);

-- =========================
-- HOMEPAGE SECTIONS
-- =========================
create table if not exists homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_name text unique not null,
  title text,
  subtitle text,
  content jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- WHATSAPP SETTINGS
-- =========================
create table if not exists whatsapp_settings (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  default_message text not null,
  button_label text not null default 'Chat via WhatsApp',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- =========================
-- INQUIRIES
-- =========================
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  name text not null,
  email text,
  phone text,
  message text,
  interest_type text,
  source text not null default 'website' check (source in ('website', 'whatsapp', 'form')),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- ORDERS
-- =========================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  package_name text,
  budget numeric(12,2),
  requirements text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'done', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- INDEXES
-- =========================
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_status on products(status);
create index if not exists idx_products_featured on products(featured);
create index if not exists idx_product_media_product_id on product_media(product_id);
create index if not exists idx_product_features_product_id on product_features(product_id);
create index if not exists idx_inquiries_status on inquiries(status);
create index if not exists idx_orders_status on orders(status);

-- =========================
-- SEED: CATEGORIES
-- =========================
insert into categories (name, slug, description, icon, sort_order, is_active)
values
  ('Website Toko Online', 'website-toko-online', 'Website untuk jualan produk secara profesional.', 'shopping-bag', 1, true),
  ('Landing Page', 'landing-page', 'Halaman promosi yang fokus ke konversi.', 'rocket', 2, true),
  ('Company Profile', 'company-profile', 'Website profil perusahaan yang elegan.', 'building-2', 3, true),
  ('Aplikasi Android', 'aplikasi-android', 'Aplikasi Flutter untuk kebutuhan bisnis.', 'smartphone', 4, true)
on conflict (slug) do nothing;

-- =========================
-- SEED: PRODUCTS
-- =========================
insert into products (
  category_id, title, slug, short_description, full_description,
  price, discount_price, status, featured, cover_image,
  delivery_time, revision_count, tech_stack, whatsapp_message,
  seo_title, seo_description
)
select
  c.id,
  x.title,
  x.slug,
  x.short_description,
  x.full_description,
  x.price,
  x.discount_price,
  x.status,
  x.featured,
  x.cover_image,
  x.delivery_time,
  x.revision_count,
  x.tech_stack,
  x.whatsapp_message,
  x.seo_title,
  x.seo_description
from (
  values
    (
      'Website Toko Online Premium',
      'website-toko-online-premium',
      'Website toko online modern dengan tampilan premium, cepat, dan siap jual.',
      'Sistem toko online elegan untuk brand yang ingin terlihat profesional dan meningkatkan penjualan.',
      8500000,
      6500000,
      'published',
      true,
      'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
      '10-14 hari kerja',
      3,
      'Next.js, Supabase, Prisma, Tailwind, shadcn/ui',
      'Halo, saya tertarik dengan Website Toko Online Premium. Saya ingin konsultasi lebih lanjut.',
      'Website Toko Online Premium',
      'Website toko online premium untuk brand modern dengan tampilan profesional.'
    ),
    (
      'Landing Page Conversion Booster',
      'landing-page-conversion-booster',
      'Landing page fokus konversi untuk promosi jasa, produk, atau campaign.',
      'Cocok untuk jualan cepat dengan copywriting dan struktur yang mengarah ke aksi.',
      3500000,
      2500000,
      'published',
      true,
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      '5-7 hari kerja',
      2,
      'Next.js, Framer Motion, Tailwind, Supabase',
      'Halo, saya tertarik dengan Landing Page Conversion Booster. Saya ingin tahu detail paketnya.',
      'Landing Page Conversion Booster',
      'Landing page profesional untuk meningkatkan lead dan penjualan.'
    ),
    (
      'Company Profile Elegan',
      'company-profile-elegan',
      'Website company profile yang bersih, mewah, dan mudah dipercaya.',
      'Tampilan formal untuk perusahaan, instansi, dan brand yang ingin terlihat kredibel.',
      6000000,
      null,
      'published',
      false,
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
      '7-10 hari kerja',
      3,
      'Next.js, Prisma, Supabase, Tailwind',
      'Halo, saya tertarik dengan Company Profile Elegan. Saya ingin konsultasi.',
      'Company Profile Elegan',
      'Website company profile premium untuk bisnis dan institusi.'
    )
) as x(title, slug, short_description, full_description, price, discount_price, status, featured, cover_image, delivery_time, revision_count, tech_stack, whatsapp_message, seo_title, seo_description)
join categories c on c.slug = case 
  when x.slug = 'website-toko-online-premium' then 'website-toko-online'
  when x.slug = 'landing-page-conversion-booster' then 'landing-page'
  when x.slug = 'company-profile-elegan' then 'company-profile'
end
on conflict (slug) do nothing;

-- =========================
-- SEED: PRODUCT MEDIA
-- =========================
insert into product_media (product_id, image_url, alt_text, type, sort_order)
select p.id, m.image_url, m.alt_text, m.type, m.sort_order
from products p
join (
  values
    ('website-toko-online-premium', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', 'Mockup website toko online', 'mockup', 1),
    ('website-toko-online-premium', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', 'Screenshot dashboard toko online', 'screenshot', 2),
    ('landing-page-conversion-booster', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Mockup landing page', 'mockup', 1),
    ('company-profile-elegan', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', 'Mockup company profile', 'mockup', 1)
) as m(product_slug, image_url, alt_text, type, sort_order)
  on p.slug = m.product_slug
on conflict do nothing;

-- =========================
-- SEED: PRODUCT FEATURES
-- =========================
insert into product_features (product_id, title, description, icon, sort_order)
select p.id, f.title, f.description, f.icon, f.sort_order
from products p
join (
  values
    ('website-toko-online-premium', 'Desain premium', 'Visual bersih dan elegan untuk meningkatkan trust.', 'sparkles', 1),
    ('website-toko-online-premium', 'Checkout cepat', 'Alur pembelian dibuat singkat dan mudah.', 'shopping-cart', 2),
    ('website-toko-online-premium', 'Mobile friendly', 'Tampilan optimal di HP dan desktop.', 'smartphone', 3),
    ('landing-page-conversion-booster', 'Copywriting fokus aksi', 'Setiap section didesain untuk mendorong lead.', 'pen-tool', 1),
    ('landing-page-conversion-booster', 'CTA kuat', 'Tombol utama dibuat jelas dan strategis.', 'mouse-pointer-click', 2),
    ('company-profile-elegan', 'Citra profesional', 'Cocok untuk perusahaan dan instansi.', 'briefcase', 1)
) as f(product_slug, title, description, icon, sort_order)
  on p.slug = f.product_slug
on conflict do nothing;

-- =========================
-- SEED: SERVICES
-- =========================
insert into services (title, slug, description, price_start, estimated_duration, icon, featured, status)
values
  ('Pembuatan Website', 'pembuatan-website', 'Layanan pembuatan website premium dari nol.', 3500000, '7-14 hari', 'globe', true, 'published'),
  ('Redesign Website', 'redesign-website', 'Mengubah website lama menjadi lebih modern dan meyakinkan.', 2500000, '5-10 hari', 'brush', true, 'published'),
  ('Integrasi WhatsApp', 'integrasi-whatsapp', 'Pasang tombol dan alur WhatsApp yang terhubung ke lead.', 750000, '1-2 hari', 'message-circle', false, 'published'),
  ('Aplikasi Flutter', 'aplikasi-flutter', 'Pembuatan aplikasi Android Flutter untuk bisnis.', 8000000, '14-30 hari', 'smartphone', false, 'published')
on conflict (slug) do nothing;

-- =========================
-- SEED: PROJECTS
-- =========================
insert into projects (title, slug, summary, problem, solution, result, cover_image, client_name, industry, is_featured, is_published, published_at)
values
  (
    'Online Store Premium untuk Brand Fashion',
    'online-store-premium-brand-fashion',
    'Website toko online dengan tampilan mewah dan alur pembelian cepat.',
    'Brand kesulitan terlihat premium dan proses order sebelumnya terlalu manual.',
    'Dibuatkan website toko online modern dengan katalog rapi, detail produk, dan CTA WhatsApp.',
    'Brand terlihat lebih profesional dan inquiry naik karena tampilan lebih meyakinkan.',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
    'Fashion Studio',
    'Fashion',
    true,
    true,
    now()
  ),
  (
    'Landing Page Kampanye Jasa',
    'landing-page-kampanye-jasa',
    'Landing page fokus konversi untuk promosi jasa.',
    'Halaman lama terlalu umum dan tidak mengarahkan user ke CTA.',
    'Struktur dibuat ulang dengan section yang langsung memandu user ke kontak.',
    'CTR CTA meningkat karena halaman terasa lebih jelas dan meyakinkan.',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    'Creative Agency',
    'Agency',
    true,
    true,
    now()
  )
on conflict (slug) do nothing;

-- =========================
-- SEED: TESTIMONIALS
-- =========================
insert into testimonials (name, company, position, message, rating, avatar_url, project_name, is_published, sort_order)
values
  (
    'Alya Putri',
    'Fashion Studio',
    'Owner',
    'Tampilannya sangat premium dan klien kami jadi lebih percaya saat melihat portfolio.',
    5,
    'https://i.pravatar.cc/150?img=47',
    'Online Store Premium untuk Brand Fashion',
    true,
    1
  ),
  (
    'Rizky Pratama',
    'Creative Agency',
    'Founder',
    'Struktur landing page-nya rapi dan sangat membantu meningkatkan lead masuk.',
    5,
    'https://i.pravatar.cc/150?img=12',
    'Landing Page Kampanye Jasa',
    true,
    2
  )
on conflict do nothing;

-- =========================
-- SEED: FAQ
-- =========================
insert into faqs (question, answer, sort_order, is_active)
values
  ('Apakah semua konten bisa diubah dari backend?', 'Ya, produk, layanan, testimonial, FAQ, homepage, dan setting utama dapat dikelola dari database/admin.', 1, true),
  ('Apakah website ini support login/register?', 'Ya, menggunakan Supabase Auth untuk register, login, dan reset password.', 2, true),
  ('Bisa integrasi WhatsApp?', 'Bisa, tombol WhatsApp dan inquiry flow dapat disesuaikan dari settings.', 3, true)
on conflict do nothing;

-- =========================
-- SEED: SITE SETTINGS
-- =========================
insert into site_settings (key, value, type)
values
  ('brand_name', '"Create Studio"', 'text'),
  ('brand_tagline', '"Premium digital solutions for modern businesses"', 'text'),
  ('whatsapp_number', '"6281234567890"', 'text'),
  ('email', '"hello@createstudio.com"', 'text'),
  ('primary_cta', '"Konsultasi via WhatsApp"', 'text'),
  ('secondary_cta', '"Lihat Portfolio"', 'text')
on conflict (key) do nothing;

-- =========================
-- SEED: HOME PAGE SECTIONS
-- =========================
insert into homepage_sections (section_name, title, subtitle, content, sort_order, is_active)
values
  (
    'hero',
    'Bangun Website Premium yang Jualan',
    'Showcase website dan aplikasi yang terlihat profesional, modern, dan siap dipasarkan.',
    '{"primaryCta":"Konsultasi Sekarang","secondaryCta":"Lihat Produk"}',
    1,
    true
  ),
  (
    'featured_products',
    'Produk Unggulan',
    'Beberapa produk terbaik yang bisa langsung ditampilkan di homepage.',
    '{"layout":"grid"}',
    2,
    true
  )
on conflict (section_name) do nothing;

-- =========================
-- SEED: WHATSAPP SETTINGS
-- =========================
insert into whatsapp_settings (phone_number, default_message, button_label, is_active)
values
  ('6281234567890', 'Halo, saya ingin konsultasi tentang website/produk digital.', 'Chat via WhatsApp', true)
on conflict do nothing;
```

---

# 14) CATATAN IMPLEMENTASI UNTUK AI/ENGINEER

Saat membangun proyek ini, AI/engineer harus memastikan:

## Frontend

* semua halaman responsif
* desain premium light theme
* grid produk rapi
* detail produk visual
* CTA kuat
* animasi halus

## Backend

* CRUD lengkap berjalan
* auth aktif
* RLS aman
* storage aktif
* upload media berjalan
* data bisa diubah tanpa edit kode

## Data flow

* homepage membaca dari `homepage_sections`
* settings global dari `site_settings`
* produk dari `products`
* media dari `product_media`
* testimonial dari `testimonials`
* inquiry dari `inquiries`
* WhatsApp dari `whatsapp_settings`

---

# 15) PRIORITAS PEMBUATAN

Urutan pengerjaan terbaik:

1. setup project Next.js + Tailwind + shadcn
2. setup Supabase Auth + Prisma
3. buat database schema
4. buat seed data dummy
5. buat homepage
6. buat katalog produk
7. buat detail produk
8. buat services dan projects
9. buat login/register
10. buat admin dashboard
11. buat CRUD semua entity
12. buat upload media
13. buat WhatsApp integration
14. rapikan SEO dan performance

---

# 16) HASIL AKHIR YANG DIHARAPKAN

Website final harus terasa seperti:

* studio digital premium
* katalog produk meyakinkan
* landing page yang fokus konversi
* brand yang terpercaya
* mudah dikelola dari backend
* siap dikembangkan lebih lanjut

**Selesai.**

Dokumen ini bisa langsung dipakai sebagai master brief untuk membangun project penuh, lalu file `database.sql` bisa diambil dari bagian SQL di atas dan dijadikan seed awal.