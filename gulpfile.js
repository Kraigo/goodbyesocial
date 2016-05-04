var gulp = require('gulp');
var stylus = require('gulp-stylus');


gulp.task('stylus', function() {
    return gulp.src('./public/stylesheets/*.styl')
        .pipe(stylus({
            compress: true
        }))
        .pipe(gulp.dest('./public/stylesheets'))
});

gulp.task('default', ['stylus']);
