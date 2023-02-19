const gulp = require('gulp');
const { src, dest, d } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoPrefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const rigger = require('gulp-rigger');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const panini = require('panini');

const path = {
  build: {
    html: './dist/',
    css: './dist',
    js: './dist',
    images: './dist/images/',
    fonts: './dist/fonts/',
  },
  src: {
    html: './src/pages/*.html',
    css: './src/styles/*.scss',
    js: './src/scripts/*.js',
    images: './src/assets/images/**/*.*',
    fonts: './src/assets/fonts/*.*',
  },
  watch: {
    html: './src/**/*.html',
    css: './src/styles/*.scss',
    js: './src/scripts/*.js',
    images: './src/assets/images/**/*.*',
    fonts: './src/assets/fonts/**/*.*',
  },
  clean: './dist',
};

function server() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: './dist',
    },
  });
}

function html() {
  panini.refresh();
  return src(path.src.html)
    .pipe(plumber())
    .pipe(
      panini({
        root: './src/pages',
        layouts: './src/templates/layouts',
        partials: './src/templates/partials',
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browserSync.reload({ stream: true }));
}

function css() {
  return src(path.src.css)
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoPrefixer())
    .pipe(cssnano())
    .pipe(concat('style.css'))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({ stream: true }));
}

function js() {
  return src(path.src.js)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(
      babel({
        presets: ['es2015'],
      })
    )
    .pipe(uglify())
    .pipe(concat('script.js'))
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({ stream: true }));
}

function images() {
  return src(path.src.images)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({ stream: true }));
}

function fonts() {
  return src(path.src.fonts).pipe(browserSync.reload({ stream: true }));
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  gulp.watch(path.watch.html, html);
  gulp.watch(path.watch.css, css);
  gulp.watch(path.watch.js, js);
  gulp.watch(path.watch.images, images);
  gulp.watch(path.watch.fonts, fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, server);

exports.watch = watch;
exports.build = build;
