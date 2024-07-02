---
title: o-o.fyi site builder
eleventyNavigation:
  key: Home
  order: 1
data:
  sections:
    home:
      type: markdown
      markdown: |
        # Cómo usar nuestro generador 

        Lo separamos en dos secciones:
        
        1. [Herramientas](#tools) simples que podés combinar
        1. [Formas de combinarlas](#uses)

    tools:
      type: blogmini
      v_blog_title: Tools
      v_blog_txt: Las herramientas que vamos construyendo y combinando.
      posts:
        collection: example_tools
    uses:
      type: blogmini
      v_blog_title: Uses
      v_blog_txt: Como usamos esas herramientas
      posts:
        collection: example_uses
------


