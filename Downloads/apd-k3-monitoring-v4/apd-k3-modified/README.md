# 🦺 K3In APD Control Hub

[![AI Core Ready](https://img.shields.io/badge/Core%20AI-Ready-emerald?style=flat-package\&logo=opencv)](#)
[![Docker Orchestration](https://img.shields.io/badge/Docker%20Compose-Integrated-blue?style=flat-package\&logo=docker)](#)
[![Framework](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-package\&logo=fastapi)](#)
[![Frontend](https://img.shields.io/badge/Frontend-Streamlit-FF4B4B?style=flat-package\&logo=streamlit)](#)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-package\&logo=postgresql)](#)

## 📖 Deskripsi

**K3In APD Control Hub** merupakan sistem monitoring kepatuhan penggunaan Alat Pelindung Diri (APD) berbasis *Artificial Intelligence* dan *Computer Vision* yang dirancang untuk mendukung implementasi Keselamatan dan Kesehatan Kerja (K3) pada lingkungan industri.

Sistem memanfaatkan model **YOLOv8** untuk mendeteksi penggunaan APD secara *real-time* melalui kamera, melakukan pelacakan objek (*object tracking*), serta mengidentifikasi pelanggaran penggunaan APD secara otomatis. Data pelanggaran yang terdeteksi kemudian dikirimkan ke layanan backend berbasis **FastAPI** dan disimpan secara permanen pada **PostgreSQL**.

Seluruh komponen aplikasi dijalankan menggunakan **Docker Compose** sehingga proses deployment dapat dilakukan secara konsisten dan portabel pada berbagai lingkungan sistem operasi tanpa permasalahan ketergantungan (*dependency management*).

Proyek ini dikembangkan oleh **Kelompok 04 – Program Studi Teknologi Informasi, Fakultas Ilmu Komputer, Universitas Brawijaya (2026)** sebagai simulasi penerapan teknologi kecerdasan buatan pada sistem pengawasan keselamatan kerja industri.

---

## ✨ Fitur Utama

* Deteksi penggunaan APD secara *real-time* menggunakan YOLOv8.
* Identifikasi pelanggaran penggunaan helm keselamatan (*helmet*).
* Identifikasi pelanggaran penggunaan rompi keselamatan (*safety vest*).
* Identifikasi pelanggaran penggunaan sepatu keselamatan (*safety boots*).
* Pelacakan objek (*tracking*) untuk mengurangi duplikasi pelaporan pelanggaran.
* Penyimpanan bukti visual secara otomatis.
* Pencatatan log pelanggaran ke database PostgreSQL.
* Dashboard monitoring berbasis Streamlit.
* REST API berbasis FastAPI.
* Arsitektur *microservices* berbasis Docker Compose.
* Visualisasi statistik dan riwayat pelanggaran.

---

## 🏗️ Arsitektur Sistem

Sistem terdiri atas tiga layanan utama yang saling terintegrasi.

### `apd_postgres`

Layanan basis data PostgreSQL yang bertanggung jawab menyimpan data pelanggaran, metadata sistem, dan riwayat aktivitas secara permanen.

### `apd_backend`

REST API berbasis FastAPI yang menangani proses komunikasi data, autentikasi, pengelolaan bukti visual, serta integrasi dengan database.

### `apd_dashboard`

Dashboard berbasis Streamlit yang menyediakan antarmuka pengguna untuk monitoring kamera secara *real-time*, visualisasi statistik pelanggaran, serta peninjauan bukti visual.

---

## 🛠️ Teknologi yang Digunakan

### Artificial Intelligence & Computer Vision

* YOLOv8
* OpenCV
* Ultralytics

### Backend

* Python
* FastAPI
* SQLAlchemy

### Frontend

* Streamlit

### Database

* PostgreSQL

### DevOps & Deployment

* Docker
* Docker Compose

---

## 📋 Prasyarat Sistem

Pastikan perangkat telah memenuhi kebutuhan berikut sebelum melakukan instalasi.

### Sistem Operasi

* Ubuntu / Pop!_OS (Direkomendasikan)
* Windows 11 (WSL2)
* macOS

### Perangkat Keras

* Webcam internal atau eksternal
* RAM minimal 8 GB
* Prosesor yang mendukung pemrosesan AI ringan

### Docker

Verifikasi instalasi Docker:

```bash
docker --version
```

Verifikasi Docker Compose:

```bash
docker compose version
```

### Git

Verifikasi instalasi Git:

```bash
git --version
```

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/apd_project.git
cd apd_project
```

### 2. Menyiapkan Model AI

Tempatkan file model hasil pelatihan bernama:

```text
best.pt
```

pada direktori utama proyek.

Contoh struktur direktori:

```text
apd_project/
├── best.pt
├── docker-compose.yml
├── backend/
├── dashboard/
└── ...
```

Model yang digunakan harus mendukung kelas berikut:

```text
boots
helmet
no boots
no helmet
no vest
person
vest
```

### 3. Menyiapkan Direktori Penyimpanan Bukti

Buat direktori penyimpanan gambar:

```bash
mkdir -p captures
```

Atur hak akses direktori:

```bash
sudo chmod -R 777 captures/
```

### 4. Menjalankan Sistem

Bangun dan jalankan seluruh layanan:

```bash
docker compose up -d --build
```

Docker akan secara otomatis:

* Mengunduh image yang dibutuhkan.
* Menginstal dependensi aplikasi.
* Membuat jaringan internal antar layanan.
* Menjalankan PostgreSQL.
* Menjalankan FastAPI Backend.
* Menjalankan Streamlit Dashboard.

---

## 🌐 Akses Layanan

### Dashboard Monitoring

```text
http://localhost:8501
```

Digunakan untuk monitoring kamera secara *real-time*, visualisasi data, dan pengelolaan sistem.

### Dokumentasi API

```text
http://localhost:8000/docs
```

Menyediakan dokumentasi interaktif Swagger UI untuk pengujian endpoint API.

### PostgreSQL Database

```text
localhost:5432
```

Digunakan sebagai basis data utama sistem.

---

## 🧪 Pengujian Sistem

1. Buka dashboard pada alamat:

```text
http://localhost:8501
```

2. Masukkan *Administrator Access Key*.

Contoh:

```text
admin123
```

3. Aktifkan kamera melalui panel kontrol.

4. Izinkan browser mengakses webcam.

5. Lakukan simulasi penggunaan maupun pelanggaran APD.

6. Sistem akan secara otomatis:

   * Melakukan deteksi objek secara *real-time*.
   * Mengidentifikasi pelanggaran APD.
   * Menyimpan bukti visual.
   * Mengirim data pelanggaran ke PostgreSQL.
   * Menampilkan informasi pada dashboard.

7. Buka menu **Riwayat Audit Log** atau **Galeri Bukti Visual** untuk melihat hasil pencatatan yang telah tersimpan.

---

## ⚙️ Manajemen Infrastruktur

### Melihat Log Container

```bash
docker compose logs -f apd_dashboard
```

### Menghentikan Layanan Sementara

```bash
docker compose stop
```

### Mematikan Seluruh Sistem

```bash
docker compose down
```

### Menghapus Seluruh Data dan Volume

> ⚠️ Peringatan: Perintah berikut akan menghapus seluruh data pelanggaran secara permanen.

```bash
docker compose down -v
```

### Memeriksa Isi Database

```bash
docker exec -it apd_postgres \
psql -U postgres -d apd_monitor \
-c "SELECT * FROM violations;"
```

---

## 📂 Struktur Direktori

```text
apd_project/
│
├── backend/
├── dashboard/
├── captures/
├── best.pt
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## 👨‍💻 Tim Pengembang

**Kelompok 04**
Program Studi Teknologi Informasi
Fakultas Ilmu Komputer
Universitas Brawijaya
2026

---

## 📄 Lisensi

Proyek ini dikembangkan untuk tujuan akademik dan penelitian dalam lingkungan pembelajaran Program Studi Teknologi Informasi, Fakultas Ilmu Komputer, Universitas Brawijaya.


## 📄 Lampiran

https://drive.google.com/drive/folders/1EM0kmI7ZeDi3g0FbFihSYOfm3cgGAKq0
