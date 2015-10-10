module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		env : grunt.file.readJSON("env.json"),
		
		clean: {
			 js: ["coffee/ext/*.min.js"]
		},
	
        uglify : {
        	options : {
        		beautify: false
        	},
        	styles: {
    	      files: [{
    	          expand: true,
    	          cwd: 'coffee/ext',
    	          src: '**/*.js',
    	          dest: 'coffee/ext',
    	          ext: '.min.js'
    	      }]
    	    },
			coffee : {
				files: {
			        'coffee/lemon.min.js': ['coffee/lemon.js']
			    }
			}
        },

		coffee : {
			lemon : {
				options : {
					sourceMap : true,
					sourceMapDir : 'coffee/'
				},
				expand: true,
			    flatten: true,
			    cwd: 'coffee/',
			    src: ['*.coffee'],
			    dest: 'coffee/',
			    ext: '.js'
			}

		},
		
		htmlmin : {
			dist : {
				options : {
					removeComments : true,
					collapseWhitespace : true,
					conservativeCollapse: true,
					preserveLineBreaks: true,
					removeEmptyAttributes: true,
					removeAttributeQuotes: true,
					minifyJS: true,
					minifyCSS: true,
					useShortDoctype: true,
					removeCommentsFromCDATA: true,
					removeCDATASectionsFromCDATA: true,
					removeRedundantAttributes: true,
					removeScriptTypeAttributes: true,
					//processScripts: ['text/html'],
					removeStyleLinkTypeAttributes: true
				},
				files : {
					'html/manual.min.html' : 'html/manual.html'
				}
			}
		}
	
	});
	
    grunt.loadNpmTasks('grunt-contrib-uglify');  
    grunt.loadNpmTasks('grunt-contrib-clean');  
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-manifest-generator');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
  
    grunt.registerTask('default', ['coffee', 'uglify:coffee', 'clean', 'uglify:styles', 'htmlmin']);
    grunt.registerTask('coffeemini', ['uglify:coffee']);
    
};