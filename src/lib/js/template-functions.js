//INFO: generic functions to keep reusable but add to 11ty

const { DateTime } = require("luxon");
const yaml = require("js-yaml");
const fs = require("fs");

module.exports = { data: {}, filter: {}, collection: {} }

module.exports.addToConfig= function (eleventyConfig, kv) {
	kv= kv || module.exports;
	Object.entries(kv.data).forEach( ([k,v]) => eleventyConfig.addGlobalData(k,v) );
	Object.entries(kv.filter).forEach( ([k,v]) => { console.log(k); eleventyConfig.addFilter(k,v)} );
	Object.entries(kv.collection).forEach( ([k,v]) => eleventyConfig.addCollection(k,v) );
}

function data_cfg() { 
		const cfg_defaults= require('../1cfg_defaults.json');
		const cfg_overrides= require('../../this_site/_data/1cfg_manual.json');
		const cfg= Object.assign({}, cfg_defaults, cfg_overrides);
		return cfg;
}
module.exports.data.cfg= data_cfg;

module.exports.data.now= () => new Date();

module.exports.filter.formatDate= (dateObj, format) => {
	return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(format);
}

module.exports.filter.readableDate= dateObj => {
	return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
}

//SEE: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
module.exports.filter.htmlDateString= (dateObj) => {
	return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
}


module.exports.filter.head= (array, n) => { //U: Get the first `n` elements of a collection.
	if( n < 0 ) { return array.slice(n); }
	return array.slice(0, n);
}


module.exports.filter.min= (...numbers) => { //U: Return the smallest number argument
	return Math.min.apply(null, numbers);
}

module.exports.filter.filterTagList= tags => { //A: should match the list in tags.njk
	return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
}

module.exports.collection.tagList= function(collection) { //U: Create an array of all tags
	let tagSet = new Set();
	collection.getAll().forEach(item => {
		(item.data.tags || []).forEach(tag => tagSet.add(tag));
	});
	return [...tagSet];
}



