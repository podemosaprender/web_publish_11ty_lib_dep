//INFO: build an index, write to stdout, read json docs from stdin
//SEE: https://lunrjs.com/guides/index_prebuilding.html#serialization
//SEE: https://www.11ty.dev/docs/programmatic/#json-output 

const Eleventy = require("@11ty/eleventy");
const { lunr, myStemmer } = require('./common.js'),
	fs = require('fs'),
	stdin = process.stdin,
	stdout = process.stdout,
	buffer = [];

async function lunr_index_gen(dst, results) {
	let all_pages_as_kv = results || await (new Eleventy()).toJSON(); 
	//DBG: console.error(all_pages_as_kv); //url, content=html
	const documents= all_pages_as_kv.map( doc => {
		const url= doc.url;
		const title= ((doc.content.match(/<title>([^<]*)<\/title>/)||[])[1] || url);
		const body= doc.content.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
		return { url: url+'\t'+title, title, body } //XXX: how to access title on results?
	});

	//DBG: console.error(documents);
	var idx = lunr(function () { //SEE: for custom tokenizers https://lunrjs.com/guides/customising.html#pipeline-functions
		this.use(lunr.multiLanguage('en', 'es')) //SEE: https://lunrjs.com/guides/language_support.html#multi-language-content
		this.use(myStemmer);

		console.error("PIPELINE", this.pipeline.toJSON())

		this.ref('url')
		this.field('title')
		this.field('body')

		documents.forEach(function (doc) { this.add(doc) }, this)
	})

	if (dst) {
		fs.writeFileSync(dst, JSON.stringify(idx))
	} else {
		stdout.write(JSON.stringify(idx))
	}
}

module.exports = lunr_index_gen;
