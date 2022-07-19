const { src, dest, watch, parallel, series } = require('gulp')

const BASE_PATH = 'app'
const DIST_PATH = 'dist'
const GITHUB_PAGES_PATH = 'docs'

const sass = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const del = require('del')
const browserSync = require('browser-sync').create()

const makeGithubPages = () => src(`${DIST_PATH}/**/*`).pipe(dest(GITHUB_PAGES_PATH))

function browsersync() {
  browserSync.init({
    server: {
      baseDir: `${BASE_PATH}/`,
    },
  })
}

function styles() {
  return src(`${BASE_PATH}/scss/style.scss`)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true,
    }))
    .pipe(dest(`${BASE_PATH}/css`))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    `${BASE_PATH}/js/main.js`,
  ])

    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest(`${BASE_PATH}/js`))
    .pipe(browserSync.stream())
}

function images() {
  return src(`${BASE_PATH}/images/**/*.*`)
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false },
        ],
      }),
    ]))
    .pipe(dest(`${DIST_PATH}/images`))
}

const fonts = () => src(`${BASE_PATH}/fonts/*.{woff,woff2}`).pipe(dest(`${DIST_PATH}/fonts`))

function build() {
  return src([
    `${BASE_PATH}/**/*.html`,
    `${BASE_PATH}/css/style.min.css`,
    `${BASE_PATH}/js/main.min.js`,
  ], { base: BASE_PATH })
    .pipe(dest(DIST_PATH))
}

function cleanDist() {
  return del(DIST_PATH)
}

function watching() {
  watch([`${BASE_PATH}/scss/**/*.scss`], styles)
  watch([`${BASE_PATH}/js/**/*.js`, `!${BASE_PATH}/js/main.min.js`], scripts)
  watch([`${BASE_PATH}/**/*.html`]).on('change', browserSync.reload)
}

exports.styles = styles
exports.scripts = scripts
exports.browsersync = browsersync
exports.watching = watching
exports.images = images
exports.cleanDist = cleanDist

exports.build = series(cleanDist, images, fonts, build, makeGithubPages)
exports.default = parallel(styles, scripts, browsersync, watching)