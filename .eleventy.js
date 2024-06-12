const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const htmlmin = require("html-minifier");

const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

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

  eleventyConfig.addGlobalData("now", () => new Date());


  eleventyConfig.addFilter("formatDate", (dateObj, format) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(format);
  });

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });

	//SEE: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  
	eleventyConfig.addFilter("head", (array, n) => { //U: Get the first `n` elements of a collection.
    if( n < 0 ) { return array.slice(n); }
    return array.slice(0, n);
  });

  
	eleventyConfig.addFilter("min", (...numbers) => { //U: Return the smallest number argument
    return Math.min.apply(null, numbers);
  });

  eleventyConfig.addFilter("filterTagList", tags => {
    // should match the list in tags.njk
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  })

  
	eleventyConfig.addCollection("tagList", function(collection) { //U: Create an array of all tags
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });
    return [...tagSet];
  });

  
  eleventyConfig.addPassthroughCopy("src/this_site/img");
  eleventyConfig.addPassthroughCopy("src/this_site/css");
	//A: Copy the `img` and `css` folders to the output
	
  
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "direct-link",
    permalinkSymbol: "#"
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

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
