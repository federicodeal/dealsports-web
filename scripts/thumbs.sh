#!/bin/bash
# Genera miniaturas WebP (800 px de ancho) de assets/fotos_web en assets/fotos_web/thumbs/.
# Las usan las tarjetas del carrusel, el portafolio y la galería de cada proyecto
# (ver thumbUrl() en proyectos.js). Solo procesa las que faltan o cambiaron.
# Requiere cwebp: brew install webp
cd "$(dirname "$0")/../assets/fotos_web" || exit 1
mkdir -p thumbs
for f in *.jpg *.jpeg *.png *.JPG *.JPEG *.PNG; do
  [ -f "$f" ] || continue
  out="thumbs/${f%.*}.webp"
  [ "$out" -nt "$f" ] && continue
  cwebp -quiet -q 72 -resize 800 0 -metadata none "$f" -o "$out" && echo "ok  $out"
done
