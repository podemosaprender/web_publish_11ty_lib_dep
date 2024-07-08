//INFO: params comodos a json para generar sitio con json2file | build

const PaletteGen= require('./palette.js')

let cfg= {
	name: "Pepon",
	color_primary: "00529c",
	mail: "m@mauriciocap.com",
}

let name= cfg.name || "Mi Sitio" //U:P

let name_safe= (cfg.name_safe || name).toLowerCase().replace(/\W+/gsi,'-');
let PFX='wip_/'+name_safe;

let d0= {
	"v_brand_name": name,
	"v_contact_mail": cfg.mail || (name_safe+"-web@o-o.fyi"),
	"v_agency_name": "o-o.fyi",
}

let contactInfo= {
	"mail": d0.v_contact_mail,
	"link": 'o-o.fyi/'+PFX,
	"map-pin": "Valencia, Espa\u00f1a"
}

let logo= {
	"text": [
		"2,50ALCS80:\ud83c\udf16",
		"35,40AL_S43:"+name,
		"40,45ALTS45:LOGO"
	],
	...cfg.logo,
}
let sections= {};

//A: tengo params

let palette= PaletteGen.palette({primary: cfg.color_primary || "#FF7F3E"}); //U:P elegi el primary, calculamos lo demas
//DBG: console.error({palette});
palette.std={
	primary: palette.alpha.base,
	primary_active: palette.alpha.light,
	white: palette.grey.lighter,
}


let def= {
	[`${PFX}/style.css.njk`]: {
		"content": "",
		"data": {
			"layout": "g1/css.njk",
			"v_logo_height_px": 48,
			"v_body_font": "Playwrite+GB+S", "v_body_font_variant": "cursive",
			"v_title_font": "Playwrite+CO", "v_title_font_variant": "cursive",
			"v_color_primary": palette.std.primary,
			"v_color_primary_active": palette.std.primary_active,
			"v_color_white": palette.std.white,
		},
		"isEmpty": false
	},
	[`${PFX}/_here.data.yaml`]: {
		"data": {
			"data": {
				"site": {
					...d0,
					"v_site_base_path": `/${PFX}/`,
					"v_site_url": `/${PFX}/`
				}
			}
		}
	},
	[`${PFX}/index.njk`]: {
		"content": "",
		"data": {
			"data": {
				"images_gen": {
					"images/logo-dark.png": {
						"sketch": "logo",
						"width": 800,
						"color": '#'+palette.std.primary,
						"bgcolor": 0, 
						...logo,
					},
					"images/logo-light.png": {
						"sketch": "logo",
						"width": 800,
						"color": "#ffffff",
						"bgcolor": '#'+palette.std.primary,
						...logo,
					}
				},
				"sections": {
					"home": {
						"type": "hero",
						"v_txt_hero_big": "acompa\u00f1amiento espiritual",
						"v_txt_hero_small": "te acompa\u00f1o",
						"v_txt_subscribe": "hablemos!",
						"v_hero_no_input": true
					},
					...sections,
					"Contacto": {
						"type": "contact",
						"v_contact_title": "Contacto",
						"v_contact_txt": "Llamame",
						"contact_items": { ...contactInfo },
					}
				}
			}
		},
		"isEmpty": false
	}
}

console.log(JSON.stringify(def,0,2))
