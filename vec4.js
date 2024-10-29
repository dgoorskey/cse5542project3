function vec4_new(x, y, z, w) {
    return { x: x, y: y, z: z, w: w };
}

function vec4_scale(vec4, f) {
    return vec4_new(vec4.x * f, vec4.y * f, vec4.z * f, vec4.w * f);
}
