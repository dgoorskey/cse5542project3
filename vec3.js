function vec3_new(x, y, z) {
    return { x: x, y: y, z: z };
}

function vec3_scale(vec3, f) {
    return vec3_new(vec3.x * f, vec3.y * f, vec3.z * f);
}

function vec3_length(vec3) {
    return Math.sqrt(vec3.x*vec3.x, vec3.y*vec3.y, vec3.z*vec3.z);
}

function vec3_addvec3(a, b) {
    return vec3_new(a.x + b.x, a.y + b.y, a.z + b.z);
}

