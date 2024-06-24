//INFO: 11ty pipeline config
const DBG=process.env.DBG
const P_SITE_DIR=process.env.P_SITE_DIR || './src/this_site'

const our_lib = require('./src/lib/js/template-functions.js')
const { BasePath }= our_lib;

const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginLinkTo= require('eleventy-plugin-link_to'); //SEE: https://www.npmjs.com/package/eleventy-plugin-link_to
const pluginCalendar = require("@codegouvfr/eleventy-plugin-calendar"); //SEE: https://www.npmjs.com/package/@codegouvfr/eleventy-plugin-calendar
const htmlmin = require("html-minifier");

const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItToc = require("markdown-it-table-of-contents");

const yaml = require("js-yaml");
const fs = require("fs");

module.exports = function(eleventyConfig) {
	const CFG= {
		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/
		pathPrefix: BasePath,

		templateFormats: [ "md", "njk", "html" ], //A: Control which files Eleventy will process
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

	//SEE: https://github.com/markdown-it/markdown-it?tab=readme-ov-file#init-with-presets-and-options
	let markdownLibrary = markdownIt({
		html: true,
		breaks: true,
		linkify: true
	}).use(markdownItAnchor, {
		permalink: true,
		permalinkClass: "direct-link",
		permalinkSymbol: "#"
	}).use(markdownItToc,{//SEE: https://github.com/cmaas/markdown-it-table-of-contents
		includeLevel: [2,3,4],
	}); 

	eleventyConfig.setLibrary("md", markdownLibrary);

	//XXX: MULTI_INCLUDES? { //XXX:OjO! el renderer de Markdown usa su propio engine, hardcoded
	let Nunjucks = require("nunjucks");
	let nunjucksEnvironment = new Nunjucks.Environment(
		new Nunjucks.FileSystemLoader(`${P_SITE_DIR}/_includes`)
	);
	eleventyConfig.setLibrary("njk", nunjucksEnvironment);
	//XXX: MULTI_INCLUDES? }


	if (!DBG) {
		eleventyConfig.addTransform("htmlmin", function (content) {
			if ((this.page.outputPath || "").endsWith(".html")) {
				let minified = htmlmin.minify(content, {
					useShortDoctype: true,
					removeComments: true,
					collapseWhitespace: true,
				});
				return minified;
			}
			return content;//A: If not an HTML output, return content as-is
		});
	}

	eleventyConfig.on("eleventy.after", //SEE: https://www.11ty.dev/docs/events/#eleventy.after
		async ({ dir, results, runMode, outputMode }) => { //DBG: console.log({dir, outputMode})
			if (outputMode=='fs') {
			}
		}
	);

	//SEE: https://www.11ty.dev/docs/data-custom/#yaml
	eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

	//SEE: https://www.11ty.dev/docs/data-deep-merge/
	eleventyConfig.setDataDeepMerge(true);

	our_lib.addToConfig(eleventyConfig, {...CFG, md: markdownLibrary}); 

	eleventyConfig.addPassthroughCopy(`${P_SITE_DIR}/**/{js,css,img,fonts}/**`);
	eleventyConfig.addPassthroughCopy(`${P_SITE_DIR}/**/*.{js,css,png,jpg,jpeg,svg,webp}`);
	//A: Copy the `img` and `css` folders to the output


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
