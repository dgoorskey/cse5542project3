function vec2_new(x, y) {
    return { x: x, y: y };
}

function vec2_scale(vec2, f) {
    return vec2_new(vec2.x * f, vec2.y * f);
}
