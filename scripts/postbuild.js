import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.log('dist/index.html not found, skipping postbuild');
  process.exit(0);
}

const indexContent = fs.readFileSync(indexHtmlPath, 'utf-8');

// 1. Create 404.html for SPA static hosting fallback
fs.writeFileSync(path.join(distDir, '404.html'), indexContent, 'utf-8');

// 2. Create static entrypoints for /blog and /blog.html
const blogDir = path.join(distDir, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}
fs.writeFileSync(path.join(blogDir, 'index.html'), indexContent, 'utf-8');
fs.writeFileSync(path.join(distDir, 'blog.html'), indexContent, 'utf-8');

// 3. Create static entrypoint for /admin and /admin.html
const adminDir = path.join(distDir, 'admin');
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}
fs.writeFileSync(path.join(adminDir, 'index.html'), indexContent, 'utf-8');
fs.writeFileSync(path.join(distDir, 'admin.html'), indexContent, 'utf-8');

// 4. Create static directories and .html files for known blog slugs
const dbPath = path.join(rootDir, 'data', 'db.json');
let posts = [
  { slug: 'national-means-cum-merit-scholarship-scheme' },
  { slug: 'pm-usp-central-sector-scheme-of-scholarship-for-college-and-university-students-csss' }
];

if (fs.existsSync(dbPath)) {
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.posts) && parsed.posts.length > 0) {
      posts = parsed.posts;
    }
  } catch (e) {
    // fallback
  }
}

posts.forEach((post) => {
  if (post.slug) {
    const postDir = path.join(blogDir, post.slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    fs.writeFileSync(path.join(postDir, 'index.html'), indexContent, 'utf-8');
    fs.writeFileSync(path.join(blogDir, `${post.slug}.html`), indexContent, 'utf-8');
  }
});

console.log('Postbuild static SPA routes (.html and /index.html) generated successfully in dist/');
