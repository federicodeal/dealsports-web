#!/usr/bin/env python3
"""Genera un HTML por página a partir de index.html (lo corre el deploy en GitHub Actions).

index.html sigue siendo la única fuente: tiene todas las páginas y el router. Este script
crea /canchas-de-padel/index.html, /nosotros/index.html, etc. con:
  - esa página ya visible (clase "active") y su link del menú marcado,
  - su <title>, meta description, canonical y Open Graph (datos de #page-meta),
  - las imágenes de esa página con src, y las de la home diferidas (data-src),
y regenera sitemap.xml con todas las páginas indexables.

Uso local para previsualizar: python3 scripts/build-pages.py && python3 -m http.server
Las carpetas generadas están en .gitignore.
"""
import datetime
import html
import json
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SITE = 'https://dealsports.net'
SPORT_PAGES = {'padel', 'tenis', 'futbol', 'putting', 'basket', 'skate', 'hockey'}


def page_block(s, page):
    """(inicio, fin) del <div class="page..." id="page-X"> hasta el próximo page o el footer."""
    start = re.search(r'<div class="page[^"]*" id="page-%s"' % page, s).start()
    nxt = re.compile(r'<div class="page[^"]*" id="page-|<footer').search(s, start + 10)
    return start, nxt.start()


def swap_imgs(block, to_src):
    """to_src=True: data-src → src. False: src → data-src (salvo src vacíos)."""
    def f(m):
        tag = m.group(0)
        if to_src:
            return re.sub(r'(\s)data-src="', r'\1src="', tag, count=1)
        if 'data-src=' in tag or re.search(r'\ssrc=""', tag):
            return tag
        return re.sub(r'(\s)src="', r'\1data-src="', tag, count=1)
    return re.sub(r'<img\b[^>]*>', f, block, flags=re.S)


def set_attr(s, pattern, value):
    new, n = re.subn(pattern, lambda m: m.group(1) + html.escape(value, quote=True) + m.group(2), s, count=1)
    assert n == 1, pattern
    return new


def build_page(src, page, meta):
    s = src
    # Página visible: sacar "active" de la home y ponérselo a esta
    s = s.replace('class="page active" id="page-home"', 'class="page" id="page-home"', 1)
    s = re.sub(r'class="page" id="page-%s"' % page, 'class="page active" id="page-%s"' % page, s, count=1)

    # Imágenes: las de esta página se cargan, las de la home se difieren
    a, b = page_block(s, page)
    s = s[:a] + swap_imgs(s[a:b], True) + s[b:]
    a, b = page_block(s, 'home')
    s = s[:a] + swap_imgs(s[a:b], False) + s[b:]

    # Menú: marcar el link de esta página
    s = s.replace('class="nav-link active" onclick="navigate(\'home\')', 'class="nav-link" onclick="navigate(\'home\')', 1)
    nav_id = 'superficies' if page in SPORT_PAGES else ('portafolio' if page == 'proyecto' else page)
    # (la 404 no marca ningún link: no existe nav-404)
    s = re.sub(r'class="nav-link([^"]*)"([^>]*id="nav-%s")' % nav_id, r'class="nav-link active\1"\2', s, count=1)
    s = s.replace('<header class="header header--transparent"', '<header class="header"', 1)

    # Metadatos
    url = SITE + meta['path']
    s = set_attr(s, r'(<title>)[^<]*(</title>)', meta['title'])
    s = set_attr(s, r'(<meta name="description" content=")[^"]*(">)', meta['description'])
    s = set_attr(s, r'(<link rel="canonical" href=")[^"]*(">)', url)
    s = set_attr(s, r'(<meta property="og:url" content=")[^"]*(">)', url)
    s = set_attr(s, r'(<meta property="og:title" content=")[^"]*(">)', meta['title'])
    s = set_attr(s, r'(<meta property="og:description" content=")[^"]*(">)', meta['description'])
    if meta.get('noindex'):
        s = s.replace('<meta name="description"', '<meta name="robots" content="noindex">\n  <meta name="description"', 1)
    return s


def main():
    src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    meta_all = json.loads(re.search(r'<script type="application/json" id="page-meta">(.*?)</script>', src, re.S).group(1))

    for page, meta in meta_all.items():
        if meta['path'] == '/':
            continue
        if meta['path'].endswith('.html'):          # /404.html: archivo suelto en la raíz
            out_file = os.path.join(ROOT, meta['path'].lstrip('/'))
        else:
            out_dir = os.path.join(ROOT, meta['path'].strip('/'))
            os.makedirs(out_dir, exist_ok=True)
            out_file = os.path.join(out_dir, 'index.html')
        with open(out_file, 'w', encoding='utf-8') as f:
            f.write(build_page(src, page, meta))
        print('ok ', meta['path'])

    today = datetime.date.today().isoformat()
    urls = ''.join(
        f'  <url>\n    <loc>{SITE}{m["path"]}</loc>\n    <lastmod>{today}</lastmod>\n  </url>\n'
        for m in meta_all.values() if not m.get('noindex')
    )
    with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n'
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>\n')
    print('ok  sitemap.xml')


if __name__ == '__main__':
    main()
