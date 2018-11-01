/// ///////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
/// ///////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-01T14:19:14.279Z by masol (masol.li@gmail.com)

'use strict'
const gulp = require('gulp')
const browserify = require('browserify')
const buffer = require('gulp-buffer')
const uglify = require('gulp-uglify-es').default
const sourcemaps = require('gulp-sourcemaps')
const _ = require('underscore')
const babelify = require('babelify')
var source = require('vinyl-source-stream')
const fs = require('fs-extra')
const rename = require('gulp-rename')

const paths = {
  mainjs: {
    entry: 'src/index.js',
    modname: 'wwjs',
    unminified: 'wwjs.js',
    minified: 'wwjs.min.js',
    dest: 'dist'
  }
}

/// ////////////////////////////////////////
// helper function
/// ////////////////////////////////////////
function scripts (pathDefine) {
  return browserify()
    .require(pathDefine.entry, { entry: true,
      extensions: ['.js'],
      standalone: pathDefine.modname,
      debug: true
    })
    .transform(babelify, { presets: ['@babel/preset-env'] })
    .bundle()
    .pipe(source(pathDefine.unminified))
    .pipe(gulp.dest(pathDefine.dest))
    .pipe(rename(pathDefine.minified))
    .pipe(buffer())
    .pipe(sourcemaps.init({ largeFile: true, loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(pathDefine.dest))

  // return (
  //   gulp
  //     .src(pathDefine.src, { read: false })
  //     .pipe(tap(function (file) {
  //       console.log('bundling ' + file.path)
  //       // replace file contents with browserify's bundle stream
  //       file.contents = browserify(file.path, { debug: true }).bundle()
  //     }))
  //     // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
  //     .pipe(buffer())
  //     .pipe(sourcemaps.init({ largeFile: true, loadMaps: true }))
  //     .pipe(uglify())
  //   // .pipe(plumber())
  //     .pipe(closureCompiler({
  //       compilation_level: 'ADVANCED',
  //       warning_level: 'VERBOSE',
  //       language_in: 'ECMASCRIPT6_STRICT',
  //       language_out: 'ECMASCRIPT5_STRICT',
  //       output_wrapper: '(function(){\n%output%\n}).call(this)',
  //       js_output_file: 'output.min.js'
  //     }, {
  //       platform: ['native', 'java', 'javascript']
  //     }))
  //     .pipe(sourcemaps.write('/'))
  //   // folder only, filename is specified in webpack config
  //   // .pipe(webpackstream(webpackconfig), webpack)
  //     .pipe(gulp.dest(pathDefine.dest))
  // // .pipe(browsersync.stream())
  // )
}

/// ////////////////////////////////
// clean.
function clean (cb) {
  // console.log(arguments);
  // return del([ 'build' ]);
  fs.remove('build', function (err) {
    cb(err)
  })
}
gulp.task('clean', clean)

/// ////////////////////////////////
// build.
let mainjs = _.partial(scripts, paths.mainjs)

let build = gulp.parallel(mainjs)

gulp.task('build', build)
