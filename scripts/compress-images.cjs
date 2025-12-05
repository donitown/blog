
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const TARGET_DIR = path.join(__dirname, '../src/assets/photography');
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Helpers
const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function processFile(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size <= MAX_SIZE_BYTES) {
            return;
        }

        console.log(`\nFound large file: ${path.basename(filePath)} (${formatSize(stats.size)})`);
        console.log(`Processing...`);

        const ext = path.extname(filePath).toLowerCase();
        let pipeline = sharp(filePath);
        const metadata = await pipeline.metadata();

        // Initial strategy: Resize to 4K if larger, and apply moderate compression
        let width = metadata.width;
        if (width > 3840) {
            width = 3840;
            pipeline = pipeline.resize(width);
        }

        let quality = 85;
        let buffer;
        
        // Loop to find suitable parameters
        while (true) {
            if (ext === '.jpg' || ext === '.jpeg') {
                pipeline = pipeline.jpeg({ quality });
            } else if (ext === '.png') {
                // PNG is hard to compress under size limit without changing format or losing transparency
                // We try to use palette if possible or max compression
                pipeline = pipeline.png({ compressionLevel: 9, palette: true });
            } else if (ext === '.webp') {
                pipeline = pipeline.webp({ quality });
            }

            buffer = await pipeline.toBuffer();

            if (buffer.length < MAX_SIZE_BYTES) {
                break;
            }

            // If still too big, reduce quality or size
            if (quality > 50) {
                quality -= 10;
                console.log(`  Still > 5MB, reducing quality to ${quality}...`);
            } else if (width > 1920) {
                width = Math.floor(width * 0.8);
                console.log(`  Still > 5MB, resizing to width ${width}...`);
                // Re-create pipeline with new resize
                pipeline = sharp(filePath).resize(width);
            } else {
                console.warn(`  Warning: Could not compress ${path.basename(filePath)} under 5MB even with aggressive settings. Saving best effort.`);
                break;
            }
        }

        // Write back
        fs.writeFileSync(filePath, buffer);
        console.log(`Success! Compressed to ${formatSize(buffer.length)}`);

    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walkDir(filePath);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                processFile(filePath);
            }
        }
    }
}

console.log('Starting image compression scan...');
console.log(`Target Directory: ${TARGET_DIR}`);
console.log(`Size Limit: ${formatSize(MAX_SIZE_BYTES)}`);

if (fs.existsSync(TARGET_DIR)) {
    walkDir(TARGET_DIR);
    console.log('\nScan complete.');
} else {
    console.error(`Directory not found: ${TARGET_DIR}`);
}