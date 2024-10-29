/* r g b a ranging from 0.0 to 1.0 */
function color_new(r, g, b, a) {
    return { r: r, g: g, b: b, a: a };
}

/* converts a color object into a #rrggbb hex string */
function color2hex(color) {
    // see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    return "#" + [color.r, color.g, color.b].map(c => {
        const h = Math.floor(c * 255.0).toString(16);
        if (h.length === 1) {
            return "0" + h;
        }
        return h;
    }).join("");
}

/* color constants */
const COLOR_RED = color_new(0.98, 0.431, 0.475, 1); // see https://lospec.com/palette-list/lospec500
const COLOR_GREEN = color_new(0.651, 0.796, 0.588, 1);
const COLOR_BLUE = color_new(0.212,0.773,0.957, 1);
const COLOR_WHITE = color_new(0.965, 0.91, 0.878, 1);

