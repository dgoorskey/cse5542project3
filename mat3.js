/* [ a b c
     d e f
     g h i ] */
function mat3_new(
    a, b, c,
    d, e, f,
    g, h, i
) {
    return {
        a: a,
        b: b,
        c: c,
        d: d,
        e: e,
        f: f,
        g: g,
        h: h,
        i: i
    };
}

/* [ a b c     [ a b c
     d e f   *   d e f
     g h i ]     g h i ] */
function mat3_multiplymat3(lmat3, rmat3) {
    let a = (lmat3.a * rmat3.a) + (lmat3.b * rmat3.d) + (lmat3.c * rmat3.g);
    let b = (lmat3.a * rmat3.b) + (lmat3.b * rmat3.e) + (lmat3.c * rmat3.h);
    let c = (lmat3.a * rmat3.c) + (lmat3.b * rmat3.f) + (lmat3.c * rmat3.i);
    let d = (lmat3.d * rmat3.a) + (lmat3.e * rmat3.d) + (lmat3.f * rmat3.g);
    let e = (lmat3.d * rmat3.b) + (lmat3.e * rmat3.e) + (lmat3.f * rmat3.h);
    let f = (lmat3.d * rmat3.c) + (lmat3.e * rmat3.f) + (lmat3.f * rmat3.i);
    let g = (lmat3.g * rmat3.a) + (lmat3.h * rmat3.d) + (lmat3.i * rmat3.g);
    let h = (lmat3.g * rmat3.b) + (lmat3.h * rmat3.e) + (lmat3.i * rmat3.h);
    let i = (lmat3.g * rmat3.c) + (lmat3.h * rmat3.f) + (lmat3.i * rmat3.i);
    return mat3_new(
        a, b, c,
        d, e, f,
        g, h, i
    );
}

/* [ a b c     [ x
     d e f   *   y
     g h i ]     z ] */
function mat3_multiplyvec3(lmat3, rvec3) {
    return vec3_new(
        (lmat3.a * rvec3.x) + (lmat3.b * rvec3.y) + (lmat3.c * rvec3.z),
        (lmat3.d * rvec3.x) + (lmat3.e * rvec3.y) + (lmat3.f * rvec3.z),
        (lmat3.g * rvec3.x) + (lmat3.h * rvec3.y) + (lmat3.i * rvec3.z)
    );
}

