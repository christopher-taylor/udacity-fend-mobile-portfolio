// Everything I know about gulp as well as basically this whole file is thanks
// to the fine tutorial at https://css-tricks.com/gulp-for-beginners/
require('es6-promise').polyfill();
var gulp = require('gulp'); // Requires node to load gulp.
var sass = require('gulp-sass'); // Sass processor plugin
var browserSync = require('browser-sync').create(); // Allows for live reload
var useref = require('gulp-useref'); // For concatenating JS
var uglify = require('gulp-uglify'); // Minify JS
var cssnano = require('gulp-cssnano'); // Minify CSS
var gulpIf = require('gulp-if'); // Allow conditionals in gulpfile.
var imagemin = require('gulp-imagemin'); // Allow image minification.
var cache = require('gulp-cache'); // Cache optimized images to reduce buildtime
var del = require('del'); // Clean dist before building.
var autoprefixer = require('gulp-autoprefixer'); // Add vendor specific prefixes
var uncss = require('gulp-uncss'); // Remove unused CSS
var runSequence = require('run-sequence'); // Synchronously run async tasks
var ngrok = require('ngrok'); // Allow the piping of local content remotely
var psi = require('psi'); // PageSpeed Insights
site = '';
var portVal = 3020; // allows up to 19 local hosts open without port conflicts

gulp.task('psi-browser-sync', function(){
  browserSync.init({
    server: {
      baseDir: 'src/'},
      port: portVal,
      open: false,
    })
})

gulp.task('psi', ['psi-browser-sync'], function() {
  // Set up a public tunnel so PageSpeed can see the local site.
  return ngrok.connect(portVal, function (err_ngrok, url) {
    site = url;
    console.log('ngrok - serving your site from ' + site);
    // Run PageSpeed once the tunnel is up.
    psi.output(site, {
      strategy: 'desktop',
      threshold: 80
    },
    function (err_psi, data) {
      // Log any potential errors and return a FAILURE.
      if (err_psi) {
        log(err_psi);
        process.exit(1);
      }
    });
    psi.output(site, {
      strategy: 'mobile',
      threshold: 80
    },
    function (err_psi, data) {
      // Log any potential errors and return a FAILURE.
      if (err_psi) {
        log(err_psi);
        process.exit(1);
      }
    });
  });
});

// Compile all scss to css.
gulp.task('sass', function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass()) // Runs scss files through the sass processor
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.reload({ // Refresh the browser tab.

      stream: true
    }))
});

// Start up a local server hosted in the project root.
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'src/'
    },
  })
})

gulp.task('buildCSS', function() {
  return gulp.src('src/css/**/*.css')
    .pipe(uncss({
      html: ['**/*.html']
    })) // Runs scss files through the sass processor
    .pipe()
    .pipe(cssnano())
});

// Read through all HTML files and run the build tasks laid out in them.
gulp.task('useref', function() {
  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify())) // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.css', uncss({
      html: ['dist/**/*.html']
    })))
    .pipe(gulpIf('*.css', autoprefixer({ // Add vendor specific prefixes to CSS
      browsers: ['last 2 versions'],
      cascade: false
    })))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

// Minify images.
gulp.task('images', function() {
  return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
});

// Copy fonts to dist.
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});

// Clean the dist folder.
gulp.task('clean:dist', function() {
  return del.sync('dist');
});

gulp.task('watch', function() {
  /* This line watches for changes to any .sscss file in any sub-directory of
  into a css folder. This is pretty dope. */
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
});

// Runs the build process.
gulp.task('build', function(callback) {
  runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'],
    callback
  )
})

// Compile CSS, spinup the local server, then start watching files.
gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
})
