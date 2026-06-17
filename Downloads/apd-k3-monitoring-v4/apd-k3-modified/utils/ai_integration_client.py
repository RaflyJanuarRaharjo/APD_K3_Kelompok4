import os
import json
import mimetypes
import requests

class K3IntegrationClient:
    def __init__(self, base_url=None):
        if base_url is None:
            # Mengutamakan BACKEND_URL dari Docker, jika kosong fallback ke localhost
            base_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        self.base_url = base_url
        self.url = f"{base_url}/api/v1/violations"
        self.api_key = os.getenv("API_KEY", "K3_SecretKey_2026")

    def send_violation(self, violation_types, confidence, image_path, area="Area A", camera="Kamera 1"):
        if isinstance(violation_types, str):
            violation_types = [violation_types]

        # 🔥 FIX 1: Bypass pengecekan fisik file agar tidak mampet akibat perbedaan WORKDIR Docker
        # Jalur data dari kamera live dipaksa loss langsung meluncur ke backend API
        
        # Amankan penyusunan payload Form-Data (Wajib String untuk FastAPI Form)
        payload = {
            'violations' : json.dumps(violation_types),
            'confidence' : str(confidence) if confidence is not None else "0.0",
            'area'       : str(area),
            'camera'     : str(camera),
        }

        headers = {"X-API-Key": self.api_key}

        # Periksa apakah file gambar fisik benar-benar valid sebelum dikirim
        if image_path and os.path.exists(image_path):
            mime_type, _ = mimetypes.guess_type(image_path)
            if mime_type is None:
                mime_type = 'image/jpeg'
                
            try:
                with open(image_path, 'rb') as img_file:
                    files = {
                        'image': (os.path.basename(image_path), img_file, mime_type)
                    }
                    print(f"📡 [CLIENT] Mengirim data + gambar ke backend: {self.url}")
                    response = requests.post(
                        self.url,
                        data=payload,
                        files=files,
                        headers=headers,
                        timeout=10
                    )
            except Exception as e:
                print(f"❌ [CLIENT] Gagal memproses file gambar: {e}")
                return None
        else:
            # 🔥 FIX 2: Fallback system jika gambar tidak ditemukan, data teks pelanggaran TETAP dikirim ke DB
            try:
                print(f"📡 [CLIENT] Gambar tidak terbaca di kontainer dashboard. Mengirim data teks saja ke: {self.url}")
                response = requests.post(
                    self.url,
                    data=payload,
                    headers=headers,
                    timeout=10
                )
            except requests.exceptions.ConnectionError:
                print("❌ [CLIENT] Backend tidak terjangkau (Mode Teks).")
                return None

        # Penanganan umpan balik (Response Handling)
        try:
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✅ [CLIENT] Berhasil disimpan! Jenis: {violation_types} | ID Kasus: {data.get('id', '?')}")
                return data
            else:
                print(f"⚠️ [CLIENT] Ditolak Backend! Status: {response.status_code} | Respon: {response.text}")
                return None
        except Exception as e:
            print(f"❌ [CLIENT] Error parsing response: {e}")
            return None