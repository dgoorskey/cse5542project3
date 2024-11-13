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
    testpoint = mat4_multiplyvec4(transform.mat, testpoint);
    return vec3_new(testpoint.x, testpoint.y, testpoint.z);
}

/* get the basis */
// TODO: finish
function transform_getbasis(transform) {
    let xtest = vec4_new(1, 0, 0, 1);
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
function transform_rotate(transform, vec3_axis, theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    let t = 1 - Math.cos(theta);
    let x = vec3_axis.x;
    let y = vec3_axis.y;
    let z = vec3_axis.z;
    transform.mat = mat4_multiplymat4(mat4_new(
        t*x*x + c,   t*x*y - z*s, t*x*z + y*s, 0,
        t*x*y + z*s, t*y*y + c,   t*y*z - x*s, 0,
        t*x*z - y*s, t*y*z + x*s, t*z*z + c,   0,
        0,           0,           0,           1
    ), transform.mat);
    return transform;
}

/* rotate about center by theta radians */
function transform_rotatelocal(transform, vec3_axis, theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    let t = 1 - Math.cos(theta);
    let x = vec3_axis.x;
    let y = vec3_axis.y;
    let z = vec3_axis.z;
    transform.mat = mat4_multiplymat4(transform.mat, mat4_new(
        t*x*x + c,   t*x*y - z*s, t*x*z + y*s, 0,
        t*x*y + z*s, t*y*y + c,   t*y*z - x*s, 0,
        t*x*z - y*s, t*y*z + x*s, t*z*z + c,   0,
        0,           0,           0,           1
    ));
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

function transform_inverse(transform) {
    transform.mat = mat4_inverse(transform.mat);
    return transform;
}

// TODO: normalize so z=1

function transform_print(transform) {
    console.log(transform);
    console.log(transform_getposition(transform));
}

