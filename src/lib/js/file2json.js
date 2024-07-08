//INFO: return json parsing every non binary file in args SO we can process and generate sites from json
//U: (HERE=`pwd`; cd src/this_site/; echo "{" ; find site_/mauriciocap | xargs node $HERE/src/lib/js/file2json.js ; echo "}" ) > x.json 

const fs = require("fs");
const yaml = require("js-yaml");
const matter= require('gray-matter');

const files= process.argv.slice(2);
files.forEach(fn => {
	let d= {path: fn}
	if (fn.match(/\.((yaml))$/)) {
		d.data= yaml.load(fs.readFileSync(fn,'utf8'));
	} else if (fn.match(/\.((json))$/)) {
		d.data= JSON.parse(fs.readFileSync(fn,'utf8'));
	} else if (fn.match(/\.((njk)|(md)|(html)|(txt)|(csv)|(js)|(svg))$/)) {
		d= matter.read(fn);
	} else if (fs.statSync(fn).isFile()) { 
		d.bin= true 
	} else { console.error("IGNORING NON FILE "+fn); d= null }
	if (d) {
		let p= d.path; delete d.path; delete d.excerpt;
		console.log(JSON.stringify(p)+': '+JSON.stringify(d,0,2)+"\n,\n")
	}
})
