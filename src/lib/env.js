//INFO: environment data to use in pages

const BasePath= (process.env.GITHUB_REPOSITORY||'').replace(/^[^\/]*/,'') 
module.exports= { BasePath }
//eg: "/nextjs-github-pages"
