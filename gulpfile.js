const gulp = require('gulp');
const { src, dest } = gulp;

const browsersync = require('browser-sync');
const del = require('del');

const fileinclude = require('gulp-file-include');

const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');

const uglify = require('gulp-uglify-es').default();

const imagemin = require('gulp-imagemin');



const sourceFolder = '#src';
const projectFolder = 'dist';

const path = {
    src: {
        html: [`${sourceFolder}/*.html`, `!${sourceFolder}/_*.html`],
        scss: `${sourceFolder}/scss/style.scss`,
        img: `${sourceFolder}/img/**/*`,
        js: `${sourceFolder}/js/script.js`,
        fonts: `${sourceFolder}/fonts/**/*`,
    },
    dist: {
        html: `${projectFolder}`,
        css: `${projectFolder}/css`,
        js: `${projectFolder}/js`,
        img: `${projectFolder}/img`,
        fonts: `${projectFolder}/fonts`,
    },
    watch: {
        html: `${sourceFolder}/**/*.html`,
        css: `${sourceFolder}/scss/**/*.scss`,
        js: `${sourceFolder}/js/**/*.js`,
        img: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
    },
    clean: `${projectFolder}`,
}



function browserSync() {
    browsersync.init({
        server: {
            baseDir: `./${projectFolder}`,
        },
        port: 5500,
        notify: false,
    })
}



function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.dist.html))
        .pipe(browsersync.stream());
}



function css() {
    return src(path.src.scss)
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 0.25%, not dead'],
			cascade: true
        }))
        .pipe(dest(path.dist.css))
        .pipe(browsersync.stream());
}



function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.dist.js))
        .pipe(browsersync.stream());
}



function img() {
    return src(path.src.img)
        // .pipe(imagemin({
        //     progressive: true,
        //     svgoPlugins: [
        //         {
        //             removeViewBox: false,
        //         }
        //     ],
        //     interlaced: true,
        //     optimizationLevel: 3,
        // }))
        .pipe(dest(path.dist.img))
        .pipe(browsersync.stream());
}



function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.dist.fonts))
        .pipe(browsersync.stream());
}



function addFonts() {
    const fs = require('fs');
    const file_content = fs.readFileSync(`${sourceFolder}/scss/_fonts.scss`);
    if (file_content == '') {
        fs.writeFile(`${sourceFolder}/scss/_fonts.scss`, '', function() { });
        return fs.readdir(path.dist.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(`${sourceFolder}/scss/_fonts.scss`, `@include font("${fontname}", "${fontname}", "400", "normal");\r\n`, function() { });
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}



function watchFiles() {
    gulp.watch(path.watch.html, html);
    gulp.watch(path.watch.css, css);
    gulp.watch(path.watch.js, js);
    gulp.watch(path.watch.img, img);
}



function clean() {
    return del(path.clean);
}



const dist = gulp.series(clean, gulp.parallel(html, css, js, img, fonts));
const watch = gulp.parallel(dist, watchFiles, browserSync);



exports.default = watch;
exports.watch = watch;
exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.addFonts = addFonts;