# AXCORA MEDIA FORGE

![AXCORA MEDIA FORGE](convert/axcora-media-forge.webp)

CORE: www.axcora.com

LAB: www.axcora.my.id

THEMES: www.hockeycomputindo.com/themes

ART: www.creativitas.dev

## 🚀 Media Compressor for Web Performance

Compress images to **WebP** and videos to **MP4** automatically while preserving your folder structure.  
Optimized to boost **Lighthouse** scores — smaller files, faster loading.

---

## ✨ Features

- Images → WebP (quality ~75%, smart resize to 1200px max width)
- Videos → MP4 (bitrate 500k, CRF 28, resize to 1280px max width)
- Preserves subfolder hierarchy
- No global ffmpeg install required
- Recursive scanning of all files inside `convert/`

---

## 📦 Requirements

- Node.js
- npm

---

## 🔧 Installation

```bash
npm init -y
npm install sharp fluent-ffmpeg @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe
```

---

## 📁 Folder Structure

```
your-project/
├── convert/          ← put original files here (subfolders allowed)
├── media/            ← compressed output here (same structure)
└── compress.js       ← main script
```

---

## 🚀 Usage

1. Place your images/videos inside `convert/`.
2. Run:

```bash
node compress.js
```

3. Check `media/` for compressed files.

---

## ⚙️ Configuration

Edit these variables at the top of `compress.js`:

| Variable            | Description                         | Default |
|---------------------|-------------------------------------|---------|
| `WEBP_QUALITY`      | WebP quality (70–80)               | 75      |
| `MAX_IMAGE_WIDTH`   | Max image width in pixels          | 1200    |
| `VIDEO_BITRATE`     | Video bitrate (e.g. '500k')        | '500k'  |
| `VIDEO_CRF`         | CRF value (23–30, higher = smaller)| 28      |
| `VIDEO_MAX_WIDTH`   | Max video width in pixels          | 1280    |

---

## 🛠 Troubleshooting

- If ffmpeg errors appear, check the `ffmpeg stderr:` logs in the console.
- On Windows, ffmpeg is installed locally — no PATH setup needed.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

Happy compressing! 🎯

----


CORE: www.axcora.com

LAB: www.axcora.my.id

THEMES: www.hockeycomputindo.com/themes

ART: www.creativitas.dev