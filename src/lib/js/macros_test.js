//INFO: validate nunjucks file
const fs= require('fs');
const nj= require('nunjucks')
const p= process.argv[2].split('/');
const f= p.pop()
nj.configure(p.join('/'))
const res= nj.renderString(`{% import "${f}" as pkg %}\n`);
console.log(res)
