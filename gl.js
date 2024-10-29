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

function gl_uniform_mat4(gl, uniform, mat4) {
    gl.uniformMatrix4fv(uniform, false, [
        mat4.a, mat4.e, mat4.i, mat4.m, // column-major order
        mat4.b, mat4.f, mat4.j, mat4.n,
        mat4.c, mat4.g, mat4.k, mat4.o,
        mat4.d, mat4.h, mat4.l, mat4.p,
    ]);
}

/* writes an transform to a uniform */
function gl_uniform_transform(gl, uniform, transform) {
    gl_uniform_mat4(gl, uniform, transform.mat);
}

