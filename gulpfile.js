var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('lint', function() {
    gulp.src("./scripts/app/*.js")
    	.pipe(jshint())
    	.pipe(jshint.reporter("default"));
});