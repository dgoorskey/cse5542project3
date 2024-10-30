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

function mat3_multiplyfloat(lmat3, rfloat) {
    return mat3_new(
        lmat3.a*rfloat, lmat3.b*rfloat, lmat3.c*rfloat,
        lmat3.d*rfloat, lmat3.e*rfloat, lmat3.f*rfloat,
        lmat3.g*rfloat, lmat3.h*rfloat, lmat3.i*rfloat
    );
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

/* =============== */
/* pain and misery */
/* =============== */

/* given a row and column, returns a mat3 composed of
 * everything not in that row or column. */
function mat3_submat2(mat3, row, col) {
    //console.trace();
    console.assert((row >= 0 && row < 3), "row out of range");
    console.assert((col >= 0 && col < 3), "col out of range");

    // remove row
    let row0 = [];
    let row1 = [];
    switch (row) {
        case 0:
        row0 = [mat3.d, mat3.e, mat3.f];
        row1 = [mat3.g, mat3.h, mat3.i];
        break;

        case 1:
        row0 = [mat3.a, mat3.b, mat3.c];
        row1 = [mat3.g, mat3.h, mat3.i];
        break;

        case 2:
        row0 = [mat3.a, mat3.b, mat3.c];
        row1 = [mat3.d, mat3.e, mat3.f];
        break;
    }

    // remove column
    switch (col) {
        case 0:
        row0 = [ row0[1], row0[2] ]; // row0 is now 2 long instead of 3 long
        row1 = [ row1[1], row1[2] ];
        break;

        case 1:
        row0 = [ row0[0], row0[2] ];
        row1 = [ row1[0], row1[2] ];
        break;

        case 2:
        row0 = [ row0[0], row0[1] ];
        row1 = [ row1[0], row1[1] ];
        break;
    }

    return mat2_new(
        row0[0], row0[1],
        row1[0], row1[1]
    );
}

/* returns the determinant
   (see https://www.mathsisfun.com/algebra/matrix-determinant.html) */
function mat3_determinant(mat3) {
    let result = mat3.a*(mat3.e*mat3.i - mat3.f*mat3.h)
    - mat3.b*(mat3.d*mat3.i - mat3.f*mat3.g)
    + mat3.c*(mat3.d*mat3.h - mat3.e*mat3.g);
    //console.log("mat3 determinant = " + result);
    return result;
}

/* returns the matrix of minors
   (see https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html) */
function mat3_minors(mat3) {
    let a = mat2_determinant(mat3_submat2(mat3, 0, 0));
    let b = mat2_determinant(mat3_submat2(mat3, 0, 1));
    let c = mat2_determinant(mat3_submat2(mat3, 0, 2));
    let d = mat2_determinant(mat3_submat2(mat3, 1, 0));
    let e = mat2_determinant(mat3_submat2(mat3, 1, 1));
    let f = mat2_determinant(mat3_submat2(mat3, 1, 2));
    let g = mat2_determinant(mat3_submat2(mat3, 2, 0));
    let h = mat2_determinant(mat3_submat2(mat3, 2, 1));
    let i = mat2_determinant(mat3_submat2(mat3, 2, 2));
    return mat3_new(
        a, b, c,
        d, e, f,
        g, h, i
    );
}

/* returns the matrix of cofactors
   (see https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html) */
function mat3_cofactors(mat3) {
    return mat3_new(
        mat3.a,  -mat3.b, mat3.c,
        -mat3.d, mat3.e,  -mat3.f,
        mat3.g,  -mat3.h, mat3.i
    );
}

function mat3_transpose(mat3) {
    return mat3_new(
        mat3.a, mat3.d, mat3.g,
        mat3.b, mat3.e, mat3.h,
        mat3.c, mat3.f, mat3.i
    );
}

/* returns the inverse
   (see https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html) */
function mat3_inverse(mat3) {
    let minors = mat3_minors(mat3);
    let cofactors = mat3_cofactors(minors);
    let adjugate = mat3_transpose(cofactors);
    let determinant = mat3_determinant(mat3);
    let result = mat3_multiplyfloat(adjugate, 1/determinant);
    return result;
}

