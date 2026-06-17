const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

// ---- Use ffmpeg-installer (no global install needed) ----
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// ===================== OPTIMAL CONFIGURATION =====================
const INPUT_DIR = path.join(__dirname, 'convert');   // source folder (can have subfolders)
const OUTPUT_DIR = path.join(__dirname, 'media');    // output folder

// Image settings
const WEBP_QUALITY = 75;           // WebP quality (70-80 is sweet spot)
const MAX_IMAGE_WIDTH = 1200;      // resize if image width exceeds this

// Video settings
const VIDEO_BITRATE = '500k';
const VIDEO_CRF = 28;              // higher = smaller file
const VIDEO_MAX_WIDTH = 1280;      // max width, height auto
const VIDEO_CODEC = 'libx264';     // or 'libx265' if supported

// Supported extensions
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
const VIDEO_EXTS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

// =================================================================

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Recursively get all files from a directory
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * Compress image to WebP only
 */
async function compressImage(filePath, outputDir) {
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const relativePath = path.relative(INPUT_DIR, filePath);
  const relativeDir = path.dirname(relativePath);
  const targetDir = path.join(outputDir, relativeDir);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const outputBase = path.join(targetDir, baseName);

  try {
    const metadata = await sharp(filePath).metadata();
    const resizeOptions = metadata.width > MAX_IMAGE_WIDTH
      ? { width: MAX_IMAGE_WIDTH, withoutEnlargement: true }
      : {};

    // WebP compression
    await sharp(filePath)
      .resize(resizeOptions)
      .webp({
        quality: WEBP_QUALITY,
        effort: 6,
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
      })
      .toFile(`${outputBase}.webp`);
    console.log(`✅ WebP: ${outputBase}.webp`);

    return true;
  } catch (err) {
    console.error(`❌ Failed to compress image ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Compress video to MP4 with low bitrate and resize
 */
function compressVideo(filePath, outputDir) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const relativePath = path.relative(INPUT_DIR, filePath);
    const relativeDir = path.dirname(relativePath);
    const targetDir = path.join(outputDir, relativeDir);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const outputPath = path.join(targetDir, `${baseName}.mp4`);
    const scaleFilter = `scale=${VIDEO_MAX_WIDTH}:-2`;

    const command = ffmpeg(filePath)
      .videoCodec(VIDEO_CODEC)
      .audioCodec('aac')
      .videoBitrate(VIDEO_BITRATE)
      .outputOptions([
        '-preset fast',
        `-crf ${VIDEO_CRF}`,
        `-vf ${scaleFilter}`,
        '-movflags +faststart',
        '-pix_fmt yuv420p'
      ]);

    // Show stderr for debugging
    command.on('stderr', (stderrLine) => {
      console.log('ffmpeg stderr:', stderrLine);
    });

    command.on('end', () => {
      console.log(`✅ Video: ${outputPath}`);
      resolve(outputPath);
    });

    command.on('error', (err) => {
      console.error(`❌ Failed to compress video ${filePath}:`, err.message);
      reject(err);
    });

    command.save(outputPath);
  });
}

/**
 * Process all files in INPUT_DIR recursively
 */
async function processAllFiles() {
  const files = getAllFiles(INPUT_DIR);
  console.log(`📂 Found ${files.length} files in "${INPUT_DIR}"`);

  let imageCount = 0, videoCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (IMAGE_EXTS.includes(ext)) {
      await compressImage(file, OUTPUT_DIR);
      imageCount++;
    } else if (VIDEO_EXTS.includes(ext)) {
      await compressVideo(file, OUTPUT_DIR);
      videoCount++;
    } else {
      console.log(`⏩ Skipped: ${file} (unsupported format)`);
    }
  }

  console.log(`\n✨ Done! ${imageCount} images and ${videoCount} videos compressed to "${OUTPUT_DIR}"`);
  console.log('📊 Files are now much smaller – ready for Lighthouse! 🚀');
}

// ========== EXECUTION ==========
processAllFiles().catch(console.error);