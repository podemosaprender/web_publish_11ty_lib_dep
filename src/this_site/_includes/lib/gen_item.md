---
mytpl: "x2.njk"
pagination:
  data: items
  size: 1
  alias: my
  resolve: values #A: it's an {}
  addAllPagesToCollections: true
eleventyComputed:
  my_title: "{{ my[ title_col or 'title' ] or 'item' }}"
  title: "{{ my_title }}"
  permalink: "{{ page.filePathStem }}/{{ my_title | slugify }}/"
---
{% extends (mytpl or "x.njk") %}

{% block content %}

# {{ my_title }}

[[toc]]

{% for k,v in my %}
## {{ k }}

{{ v | safe }}

{% endfor %}
{% endblock %}
