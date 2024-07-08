
let name= "Pepe"
let name_safe= name.toLowerCase();

let PFX='wip_/'+name_safe;

let d0= {
	"v_brand_name": name,
	"v_contact_mail": name_safe+"-web@o-o.fyi",
	"v_agency_name": "o-o.fyi",
}
let contactInfo= {
	"mail": d0.v_contact_mail,
	"link": 'o-o.fyi/'+PFX,
	"map-pin": "Valencia, Espa\u00f1a"
}

let sections= {};

let def= {
	[`${PFX}/style.css.njk`]: {
		"content": "",
		"data": {
			"layout": "g1/css.njk",
			"v_logo_height_px": 48,
			"v_body_font": "Playwrite+GB+S", "v_body_font_variant": "cursive",
			"v_title_font": "Playwrite+CO", "v_title_font_variant": "cursive",
			"v_color_primary": "FF7F3E",
			"v_color_primary_active": "804040",
			"v_color_white": "FFF6E9"
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
						"font": "parisienne",
						"text": [
							"2,50ALCS80:\ud83c\udf16",
							"35,40AL_S43:Agua",
							"40,45ALTS45:de Luna"
						],
						"color": "#FF7F3E",
						"bgcolor": "##FFF6E9"
					},
					"images/logo-light.png": {
						"sketch": "logo",
						"width": 800,
						"font": "parisienne",
						"text": [
							"2,50ALCS80:\ud83c\udf16",
							"35,40AL_S43:Agua",
							"40,45ALTS45:de Luna"
						],
						"color": "#ffffff",
						"bgcolor": "##FFF6E9"
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
