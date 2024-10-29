/* init webgl given an html canvas element id */
function gl_new(htmlid) {
    let canvas = document.getElementById(htmlid);
    let gl;
    try {
        gl = canvas.getContext("experimental-webgl"); // "webgl" is fine too
    } catch (e) {
        console.error("failed to get webgl context from html canvas");
        return null;
    }

    return gl;
}

/* gets a shader from an html script element given its id */
function gl_getshader(gl, htmlid) {
    let script = document.getElementById(htmlid);
    if (!script) {
        return null;
    }

    let src = "";
    let k = script.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            src += k.textContent;
        }
        k = k.nextSibling;
    }

    // TODO: break this out to different functions?
    let shader;
    if (script.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (script.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("failed to compile shader " + htmlid);
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }

    //console.log(src);
    return shader;
}

/* creates a gl program given a fragment shader and vertex shader */
function gl_program_new(gl, fshader, vshader) {
    let program = gl.createProgram();

    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("failed to initialize shaders");
    }

    return program;
}

/* see https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html */
/* resizes the canvas if needed */
function gl_resize(gl) {
    if (gl.canvas.width === gl.canvas.clientWidth && gl.canvas.height === gl.canvas.clientHeight) return;
    let xratio = gl.canvas.clientWidth / gl.canvas.width;
    let yratio = gl.canvas.clientHeight / gl.canvas.height;
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

/* writes an transform to a uniform */
function gl_uniform_transform(gl, uniform, transform) {
    let mat = transform.mat;
    gl.uniformMatrix4fv(uniform, false, [
        mat.a, mat.e, mat.i, mat.m, // column-major order
        mat.b, mat.f, mat.j, mat.n,
        mat.c, mat.g, mat.k, mat.o,
        mat.d, mat.h, mat.l, mat.p,
    ]);
}
