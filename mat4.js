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

function mat4_multiplyfloat(lmat4, rfloat) {
    return mat4_new(
        lmat4.a*rfloat, lmat4.b*rfloat, lmat4.c*rfloat, lmat4.d*rfloat,
        lmat4.e*rfloat, lmat4.f*rfloat, lmat4.g*rfloat, lmat4.h*rfloat,
        lmat4.i*rfloat, lmat4.j*rfloat, lmat4.k*rfloat, lmat4.l*rfloat,
        lmat4.m*rfloat, lmat4.n*rfloat, lmat4.o*rfloat, lmat4.p*rfloat
    );
}

/* [ a b c d     [ a b c d
     e f g h   *   e f g h
     i j k l       i j k l
     m n o p ]     m n o p ] */
function mat4_multiplymat4(lmat4, rmat4) {
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

/* =============== */
/* pain and misery */
/* =============== */

/* given a row and column, returns a mat3 composed of
 * everything not in that row or column. */
function mat4_submat3(mat4, row, col) {
    //console.log(row);
    console.assert((row >= 0 && row < 4), "row out of range");
    //console.log(col);
    console.assert((col >= 0 && col < 4), "col out of range");

    // remove row
    let row0 = [];
    let row1 = [];
    let row2 = [];
    switch (row) {
        case 0:
        row0 = [mat4.e, mat4.f, mat4.g, mat4.h];
        row1 = [mat4.i, mat4.j, mat4.k, mat4.l];
        row2 = [mat4.m, mat4.n, mat4.o, mat4.p];
        break;

        case 1:
        row0 = [mat4.a, mat4.b, mat4.c, mat4.d];
        row1 = [mat4.i, mat4.j, mat4.k, mat4.l];
        row2 = [mat4.m, mat4.n, mat4.o, mat4.p];
        break;

        case 2:
        row0 = [mat4.a, mat4.b, mat4.c, mat4.d];
        row1 = [mat4.e, mat4.f, mat4.g, mat4.h];
        row2 = [mat4.m, mat4.n, mat4.o, mat4.p];
        break;

        case 3:
        row0 = [mat4.a, mat4.b, mat4.c, mat4.d];
        row1 = [mat4.e, mat4.f, mat4.g, mat4.h];
        row2 = [mat4.i, mat4.j, mat4.k, mat4.l];
        break;
    }

    // remove column
    switch (col) {
        case 0:
        row0 = [ row0[1], row0[2], row0[3] ]; // row0 is now 3 long instead of 4 long
        row1 = [ row1[1], row1[2], row1[3] ];
        row2 = [ row2[1], row2[2], row2[3] ];
        break;

        case 1:
        row0 = [ row0[0], row0[2], row0[3] ];
        row1 = [ row1[0], row1[2], row1[3] ];
        row2 = [ row2[0], row2[2], row2[3] ];
        break;

        case 2:
        row0 = [ row0[0], row0[1], row0[3] ];
        row1 = [ row1[0], row1[1], row1[3] ];
        row2 = [ row2[0], row2[1], row2[3] ];
        break;

        case 3:
        row0 = [ row0[0], row0[1], row0[2] ];
        row1 = [ row1[0], row1[1], row1[2] ];
        row2 = [ row2[0], row2[1], row2[2] ];
        break;
    }

    return mat3_new(
        row0[0], row0[1], row0[2],
        row1[0], row1[1], row1[2],
        row2[0], row2[1], row2[2],
    );
}

/* returns the determinant
   (see https://www.mathsisfun.com/algebra/matrix-determinant.html) */
function mat4_determinant(mat4) {
    let a = mat3_determinant(mat4_submat3(mat4, 0, 0));
    let b = mat3_determinant(mat4_submat3(mat4, 0, 1));
    let c = mat3_determinant(mat4_submat3(mat4, 0, 2));
    let d = mat3_determinant(mat4_submat3(mat4, 0, 3));
    //console.log("mat4 determinant = " + a + " - " + b + " + " + c + " - " + d);
    return mat4.a*a - mat4.b*b + mat4.c*c - mat4.d*d;
}

/* returns the matrix of minors
   (see https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html) */
function mat4_minors(mat4) {
    let a = mat3_determinant(mat4_submat3(mat4, 0, 0));
    let b = mat3_determinant(mat4_submat3(mat4, 0, 1));
    let c = mat3_determinant(mat4_submat3(mat4, 0, 2));
    let d = mat3_determinant(mat4_submat3(mat4, 0, 3));
    let e = mat3_determinant(mat4_submat3(mat4, 1, 0));
    let f = mat3_determinant(mat4_submat3(mat4, 1, 1));
    let g = mat3_determinant(mat4_submat3(mat4, 1, 2));
    let h = mat3_determinant(mat4_submat3(mat4, 1, 3));
    let i = mat3_determinant(mat4_submat3(mat4, 2, 0));
    let j = mat3_determinant(mat4_submat3(mat4, 2, 1));
    let k = mat3_determinant(mat4_submat3(mat4, 2, 2));
    let l = mat3_determinant(mat4_submat3(mat4, 2, 3));
    let m = mat3_determinant(mat4_submat3(mat4, 3, 0));
    let n = mat3_determinant(mat4_submat3(mat4, 3, 1));
    let o = mat3_determinant(mat4_submat3(mat4, 3, 2));
    let p = mat3_determinant(mat4_submat3(mat4, 3, 3));
    return mat4_new(
        a, b, c, d,
        e, f, g, h,
        i, j, k, l,
        m, n, o, p
    );
}

/* returns the matrix of cofactors
   (see https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html) */
function mat4_cofactors(mat4) {
    return mat4_new(
        mat4.a,  -mat4.b, mat4.c,  -mat4.d,
        -mat4.e, mat4.f,  -mat4.g, mat4.h,
        mat4.i,  -mat4.j, mat4.k,  -mat4.l,
        -mat4.m, mat4.n,  -mat4.o, mat4.p
    );
}

function mat4_transpose(mat4) {
    return mat4_new(
        mat4.a, mat4.e, mat4.i, mat4.m,
        mat4.b, mat4.f, mat4.j, mat4.n,
        mat4.c, mat4.g, mat4.k, mat4.o,
        mat4.d, mat4.h, mat4.l, mat4.p
    );
}

/* returns the inverse
   (see https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html) */
/*
function mat4_inverse(mat4) {
    let minors = mat4_minors(mat4);
    let cofactors = mat4_cofactors(minors);
    let adjugate = mat4_transpose(cofactors);
    let determinant = mat4_determinant(mat4);
    //console.log(determinant);
    let result = mat4_multiplyfloat(adjugate, 1/determinant);
    return result;
}
*/
function mat4_inverse(mat4) {
    let glmat = glmatrix_mat4.transpose(glmatrix_mat4.create([
        mat4.a, mat4.b, mat4.c, mat4.d,
        mat4.e, mat4.f, mat4.g, mat4.h,
        mat4.i, mat4.j, mat4.k, mat4.l,
        mat4.m, mat4.n, mat4.o, mat4.p,
    ])); // transposed because glmatrix has rows/cols swapped
    glmat = glmatrix_mat4.inverse(glmat);
    return mat4_new(
        glmat[0], glmat[4], glmat[8],  glmat[12],
        glmat[1], glmat[5], glmat[9],  glmat[13],
        glmat[2], glmat[6], glmat[10], glmat[14],
        glmat[3], glmat[7], glmat[11], glmat[15],
    );
}

