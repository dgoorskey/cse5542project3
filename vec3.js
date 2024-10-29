function vec3_new(x, y, z) {
    return { x: x, y: y, z: z };
}

function vec3_scale(vec3, f) {
    return vec3_new(vec3.x * f, vec3.y * f, vec3.z * f);
}
