---
title: Brand Archetypes
eleventyNavigation:
  key: Home
  order: 1
---
{% import "lib/bs/macros.njk" as w %}

# Hola

este es el index

{{ w.bquote(author="Mauricio Cap", source="Este sitio", text="Esta quedando bueno") }}

{{ w.typo_lead(text="Esto es un parrafo, capaz me convenia probar con call?") }}

{% call w.typo_lead() -%}
Este lo escribo
adentro con call.
{%- endcall %}

<ul>
{% for p in collections.archetypes %}
    <li><a href="{{ p.data.permalink }}">{{ p.data.title }}</a></li>
{% endfor %}
</ul>

