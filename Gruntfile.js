module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		env : grunt.file.readJSON("env.json"),
		
        uglify : {
        	options : {
        		beautify: false
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

		}
	
	});
	
    grunt.loadNpmTasks('grunt-contrib-uglify');  
    grunt.loadNpmTasks('grunt-contrib-clean');  
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-manifest-generator');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-coffee');
  
    grunt.registerTask('default', ['coffee', 'uglify:coffee']);
    grunt.registerTask('coffeemini', ['uglify:coffee']);
    
};