//INFO: 11ty pipeline config
const our_lib = require('./src/lib/js/template-functions.js')
const lunr_index_gen = require('./src/lib/js/search-lunr/create-index.js');

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginLinkTo= require('eleventy-plugin-link_to'); //SEE: https://www.npmjs.com/package/eleventy-plugin-link_to
const htmlmin = require("html-minifier");

const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItToc = require("markdown-it-table-of-contents");

const yaml = require("js-yaml");
const fs = require("fs");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(pluginLinkTo);
	
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

	eleventyConfig.on( //SEE: https://www.11ty.dev/docs/events/#eleventy.after
		"eleventy.after",
		async ({ dir, results, runMode, outputMode }) => {
			console.log({dir, outputMode})
			if (outputMode=='fs') {
				await	lunr_index_gen(dir.output+'/qidx.txt', results);
			}
		}
	);
	
	//SEE: https://www.11ty.dev/docs/data-custom/#yaml
	eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

	//SEE: https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.addGlobalData("cfg", function () { 
		const cfg_defaults= require('./src/1cfg_defaults.json');
		const cfg_overrides= require('./src/this_site/_data/1cfg_manual.json');
		const cfg= Object.assign({}, cfg_defaults, cfg_overrides);
		return cfg;
	}); //XXX:MOVER_A_LIB
	//A: cfg
  
	eleventyConfig.addLayoutAlias("post", "layouts/post.njk"); //A: Alias `layout: post` to `layout: layouts/post.njk`

 	our_lib.addToConfig(eleventyConfig); 
  
  eleventyConfig.addPassthroughCopy("src/this_site/img");
  eleventyConfig.addPassthroughCopy("src/this_site/css");
  eleventyConfig.addPassthroughCopy("src/this_site/js");
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

  return {
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/
    pathPrefix: "/",
	
 		
		templateFormats: [ "md", "njk", "html", "liquid" ], //A: Control which files Eleventy will process
		markdownTemplateEngine: "njk",//A: Pre-process *.md files with:
		htmlTemplateEngine: "njk",//A: Pre-process *.html files with:
		dataTemplateEngine: false,//A: Opt-out of pre-processing global data JSON files
    dir: {
      input: "src/this_site",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
