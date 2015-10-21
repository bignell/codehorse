var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var del = require('del');
var ghPages = require('gulp-gh-pages');

gulp.task('sass', function(){
  return gulp.src('src/**/*.sass')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(prefix('last 3 versions'))
    .pipe(gulp.dest('_build/'));
});

gulp.task('copy', function(){
  return gulp.src(['src/**/*', '!src/**/*.sass']) // TODO: replace when add uglifying
    .pipe(gulp.dest('_build/'));
});

gulp.task('clean', function(){ return del('_build/**/*'); });

gulp.task('build', ['sass', 'copy']);

gulp.task('deploy', ['build'], function(){
  return gulp.src('_build/**/*')
    .pipe(ghPages());
});
