/* [ a b
     c d ] */
function mat2_new(
    a, b,
    c, d
) {
    return {
        a: a,
        b: b,
        c: c,
        d: d,
    };
}

/* [ a b   * [ a b
     c d ]     c d ] */
function mat2_multiplymat2(lmat2, rmat2) {
    return mat2_new(
        lmat2.a*rmat2.a + lmat2.b*rmat2.c, lmat2.a*rmat2.b + lmat2.b*rmat2.d,
        lmat2.c*rmat2.a + lmat2.d*rmat2.c, lmat2.c*rmat2.b + lmat2.d*rmat2.d
    );
}

/* [ a b   * [ x
     c d ]     y ] */
function mat2_multiplyvec2(lmat2, rvec2) {
    return vec2_new(
        lmat2.a*rvec2.x + lmat2.b*rvec2.y,
        lmat2.c*rvec2.x + lmat2.d*rvec2.y
    );
}

function mat2_determinant(mat2) {
    return mat2.a*mat2.d - mat2.b*mat2.c;
}
