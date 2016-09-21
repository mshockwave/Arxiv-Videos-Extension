
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var merge = require('merge-stream');
var runSequence = require('run-sequence');

var DIST = 'dist';

var dist = function(subpath) {
    return !subpath ? DIST : path.join(DIST, subpath);
};

gulp.task('vulcanize', function(){
    return gulp.src('elements/elements.html')
        .pipe($.vulcanize({
            stripComments: true,
            inlineCss: true,
            inlineScripts: true
        }))
        .pipe($.crisper())
        .pipe(gulp.dest(dist('elements')));
});

gulp.task('copyImg', function(){
    return gulp.src([
        './img/**/*'
    ], {
        dot: true
    }).pipe(gulp.dest(dist('img')));
});
gulp.task('copy', function() {
    var app = gulp.src([
        './*',
        '!test',
        '!elements',
        '!bower_components',
        '!node_modules',
        '!dist',
        '!cache-config.json',
        '!**/.DS_Store',
        '!**/.idea'
    ], {
        dot: true
    }).pipe(gulp.dest(dist()));

    // Copy over only the bower_components we need
    // These are things which cannot be vulcanized
    var bower = gulp.src([
        'bower_components/{' +
        'webcomponentsjs,' +
        'platinum-sw,sw-toolbox,' +
        'promise-polyfill,' +
        'waypoints,' + 
        'jquery,jquery.scrollTo,' +
        'fetch' +
        '}/**/*'
    ]).pipe(gulp.dest(dist('bower_components')));

    return merge(app, bower);
});

gulp.task('build', function(callback){
    runSequence(
        'vulcanize',
        'copy',
        'copyImg',
        callback
    );
});
