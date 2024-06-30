//INFO: our reusable impl of markdown

const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItToc = require("markdown-it-table-of-contents");

//SEE: https://github.com/markdown-it/markdown-it?tab=readme-ov-file#init-with-presets-and-options
let MarkdownImpl = markdownIt({
	html: true,
	breaks: true,
	linkify: true
})
.use(markdownItAnchor, {//SEE: https://github.com/valeriangalliat/markdown-it-anchor#permalinks
	permalink: markdownItAnchor.permalink.headerLink(),
})
.use(markdownItToc,{//SEE: https://github.com/cmaas/markdown-it-table-of-contents?tab=readme-ov-file#options
	includeLevel: [2,3,4],
	markerPattern: /^\[\[toc\]\]/im,
})
.use(markdownItToc,{//SEE: https://github.com/cmaas/markdown-it-table-of-contents?tab=readme-ov-file#options
	includeLevel: [2,3,4],
	markerPattern: /^\[\[toc-h\]\]/im,
	containerClass: "table-of-contents table-of-contents-h"
}); 


//SEE: https://github.com/markdown-it/markdown-it/blob/master/docs/examples/renderer_rules.md
const proxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options);
const RendererRulesDflt= { ...MarkdownImpl.renderer.rules }
const renderDflt= (rule, tokens, idx, options, env, self) => (RendererRulesDflt[rule]||proxy)(tokens, idx, options, env, self);

//U: ver el ast escribiendo en https://markdown-it.github.io/#
MarkdownImpl.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
	tokens[idx].attrJoin("class", tokens[idx].tag) //A: para bootstrap
  return `${renderDflt('heading_open',tokens, idx, options, env, self)}`;
};

//XXX:asociar al tema? tener mas de un renderer para elegir desde el shortCode?
module.exports= { MarkdownImpl }

