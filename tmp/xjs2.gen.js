(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//INFO: para los juegos con arquetipos
module.exports= {};

const $= (s) => document.querySelector(s)
const DBG= (r,msg,lvl, ...details) => {console.log(msg,r,...details); return r }
const range= (max) => [...Array(max).keys()];
const rnd_element= (list) => list[Math.floor(Math.random()*list.length)];
const rnd_mix= (list) => { 
	let c= [...list]; let r= []; while (c.length) { r.unshift(rnd_element(c)); c= c.filter(e => e!=r[0]) }
	return r;
}
const cmp_arrays= (a,b) => (range(Math.max(a.length,b.length)).map(i => a[i]<b[i]?-1:a[i]==b[i]?0:1).find(v=>v))

let ArchJSON= require('../../../this_site/web/archetype/_here.data.json');
let Arch= ArchJSON.items;
let ArchNames= Object.keys(Arch);	
let ArchFeatures= 'Desire,Branding style,Fears,Traits'.split(',')

const to_lol= () => { //U: devuelve lista [word,role,archetypename]
	return ArchFeatures.map( feat =>  
		Object.entries(Arch).map( ([an,akv]) => 
			(akv[feat]||'').toLowerCase()
			.replace('boring','boredom')
			.split(/,\s*(?:and\s*)?/)
			.map(w => [w,feat.toLowerCase(),an.toLowerCase()])
		)
	)
	.flat(2)
	.sort(cmp_arrays)
}

const to_word2feat2arch= (lol) => { //U: devuelve kv word->feat->arch
	return (lol || to_lol()).reduce( (acc,[w,f,a]) => {
		let accw= (acc[w] = acc[w] || {});
		let accwf= (accw[f] = accw[f] || {});
		accwf[a]=1;
		return acc;
	}, {})
}

const query= (q,lol) => (lol || to_lol()).filter( //U: .query(['*','desire','*'])
	a => q.every( (qi,i) => (qi=='*' || a[i]==qi) )	
)

module.exports= {...module.exports, 
	DBG, rnd_element, rnd_mix,cmp_arrays,
	Arch, ArchNames, ArchFeatures,
	to_lol, to_word2feat2arch, query,
}

},{"../../../this_site/web/archetype/_here.data.json":2}],2:[function(require,module,exports){
module.exports={ "items":
	{
		"Outlaw": {
			"Archetype": "Outlaw",
			"Fears": "Uniformity, conformity, rules, rigidity",
			"Desire": "Revolution",
			"Traits": "Change, disruptive, liberator, confrontational",
			"Branding style": "Bold, disruptive, shocking to go against the norm",
			"Desc": "Going back to your colleague who is outspoken and always ready to challenge the norm, this depicts The Outlaw Brand Archetype.\nThese individuals do not follow the status quo as they make their own rules.\nThey’re prepared to use more disruptive and destructive ways of achieving their goals and they hate conformity.\nWhilst they are good at their core, anger is a big motivation and this can often become the most dominant emotion."
		},
		"Creator": {
			"Archetype": "Creator",
			"Fears": "Repetition, stagnation, familiarity",
			"Desire": "Innovation",
			"Traits": "Vision, originality, expression, creativity",
			"Branding style": "Being original, using imagination, doing something unique",
			"Desc": "The Creator Brand Archetype embodies originality, innovation, vision, and a passion for self-expression.\nIndividuals in this archetype are innovators and they want to push the possibilities of creativity and design, whilst encouraging others to do the same.\nThey believe if you can imagine it, it can be made possible. However, they are usually restricted by their own desire for absolute perfection."
		},
		"Magician": {
			"Archetype": "Magician",
			"Fears": "Boring, doubt, ignorance, repetition",
			"Desire": "Power",
			"Traits": "Discovery, charisma, imaginative, idealistic, transformation",
			"Branding style": "Wonder and mysticism, making dreams come true",
			"Desc": "The Magician Brand Archetype wants to surprise and delight their audience by making their dreams come true.\nTurning people&#8217;s dreams into reality is really at the core of this brand archetype, by making the impossible possible.\nUltimately they are a visionary, and are regarded as deep thinkers and trusted advisors."
		},
		"Hero": {
			"Archetype": "Hero",
			"Fears": "Cowardice, deterioration, incompetence",
			"Desire": "Mastery",
			"Traits": "Honesty, bravery, candidness, development",
			"Branding style": "Being stronger, making the world a better place",
			"Desc": "The Hero Brand Archetype is characterised by courage and self-sacrifice. People who fall into this archetype are those individuals you would want on your team if you were ever to go into battle!\nThey make it their personal mission to triumph over adversity, and their motivation lies in being able to prove their worth through courage and a commitment to the cause.\nThey meet challenges head-on and they hold themselves to a very high regard, ensuring that they keep going until they succeed."
		},
		"Lover": {
			"Archetype": "Lover",
			"Fears": "Rejection, loneliness, invisibility",
			"Desire": "Intimacy",
			"Traits": "Affection, love, closeness, intimacy, indulgence",
			"Branding style": "The declaration of beauty and worth, a luxury/ VIP experience",
			"Desc": "The lover has a desire to be desired. They crave intimacy and have a strong liking for joyful experiences that are both sensual and nurturing.\nTheir main motivation lies in becoming more physically and emotionally appealing to attract the attention of others.\nTo accompany this, their main fears are being ignored, unwanted, and unloved, and they’re constantly fearful of loss. Even when they have achieved their goals, they’re still fearful and crave more desires as a result."
		},
		"Jester": {
			"Archetype": "Jester",
			"Fears": "Boredom, negativity, loneliness",
			"Desire": "Fun",
			"Traits": "Happiness, laughter, belonging, positivity",
			"Branding style": "Humor, entertainment, and living in the moment",
			"Desc": "Think of someone in your life who is always up for a good time.\nWhen everyone else is down, maybe because of work or just life’s usual daily stresses, this person always manages to see the good in every situation and is a great pick-me-up.\nThis is an example of someone who fits the Jester Brand Archetype.\nTheir glass is always half full, and not only are they up-beat themselves, but they see it as their responsibility to uplift everyone around them too.\nThey’re quite child-like and they’ll continue this nature long after their friends have grown up and become more serious."
		},
		"Everyman": {
			"Archetype": "Everyman",
			"Fears": "Isolation, exclusion, hostility",
			"Desire": "Belonging",
			"Traits": "Equality, inclusion, togetherness, connection",
			"Branding style": "Creating an inclusive and welcoming environment, promoting a sense of belonging",
			"Desc": "This brand archetype is characterised by its relatability and down-to-earth nature, creating a sense of belonging.\nAbove everything, they want to fit in, belong, and feel accepted. They’re easy to talk to and get along with, and they don’t want to stand out in the crowd by being overly funny or overly loud.\nThey want to blend into society and be like everyone else. They’re usually positive and they often agree with others to fit into the group.\nThey’re both easily liked, and easily forgotten."
		},
		"Caregiver": {
			"Archetype": "Caregiver",
			"Fears": "Neglect, blame, helplessness",
			"Desire": "Service",
			"Traits": "Warm, caring, reassuring, gratitude, service",
			"Branding style": "Doing things for the greater good, others before self",
			"Desc": "These individuals are driven by the desire to protect and care for others.\nEssentially they are the ‘mum’ of your friendship group as they usually take people under their wing, especially those that are struggling or having a hard time.\nTheir personality is characterised as being selfless as they’re always putting the needs of others before their own.\nWhat’s important to note about this brand archetype is that whilst they appreciate their efforts being recognised, they don’t like to be patronised."
		},
		"Ruler": {
			"Archetype": "Ruler",
			"Fears": "Failure, poverty, weakness",
			"Desire": "Control",
			"Traits": "Leadership, control, ambition, status, success",
			"Branding style": "Showing dominance over others and leadership",
			"Desc": "As the name suggests, the Ruler brand archetype is associated with leadership, authority, and a sense of control, ultimately being the most dominant personality.\nPeople that embody the Ruler archetype often demonstrate a strong and commanding presence, projecting a sense of power, and influence over others.\nThey also carry a sense of intimidation and view themselves as being at the top of the food chain, ruling over those beneath them."
		},
		"Innocent": {
			"Archetype": "Innocent",
			"Fears": "Complexity, deceit, negativity",
			"Desire": "Safety",
			"Traits": "Happiness, simplicity, honesty, positivity",
			"Branding style": "Positive, feel-good, the promotion of wholesome values",
			"Desc": "Individuals that align with the brand archetype tend to have a positive, optimistic view on life.\nWhilst they crave safety, they ultimately want everyone around them to be happy and to share their positive approach.\nThey let things go easily, and don’t hold grudges, fostering good relationships with those around them. They are honest and pure in nature, and they see good in people even when others fail to."
		},
		"Sage": {
			"Archetype": "Sage",
			"Fears": "Ignorance, inaccuracy, powerlessness",
			"Desire": "Freedom",
			"Traits": "Knowledgeable, assured, wise, expert",
			"Branding style": "The celebration of continued learning and development",
			"Desc": "The Sage brand archetype is defined as a truth-seeker, dedicated to discovering new things.\nMotivated by a desire to understand the world around them, they also want to share this understanding with others to enrich their lives.\nAs lifelong learners, they engage in deep and meaningful conversations to express their wealth of knowledge and wisdom. Rather than changing the world directly, those with this brand archetype pass on their wisdom to those who can use it for the greater good."
		},
		"Explorer": {
			"Archetype": "Explorer",
			"Fears": "Confinement, predictability, routine, stagnation, missed opportunities",
			"Desire": "Freedom",
			"Traits": "Liberation, independence, exploration, adventure-seeking, curiosity",
			"Branding style": "The celebration of continued learning and development",
			"Desc": "As the name suggests, those with this brand archetype love to explore. They feel happiest when they are pushed out of their comfort zone and they welcome the idea of a challenge.\nHowever, they don’t have a big ego and they don’t need to prove themselves to others.\nInstead their reason for taking on a new challenge is to better understand themselves by going on a journey of personal growth.\nThey love the freedom this brings and as they have an innate adventurous spirit."
		}
	}
}

},{}],3:[function(require,module,exports){

archlib= require('../../../lib/js/archetypes/lib.js');


},{"../../../lib/js/archetypes/lib.js":1}]},{},[3]);
