//INFO: our reusable impl of markdown

const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItToc = require("markdown-it-table-of-contents");
const markdownItAttr = require("markdown-it-attrs");

//SEE: https://github.com/markdown-it/markdown-it?tab=readme-ov-file#init-with-presets-and-options
let MarkdownImpl = markdownIt({
	html: true,
	breaks: true,
	linkify: true
})
.use(markdownItAttr) //SEE: https://mdit-plugins.github.io/attrs.html#syntax
.use(markdownItAnchor, {//SEE: https://github.com/valeriangalliat/markdown-it-anchor#permalinks
	permalink: markdownItAnchor.permalink.headerLink(),
})
/*
.use(markdownItToc,{//SEE: https://github.com/cmaas/markdown-it-table-of-contents?tab=readme-ov-file#options
	includeLevel: [2,3,4],
	markerPattern: /^\[\[toc]\]/im, //A: tocamos renderer abajo para elegit horizontal o vertical
})
*/

//SEE: https://github.com/markdown-it/markdown-it/blob/master/docs/examples/renderer_rules.md
const proxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options);
const RendererRulesDflt= { ...MarkdownImpl.renderer.rules }
const renderDflt= (rule, tokens, idx, options, env, self) => (RendererRulesDflt[rule]||proxy)(tokens, idx, options, env, self);

//U: ver el ast escribiendo en https://markdown-it.github.io/#
MarkdownImpl.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
	tokens[idx].attrJoin("class", tokens[idx].tag) //A: para bootstrap
  return `${renderDflt('heading_open',tokens, idx, options, env, self)}`;
};

MarkdownImpl.renderer.rules.link_open = function(tokens, idx, options, env, self) {
	let href= tokens[idx].attrGet('href') //SEE: https://markdown-it.github.io/markdown-it/#Token.attrGet
	if (href.startsWith('%5E')) { 
		tokens[idx].attrSet('href',href.substr(3)); tokens[idx].attrSet('target','_blank') 
	}
	//console.log("DBG:md_link",href,href.charCodeAt(0),tokens[idx]);
	//U: si el link empieza con ^ agregamos target blank
  return `${renderDflt('link_open',tokens, idx, options, env, self)}`;
};

MarkdownImpl.renderer.rules.toc_open = function (tokens, idx) {
	let tk= tokens[idx]
	console.log("XXXr",tokens.slice(idx,idx+5));
	let tocOpenHtml = `<div class="table-of-contents${tk.token=='XXX' ? ' table-of-contents-h' : ''}">`;
	return tocOpenHtml;
};

//XXX:asociar al tema? tener mas de un renderer para elegir desde el shortCode?
module.exports= { MarkdownImpl }

