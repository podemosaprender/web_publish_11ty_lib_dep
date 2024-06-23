---
mytpl: "x2.njk"
pagination:
  data: items
  size: 1
  alias: my
  resolve: values #A: it's an {}
  addAllPagesToCollections: true
eleventyComputed:
  title: "{{ my.Archetype }} Archetype"
	permalink: "{{ page.filePathStem }}/{{ my.Archetype | slugify }}/"
---
{% extends (mytpl or "x.njk") %}

{% block content %}

[[toc]]

{% for k,v in my %}
## {{ k }}

{{ v | safe }}

{% endfor %}
{% endblock %}
