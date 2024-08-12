//INFO: process ONE html file
const o= console.log;
console.log= console.error

const fs= require('fs');
const lib= require('../js/template-functions.js');

const ARGV= process.argv.slice(2)
ARGV.forEach( fin => {
	let content= fs.readFileSync(fin,'utf8');
	let content2= lib.xfrm_MAIN(fin,'out/'+fin, content);
	o(content2);
} );
