# 📱 Sosyal Ajanda

Sosyal Ajanda, sadece etkinliklerini planlayabileceğin bir ajanda değil; aynı zamanda yeni insanlarla tanışabileceğin, ortak etkinliklerde buluşabileceğin sosyal ve dating odaklı bir PWA uygulamasıdır.

![Sosyal Ajanda Preview](sosyal_ajanda_preview.png)

## ✨ Özellikler

- 📅 **Etkinlik ekleme ve yönetme** - Kendi etkinliklerini oluştur ve yönet
- 🗺️ **Harita üzerinden konum paylaşma** - Leaflet + React Leaflet ile interaktif harita
- ❤️ **Ortak ilgi alanlarına göre eşleşme** - Benzer ilgi alanlarına sahip kişilerle tanış
- 📖 **Günlük sistemi** - Günlük yazabilir, arkadaşlarının günlüklerini okuyabilirsin
- 👥 **Arkadaş ağı** - Arkadaş ekle, mention sistemi ile etkileşim kur
- 📆 **Gelişmiş tarih işlemleri** - date-fns ile optimize edilmiş tarih yönetimi
- ⚡ **Hızlı ve optimize geliştirme** - Vite ile lightning-fast development
- 🔀 **Sayfa yönlendirme** - React Router ile smooth navigation
- 📦 **PWA desteği** - vite-plugin-pwa + workbox-window ile offline çalışma
- 🖼️ **Modern ikon setleri** - lucide-react ile beautiful icons
- 🎨 **Responsive tasarım** - Mobil ve desktop uyumlu modern UI

## 🛠️ Kullanılan Teknolojiler

- **React 19** & **React DOM** - Modern React framework
- **Vite 7** - Next generation frontend tooling
- **React Router DOM 7** - Declarative routing
- **Leaflet & React-Leaflet** - Interactive maps
- **date-fns** - Modern JavaScript date utility library
- **vite-plugin-pwa, workbox-window** - Progressive Web App features
- **ESLint** - Code quality and consistency
- **lucide-react** - Beautiful & consistent icons

## 🚀 Kurulum

### Depoyu klonla
```bash
git clone https://github.com/Burakmakend/diarydateapp.git
cd diarydateapp
```

### Bağımlılıkları yükle
```bash
npm install
```

### Geliştirme sunucusunu başlat
```bash
npm run dev
```

### Production build oluştur
```bash
npm run build
```

### Build önizlemesi
```bash
npm run preview
```

## 📜 Script'ler

- `npm run dev` – Geliştirme sunucusu (http://localhost:5173)
- `npm run build` – Production build oluşturma
- `npm run preview` – Build önizleme
- `npm run lint` – Kod kalitesi kontrolü

## 🎯 Nasıl Çalışır?

1. **📝 Kayıt Ol / Giriş Yap** → Kullanıcılar kendi profillerini oluşturur
2. **📅 Etkinlik Ekle** → Tarih, saat, konum ve açıklama girerek etkinlik eklenir
3. **📖 Günlük Yaz** → Günlük deneyimlerini paylaş, arkadaşlarının günlüklerini oku
4. **👥 Arkadaş Ağı** → Arkadaşların etkinliklerini görebilir, ortak etkinlik planlayabilirsin
5. **💕 Eşleşme Sistemi** → Ortak ilgi alanlarına göre yeni kişilerle tanışma imkânı
6. **🗺️ Konum Bazlı Keşif** → Harita üzerinden yakınındaki etkinlikleri keşfedip katılabilirsin
7. **📱 PWA Özelliği** → Uygulama telefonun ana ekranına eklenebilir, çevrimdışı çalışabilir

## 📱 Özellik Detayları

### 🏠 Ana Sayfa
- Günlük widget'ı ile hızlı günlük yazma
- Yaklaşan etkinliklerin özeti
- Arkadaş aktiviteleri feed'i

### 📅 Etkinlik Yönetimi
- Detaylı etkinlik oluşturma formu
- Kategori bazlı filtreleme (Spor, Sanat, Teknoloji, vb.)
- Tarih, popülerlik ve yenilik bazlı sıralama
- Konum seçici ile harita entegrasyonu

### 📖 Günlük Sistemi
- Rich text editor ile günlük yazma
- Mention sistemi (@kullaniciadi)
- Günlük feed'i ile arkadaş günlüklerini okuma
- Kategori bazlı günlük filtreleme

### 👥 Sosyal Özellikler
- Arkadaş ekleme ve yönetme
- Kullanıcı profil sayfaları
- Mention bildirimleri
- Aktivite takibi

### 🗺️ Harita Entegrasyonu
- Interactive Leaflet harita
- Etkinlik konumlarının görselleştirilmesi
- Konum bazlı etkinlik filtreleme
- Gerçek zamanlı konum paylaşımı

## 🎨 Ekran Görüntüleri

*Daha fazla ekran görüntüsü için screenshots klasörüne bakabilirsiniz.*

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Burak Özdemir**

- 📧 Email: [burakkozdemir@example.com](mailto:burakkozdemir@example.com)
- 📱 Instagram: [@burakoozdemirl](https://instagram.com/burakoozdemirl)
- 💼 LinkedIn: [burak-özdemir-58872521a](https://linkedin.com/in/burak-özdemir-58872521a)
- 🐙 GitHub: [@Burakmakend](https://github.com/Burakmakend)

---

<div align="center">
  <p>Built with ❤️ using</p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</div>

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
