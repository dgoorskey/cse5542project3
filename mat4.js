/* [ a b c d
     e f g h
     i j k l
     m n o p ] */
function mat4_new(
    a, b, c, d,
    e, f, g, h,
    i, j, k, l,
    m, n, o, p
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
        i: i,
        j: j,
        k: k,
        l: l,
        m: m,
        n: n,
        o: o,
        p: p,
    };
}

/* [ a b c d     [ a b c d
     e f g h   *   e f g h
     i j k l       i j k l
     m n o p ]     m n o p ] */
function mat4_multiplymat3(lmat4, rmat4) {
    let a = (lmat4.a * rmat4.a) + (lmat4.b * rmat4.e) + (lmat4.c * rmat4.i) + (lmat4.d * rmat4.m);
    let b = (lmat4.a * rmat4.b) + (lmat4.b * rmat4.f) + (lmat4.c * rmat4.j) + (lmat4.d * rmat4.n);
    let c = (lmat4.a * rmat4.c) + (lmat4.b * rmat4.g) + (lmat4.c * rmat4.k) + (lmat4.d * rmat4.o);
    let d = (lmat4.a * rmat4.d) + (lmat4.b * rmat4.h) + (lmat4.c * rmat4.l) + (lmat4.d * rmat4.p);

    let e = (lmat4.e * rmat4.a) + (lmat4.f * rmat4.e) + (lmat4.g * rmat4.i) + (lmat4.h * rmat4.m);
    let f = (lmat4.e * rmat4.b) + (lmat4.f * rmat4.f) + (lmat4.g * rmat4.j) + (lmat4.h * rmat4.n);
    let g = (lmat4.e * rmat4.c) + (lmat4.f * rmat4.g) + (lmat4.g * rmat4.k) + (lmat4.h * rmat4.o);
    let h = (lmat4.e * rmat4.d) + (lmat4.f * rmat4.h) + (lmat4.g * rmat4.l) + (lmat4.h * rmat4.p);

    let i = (lmat4.i * rmat4.a) + (lmat4.j * rmat4.e) + (lmat4.k * rmat4.i) + (lmat4.l * rmat4.m);
    let j = (lmat4.i * rmat4.b) + (lmat4.j * rmat4.f) + (lmat4.k * rmat4.j) + (lmat4.l * rmat4.n);
    let k = (lmat4.i * rmat4.c) + (lmat4.j * rmat4.g) + (lmat4.k * rmat4.k) + (lmat4.l * rmat4.o);
    let l = (lmat4.i * rmat4.d) + (lmat4.j * rmat4.h) + (lmat4.k * rmat4.l) + (lmat4.l * rmat4.p);

    let m = (lmat4.m * rmat4.a) + (lmat4.n * rmat4.e) + (lmat4.o * rmat4.i) + (lmat4.p * rmat4.m);
    let n = (lmat4.m * rmat4.b) + (lmat4.n * rmat4.f) + (lmat4.o * rmat4.j) + (lmat4.p * rmat4.n);
    let o = (lmat4.m * rmat4.c) + (lmat4.n * rmat4.g) + (lmat4.o * rmat4.k) + (lmat4.p * rmat4.o);
    let p = (lmat4.m * rmat4.d) + (lmat4.n * rmat4.h) + (lmat4.o * rmat4.l) + (lmat4.p * rmat4.p);
    return mat4_new(
        a, b, c, d,
        e, f, g, h,
        i, j, k, l,
        m, n, o, p
    );
}

/* [ a b c d     [ x
     e f g h   *   y
     i j k l       z
     m n o p ]     w ] */
function mat4_multiplyvec4(lmat4, rvec4) {
    return vec4_new(
        (lmat4.a * rvec4.x) + (lmat4.b * rvec4.y) + (lmat4.c * rvec4.z) + (lmat4.d * rvec4.w),
        (lmat4.e * rvec4.x) + (lmat4.f * rvec4.y) + (lmat4.g * rvec4.z) + (lmat4.h * rvec4.w),
        (lmat4.i * rvec4.x) + (lmat4.j * rvec4.y) + (lmat4.k * rvec4.z) + (lmat4.l * rvec4.w),
        (lmat4.m * rvec4.x) + (lmat4.n * rvec4.y) + (lmat4.o * rvec4.z) + (lmat4.p * rvec4.w),
    );
}

