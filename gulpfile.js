/**
 * Created by wugy on 2016/12/28.
 */

'use strict';
// 加载gulp，以及gulp的插件（以gulp-开头所有的插件），和其他相关插件
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();//插件管理，加载bower文件中的gulp插件,gulp-load-plugins：gulp插件自动加载神器
var openURL = require('open');//open：主动打开某个网址，在编译预览时，方便！
var lazypipe = require('lazypipe');//分离多个pipe导流管道至一个工厂，即把多个stream链进行单独集合,lazypipe：pipe可复用的强大神器
var rimraf = require('rimraf');//删除文件,rimraf：文件以及文件夹的操作
var wiredep = require('wiredep').stream;//把真正所需要的文件自动引入到html文件中
var runSequence = require('run-sequence');//让gulp任务，可以相互独立，解除任务间的依赖，增强task复用,run-sequence：按顺序执行gulp任务，这是个过渡版本，预期以后gulp会增强相关的功能
//这里app就是我们源文件夹，dist是我们要打包输出的文件夹
var yeoman = {
  app: require('./bower.json').appPath || 'app',
  dist: 'dist'
};
//定义css，js路径以及视图路径
var paths = {
  scripts: [yeoman.app + '/scripts/**/*.js'],
  styles: [yeoman.app + '/styles/**/*.scss'],
  test: ['test/spec/**/*.js'],
  testRequire: [
    yeoman.app + '/bower_components/angular/angular.js',
    yeoman.app + '/bower_components/angular-mocks/angular-mocks.js',
    yeoman.app + '/bower_components/angular-resource/angular-resource.js',
    yeoman.app + '/bower_components/angular-cookies/angular-cookies.js',
    yeoman.app + '/bower_components/angular-sanitize/angular-sanitize.js',
    yeoman.app + '/bower_components/angular-route/angular-route.js',
    'test/mock/**/*.js',
    'test/spec/**/*.js'
  ],
  karma: 'karma.conf.js',
  views: {
    main: yeoman.app + '/index.html',
    files: [yeoman.app + '/views/**/*.html',yeoman.app + '/components/**/*.html']
  }
};

////////////////////////
// Reusable pipelines //
////////////////////////
//lintScripts预设了js语法检测的参数设置，以及语法检测日志的输出使用jshint-stylish
var lintScripts = lazypipe()
  .pipe($.jshint, '.jshintrc')//gulp-jshint：js语法检测
  .pipe($.jshint.reporter, 'jshint-stylish');//jshint-stylish：js语法检测的格式化输出
//styles预设了css样式处理的过程，使用sass编译，使用autoprefixer自动添加前缀，并指定了输出的文件夹
var styles = lazypipe()
  .pipe($.sass, {//gulp-sass：sass文件编译
    outputStyle: 'expanded',
    precision: 10
  })
  .pipe($.autoprefixer, 'last 1 version')//gulp-autoprefixer：css自动添加前缀，以适应多浏览器
  .pipe(gulp.dest, '.tmp/styles');

///////////
// Tasks //
///////////
//styles任务将我们的样式文件按照上述预制的styles执行
gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(styles());
});
//lint:scripts任务负责检测我们的js语法的合法性
gulp.task('lint:scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(lintScripts());
});
//clean:tmp任务负责清理.tmp文件夹，注意这里有了一个cb回调，意味着其他任务需要等待该任务执行完成后才能执行
gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});
//启动客户端，调用启动服务器，格式化样式，并在浏览器中打开指定网址
gulp.task('start:client', ['start:server', 'styles'], function () {
  openURL('http://localhost:3004');
});
//启动服务器，使用connect创建一个webserver
gulp.task('start:server', function() {
  $.connect.server({//gulp-connect : 创建一个webserver 方便实时预览
    root: [yeoman.app, '.tmp'],
    livereload: true,//自动刷新
    // Change this to '0.0.0.0' to access the server from outside.
    port: 3004
  });
});

gulp.task('start:server:test', function() {
  $.connect.server({
    root: ['test', yeoman.app, '.tmp'],
    livereload: true,
    port: 8004
  });
});
//添加监听任务，并执行相关的任务
gulp.task('watch', function () {
  $.watch(paths.styles)
    .pipe($.plumber())//gulp-plumber：修复了pipe处理异常的bug，让任务执行更平滑
    .pipe(styles())
    .pipe($.connect.reload());

  $.watch(paths.views.files)
    .pipe($.plumber())
    .pipe($.connect.reload());

  $.watch(paths.scripts)
    .pipe($.plumber())
    .pipe(lintScripts())
    .pipe($.connect.reload());

  $.watch(paths.test)
    .pipe($.plumber())
    .pipe(lintScripts());

  gulp.watch('bower.json', ['bower']);
});
//编译启动服务器，注册了一个按序执行的任务列表，清除.tmp, 检测js语法，启动客户端（启动webserver，编译样式css）,添加监听任务
gulp.task('serve', function (cb) {
  runSequence('clean:tmp',
    ['lint:scripts'],
    ['start:client'],
      ['bower'],
    'watch', cb);
});

gulp.task('serve:prod', function() {
  $.connect.server({
    root: [yeoman.dist],
    livereload: true,
    port: 3005
  });
});

gulp.task('test', ['start:server:test'], function () {
  var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
  return gulp.src(testToFiles)
    .pipe($.karma({
      configFile: paths.karma,
      action: 'watch'
    }));
});
//bower任务负责将bower依赖注入
// inject bower components
gulp.task('bower', function () {
  return gulp.src(paths.views.main)
    .pipe(wiredep({//wiredep：bower插件的依赖插入神器
      directory: yeoman.app + '/bower_components',
      ignorePath: '..'
    }))
  .pipe(gulp.dest(yeoman.app));
});

///////////
// Build //
///////////

gulp.task('clean:dist', function (cb) {
  rimraf('./dist', cb);
});

gulp.task('client:build', ['html','componentsHtml', 'styles'], function () {
  var jsFilter = $.filter('**/*.js');//gulp-filter：文件匹配神器
  var cssFilter = $.filter('**/*.css');

  return gulp.src(paths.views.main)
    .pipe($.useref({searchPath: [yeoman.app, '.tmp']}))//gulp-useref：处理html中js或css占位符替换成真正的资源索引
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.stripDebug())//gulp-strip-debug:去debugger,console.log();
    .pipe($.uglify())//gulp-uglify：js压缩神器
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss({cache: true}))//gulp-minify-css：压缩css的神器
    .pipe(cssFilter.restore())
    .pipe($.rev())//gulp-rev：校订命名神器，将文件名附加文件内容hash后的重新命名，对于发布新版本静态资源的时候有效解决浏览器缓存问题
    .pipe($.revReplace())//gulp-rev-replace：重写被rev命名后的文件索引，尤其是你使用了manifest离线缓存后这个非常有效
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('html', function () {
  return gulp.src(yeoman.app + '/views/**/*')
    .pipe(gulp.dest(yeoman.dist + '/views'));
});

gulp.task('componentsHtml', function () {
  return gulp.src(yeoman.app + '/components/**/*')
      .pipe(gulp.dest(yeoman.dist + '/components'));
});

gulp.task('images', function () {
  return gulp.src(yeoman.app + '/images/**/*')
    .pipe($.cache($.imagemin({//gulp-cache：gulp的文件缓存服务，尤其是任务处理过程中的中间文件特别有效//gulp-imagemin：图片压缩神器
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest(yeoman.dist + '/images'));
});

gulp.task('copy:extras', function () {
  return gulp.src(yeoman.app + '/*/.*', { dot: true })
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:fonts', function () {
  return gulp.src(yeoman.app + '/fonts/**/*')
    .pipe(gulp.dest(yeoman.dist + '/fonts'));
});

gulp.task('copy:ico', function () {
    return gulp.src(yeoman.app + '/favicon.ico')
        .pipe(gulp.dest(yeoman.dist));
});

gulp.task('build', ['clean:dist'], function () {
  runSequence(['images', 'copy:extras', 'copy:fonts','copy:ico', 'client:build']);
});

gulp.task('default', ['build']);
//详解http://www.zplan.net/news.php?id=369