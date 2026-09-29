#!/bin/bash
# Genera las versiones WebP que referencian index.html e index.css, a partir del original
# con el mismo nombre (.png/.jpg/.jpeg). Solo procesa lo que falta o cambió.
#  - marquee/: logos, 260 px de alto (se muestran a 130 px como máximo)
#  - assets/images, assets/fotos_web: fotos, 1600 px de ancho como máximo
# Para sumar una imagen nueva: dejá el original en la carpeta, referenciá el .webp en el HTML
# y corré este script. Requiere cwebp: brew install webp
cd "$(dirname "$0")/.." || exit 1
grep -oh '\(assets/images\|assets/fotos_web\|marquee\)/[^"'"'"')]*\.webp' index.html index.css | sort -u |
while IFS= read -r w; do
  w=$(python3 -c "import urllib.parse,sys;print(urllib.parse.unquote(sys.argv[1]))" "$w")
  src=""; for e in png jpg jpeg PNG JPG JPEG; do [ -f "${w%.webp}.$e" ] && src="${w%.webp}.$e" && break; done
  [ -n "$src" ] || { [ -f "$w" ] || echo "FALTA original de $w"; continue; }
  [ "$w" -nt "$src" ] && continue
  case "$w" in
    marquee/*) size="-resize 0 260" ;;
    *) [ "$(sips -g pixelWidth "$src" | awk '/pixelWidth/{print $2}')" -gt 1600 ] && size="-resize 1600 0" || size="" ;;
  esac
  cwebp -quiet -q 80 -alpha_q 90 $size -metadata none "$src" -o "$w" && echo "ok  $w"
done
