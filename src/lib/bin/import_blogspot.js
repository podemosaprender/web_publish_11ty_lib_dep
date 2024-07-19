//INFO: import from a blogspot url

async function urlToX(baseUrl) {
	let url= baseUrl+'/feeds/posts/default?alt=json';
	let json= await fetch(url).then(r => r.json())
	let r= json.feed.entry.map(e => {
		let title= e.title['$t']; //txt
		let txt= e.content['$t']
			.split(/<p[^>]*>/)
			.map(inner => ('<p>'+inner.replace(/<[^>]*>/gsi,' ')+'</p>\n'))
			.join('');
	});
	console.log(JSON.stringify(r,0,2))
	return r;
}

urlToX('https://cuentossinfe.blogspot.com/')

