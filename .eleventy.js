//INFO: 11ty pipeline config
const DBG=process.env.DBG
const P_SITE_DIR=process.env.P_SITE_DIR || './src/this_site'

const our_lib = require('./src/lib/js/template-functions.js')
const { BasePath, xfrm_MAIN, xfrm_STREAM }= our_lib;

const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginLinkTo= require('eleventy-plugin-link_to'); //SEE: https://www.npmjs.com/package/eleventy-plugin-link_to
const pluginCalendar = require("@codegouvfr/eleventy-plugin-calendar"); //SEE: https://www.npmjs.com/package/@codegouvfr/eleventy-plugin-calendar

const yaml = require("js-yaml");
const fs = require("fs");

module.exports = function(eleventyConfig) {
	const CFG= {
		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/
		pathPrefix: BasePath,

		templateFormats: ["md", "njk", "html"], //A: Control which files Eleventy will process (XXX:move html and css to non templates, transform with Passthrough
		markdownTemplateEngine: "njk",//A: Pre-process *.md files with: njk
		htmlTemplateEngine: "njk",//A: Pre-process *.html files with: njk
		dataTemplateEngine: false,//A: Opt-out of pre-processing global data JSON files
		dir: {
			input: P_SITE_DIR,
			includes: "_includes",
			data: "_data",
			output: "_site",
		}
	};
	console.log("CFG",CFG);

	eleventyConfig.setQuietMode(true); //A: don't show each processed file bc hides errors

	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight);
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(pluginLinkTo);
	eleventyConfig.addPlugin(pluginCalendar, {
		defaultLocation: "online",
		defaultOrganizer: {
			name: "o-o.fyi",
			email: "web@o-o.fyi"
		}
	});


	//XXX: MULTI_INCLUDES? { //XXX:OjO! el renderer de Markdown usa su propio engine, hardcoded
	let Nunjucks = require("nunjucks");
	let nunjucksEnvironment = new Nunjucks.Environment(
		new Nunjucks.FileSystemLoader(`${P_SITE_DIR}/_includes`)
	);
	eleventyConfig.setLibrary("njk", nunjucksEnvironment);
	//XXX: MULTI_INCLUDES? }
	

	

	eleventyConfig.on("eleventy.after", //SEE: https://www.11ty.dev/docs/events/#eleventy.after
		async ({ dir, results, runMode, outputMode }) => { //DBG: console.log({dir, outputMode})
			if (outputMode=='fs') {
			}
		}
	);

	//SEE: https://www.11ty.dev/docs/data-custom/#yaml
	eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
	eleventyConfig.setDataFileBaseName("_here"); //A: data for this folder
	eleventyConfig.setDataFileSuffixes([".data",""]); //A: json, yaml

	//SEE: https://www.11ty.dev/docs/data-deep-merge/
	eleventyConfig.setDataDeepMerge(true);

	our_lib.addToConfig(eleventyConfig, {...CFG}); 



	// Override Browsersync defaults (used only with --serve)
	eleventyConfig.setBrowserSyncConfig({
		callbacks: {
			ready: function(err, browserSync) {
				const content_404 = fs.readFileSync('_site/404.html');
				browserSync.addMiddleware("*", (req, res) => { //A: Provides the 404 content without redirect.
					res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
					res.write(content_404);
					res.end();
				});
			},
		},
		ui: false,
		ghostMode: false
	});

	return CFG;
};
