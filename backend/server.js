const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------
   REDIRECT: any *.html URL → clean URL  (301 permanent)
   Must be placed BEFORE express.static so static never
   serves .html files directly.
   Examples:
     /index.html    → /
     /services.html → /services
     /login.html    → /login
------------------------------------------------------- */
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    let clean = req.path.slice(0, -5); // strip .html
    if (clean === '/index' || clean === '') clean = '/';
    return res.redirect(301, clean);
  }
  next();
});

/* strip trailing slashes (except root) */
app.use((req, res, next) => {
  if (req.path !== '/' && req.path.endsWith('/')) {
    return res.redirect(301, req.path.slice(0, -1));
  }
  next();
});

/* -------------------------------------------------------
   Static assets: CSS, JS, images — NOT .html files
   redirect:false prevents /blog → /blog/ when blog/ dir exists
------------------------------------------------------- */
app.use(express.static(path.join(__dirname, '../public'), { redirect: false }));

/* -------------------------------------------------------
   API Routes
------------------------------------------------------- */
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/services', require('./routes/services'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/gallery',  require('./routes/gallery'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'vTechZone API is running!' });
});


/* -------------------------------------------------------
   Clean URL page routes (no .html in the browser)
------------------------------------------------------- */
const pages = {
  '/':          'index.html',
  '/services':  'services.html',
  '/projects':  'projects.html',
  '/photos':    'photos.html',
  '/blog':      'blog.html',
  '/contact':   'contact.html',
  '/login':     'login.html',
  '/signup':    'signup.html',
  '/dashboard': 'dashboard.html',
  '/admin':     'admin.html',
};

const blogPosts = {
  '/blog/laptop-speed-tips':       'blog/laptop-speed-tips.html',
  '/blog/ssd-upgrade-guide':       'blog/ssd-upgrade-guide.html',
  '/blog/laptop-overheating-fix':  'blog/laptop-overheating-fix.html',
  '/blog/bca-project-guide':       'blog/bca-project-guide.html',
  '/blog/hard-drive-health-guide': 'blog/hard-drive-health-guide.html',
};

Object.entries({ ...pages, ...blogPosts }).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', file));
  });
});

/* -------------------------------------------------------
   404 fallback — unknown routes go to home
------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

/* -------------------------------------------------------
   Global error handler
------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 vTechZone server running → http://localhost:${PORT}`);
});
