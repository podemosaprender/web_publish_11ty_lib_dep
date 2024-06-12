---
eleventyNavigation:
  key: Home
  order: 1
---
# Hola

este es el index

<ul>
{% for k,v in brand_archetypes %}
    <li><a href="/{{ k | slugify }}/">{{ k }}</a></li>
{% endfor %}
</ul>

