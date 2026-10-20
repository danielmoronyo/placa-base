# Identifique los componentes de 5 tarjetas madre BIOSTAR

Conversión a tecnologías web (HTML + CSS + SVG + JavaScript, sin dependencias ni compilación)
de la aplicación Flash `P2c_biostar.swf` de *Repare su PC*.

## Cómo usarla
Abre `index.html` en cualquier navegador (también funciona sin servidor) o sube la carpeta a cualquier hosting estático.

## Cómo funciona (igual que el original)
1. Escribe tu nombre → **Siguiente**.
2. En cada una de las 5 tarjetas (P4TSG PRO, M7VKF, M6TSU, M7TDR, P4TSE PRO) arrastra cada etiqueta
   hasta su casilla (rectángulo azul). Al soltar sobre una casilla (zona de 70 × 20 px) la etiqueta se imanta;
   si suena el aviso, está en su sitio.
3. Nota de cada tarjeta = aciertos × 100 / nº de etiquetas (18; 17 en la M7TDR). El promedio es la media de las cinco.
4. **Reiniciar** vuelve a la pantalla inicial.

## Archivos
- `index.html`, `style.css`, `app.js` – la aplicación. Los datos de las 5 tarjetas (posiciones y textos) están al inicio de `app.js`.
- `` – gráficos vectoriales extraídos del SWF (placas, logo, botón, casilla) y el sonido (`ding.mp3`).

## Diferencias respecto al SWF
- Escala automática a la ventana, pantalla completa opcional (botón de la esquina) y soporte táctil.
- El enlace del logo (la web `geocities.com/henrygc2000`, desaparecida) apunta ahora a www.reparesupc.com.
- Los enlaces se abren en pestaña nueva para no perder el progreso.
- Se omite el texto "si se toma demasiado tiempo… clic derecho → Reproducir", propio de Flash Player.
- Se corrigen fallos del original: soltar una etiqueta fuera de la ventana ya no deja el arrastre "pegado"
  y no existe la casilla fantasma de la tarjeta M7TDR.
