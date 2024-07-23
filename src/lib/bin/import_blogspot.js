//INFO: import from a blogspot url

const yaml= require('js-yaml');

async function urlToX(baseUrl) {
	let url= baseUrl+'/feeds/posts/default?alt=json';
	let json= await fetch(url).then(r => r.json())
	let r= {};
	json.feed.entry.map(e => {
		let title= e.title['$t']; //txt
		let dt_pub= e.published['$t'];
		let txt= e.content['$t']
			.split(/<p[^>]*>/)
			.map(inner => (
				inner
					.replace(/<[^>]*>/gsi,' ')
					.replace(/&nbsp;/gs,' ').replace(/&gt;/gs,'>').replace(/&lt;/gs,'<')
					.replace(/\s+/gsi,' ')
					+'\n\n'))
			.join('');
		r[title]= {title, dt_pub, txt};
	});
	console.log(yaml.dump({items: r}))
	return r;
}

urlToX('https://cuentossinfe.blogspot.com/')

