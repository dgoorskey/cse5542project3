// TODO: return new transforms instead of modifying the parameter? (are params passed by copy or reference?)

function transform_new() {
    return {
        mat: mat4_new(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ),
    };
}

/* get the offset from origin */
function transform_getposition(transform) {
    let testpoint = vec4_new(0, 0, 0, 1);
    testpoint = mat4_multiplyvec4(transform, testpoint);
    return vec3_new(testpoint.x, testpoint.y, testpoint.z);
}

function transform_translate(transform, vec3) {
    transform.mat = mat4_multiplymat4(mat4_new(
        1, 0, 0, vec3.x,
        0, 1, 0, vec3.y,
        0, 0, 1, vec3.z,
        0, 0, 0, 1
    ), transform.mat);
    return transform;
}


/* rotates about origin by theta radians */
// TODO: use axis-angle rotation
function transform_rotate(transform, theta) {
    let result = transform_new();
    result.mat = mat3_multiplymat3(mat3_new(
        Math.cos(theta), -Math.sin(theta), 0,
        Math.sin(theta), Math.cos(theta),  0,
        0,               0,                1
    ), transform.mat);
    return result;
}

/* rotate about center by theta radians */
// TODO: use axis-angle rotation
function transform_rotatelocal(transform, theta) {
    let offset = transform_getposition(transform);
    transform = transform_translate(transform, vec2_scale(offset, -1)); // translate to origin
    transform = transform_rotate(transform, theta);
    transform = transform_translate(transform, offset); // translate to original position
    return transform;
}

/* scales about origin */
function transform_scale(transform, vec3) {
    transform.mat = mat4_multiplymat4(mat4_new(
        vec3.x, 0,      0,      0,
        0,      vec3.y, 0,      0,
        0,      0,      vec3.z, 0,
        0,      0,      0,      1
    ), transform.mat);
    return transform;
}

/* scale about center */
function transform_scalelocal(transform, vec3) {
    let offset = transform_getposition(transform);
    transform = transform_translate(transform, vec3_scale(offset, -1)); // translate to origin
    transform = transform_scale(transform, vec3);
    transform = transform_translate(transform, offset); // translate to original position
    return transform;
}

// TODO: normalize so z=1

function transform_print(transform) {
    console.log(transform);
    console.log(transform_getposition(transform));
}

