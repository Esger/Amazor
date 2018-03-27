import gulp from 'gulp';
import changedInPlace from 'gulp-changed-in-place';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import less from 'gulp-less';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import project from '../aurelia.json';
import { build } from 'aurelia-cli';

export default function processCSS() {

    let processors = [
        autoprefixer({ browsers: ['last 2 versions'] })
    ];

    return gulp.src(project.cssProcessor.source)
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
        .pipe(sourcemaps.init())
        .pipe(concat('app.less'))
        .pipe(less())
        .pipe(postcss(processors))
        .pipe(gulp.dest('assets/'));
} 