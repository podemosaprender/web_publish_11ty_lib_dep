//INFO: build an index, write to stdout, read json docs from stdin
//FROM: https://lunrjs.com/guides/index_prebuilding.html#serialization
//U: echo '[{ "title": "Foo", "body": "Bar" }]' | node build-index.js > xidx.json
//U: idx=0; for f in `find src/ -type f` ; do idx=$((idx+1)); echo "{\"title\": \"$f\", \"_body_from_file\": \"$f\" }," ; done | node ~/std_env_dev/code/search_lunrjs/index-build.js > xidx.json

var lunr = require('lunr'),
	fs = require('fs'),
	stdin = process.stdin,
	stdout = process.stdout,
	buffer = []

require("lunr-languages/lunr.stemmer.support")(lunr)
require('lunr-languages/lunr.multi')(lunr)
require("lunr-languages/lunr.es")(lunr)

myTokenDbgImpl= function (token,logName) {
	console.error("TK",logName,token);
	return token;
}
const myTokenDbgEndImpl= (tk) => myTokenDbgImpl(tk,'END');

myStemmerImpl= function (token) {
	let dontStem= token.str=='socialismo';
	console.error("TK",dontStem,token)
	let tks= []
	if (dontStem) { tks.push({...token}) }
	else { tks.push( lunr['es'].stemmer( lunr.stemmer(token) ) ); }
	return tks
}

lunr.Pipeline.registerFunction(myStemmerImpl,'myStemmer');
lunr.Pipeline.registerFunction(myTokenDbgEndImpl,'myTokenDbgEnd');

function myStemmer(builder) {
	[this.pipeline, this.searchPipeline].forEach(p => {
		p.add(myTokenDbgEndImpl);
		p.after(lunr.stemmer, myStemmerImpl) //SEE: https://lunrjs.com/guides/customising.html#pipeline-functions
		p.remove(lunr.stemmer)
		p.remove(lunr['es'].stemmer)
	})
}

module.exports= { lunr, myStemmer }
