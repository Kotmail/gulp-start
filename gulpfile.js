'use strict';

var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    imageop = require('gulp-image-optimization'),
    sprite = require('gulp.spritesmith'),
    deleting = require('del'),
    merge = require('merge-stream');


/***
 * CONNECT
 ***/

gulp.task('connect', function(){
    connect.server({
        root: 'app',
        livereload: true
    });
});


/***
 * HTML
 ***/

gulp.task('html', function(){
    gulp.src('./app/*.html')
        .pipe(connect.reload());
});


/***
 * SASS
 ***/

gulp.task('sass', function(){
    gulp.src('./app/sass/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(csso())
        .pipe(gulp.dest('./app/'))
        .pipe(connect.reload());
});


/***
 * COPY
 ***/

gulp.task('copy', function () {
    return gulp
        .src('./app/fonts/**/*.{ttf,woff,eot,svg}')
        .pipe(gulp.dest('dist/fonts'))
});


/***
 * IMAGES OPTIMIZATION
 ***/

gulp.task('images', function(){
    gulp.src('./app/images/**/*.+(png|jpg|gif|jpeg)')
        .pipe(imageop({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('./dist/images'));
});


/***
 * SPRITES
 ***/

gulp.task('sprite', function(){
    var spriteData = gulp.src('./app/images/icons/*.png')
        .pipe(sprite({
            imgName: 'sprite.png',
            cssName: 'sprite.scss',
            algorithm: 'top-down',
            padding: 20
        }));

    var imgStream = spriteData.img
        .pipe(gulp.dest('./app/images/'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('./app/sass/components/'));

    return merge(imgStream, cssStream);
});


/***
 * CLEAN DIST
 ***/

gulp.task('clean', function(){
    return deleting(['dist/']);
});


/***
 * BOWER
 ***/

gulp.task('bower', function(){
    gulp.src('./app/index.html')
        .pipe(wiredep({
            directory: "app/bower_components"
        }))
        .pipe(gulp.dest('./app'));
});


/***
 * BUILD
 ***/

gulp.task('build', ['images', 'copy'], function(){
    var assets = useref.assets();

    return gulp.src('./app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleanCSS()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});


/***
 * WATCH
 ***/

gulp.task('watch', function(){
    gulp.watch('bower.json', ['bower']);
    gulp.watch('./app/*.html', ['html']);
    gulp.watch('./app/sass/style.scss', ['sass']);
});


/***
 * DEFAULT TASK
 ***/

gulp.task('default', ['clean', 'connect', 'watch']);