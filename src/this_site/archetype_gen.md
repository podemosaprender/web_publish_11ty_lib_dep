---
pagination:
  data: brand_archetypes
  size: 1
  alias: my
  resolve: values #A: it's an {}
  addAllPagesToCollections: true
permalink: "{{ my.Archetype | slugify }}/"
eleventyComputed:
  title: "{{ my.Archetype }} Archetype"
---

# {{ my.Archetype }} 

[[toc]]

{% for k,v in my %}
{% if k != "Archetype" %}
## {{ k }}

{{ v | safe }}
{% endif %}
{% endfor %}
