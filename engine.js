function engine_new(htmlid_canvas, htmlid_vshader, htmlid_fshader) {
    let gl = gl_new(htmlid_canvas);

    /* ================================= */
    /* init shaders and shader variables */
    /* ================================= */
    let fshader = gl_getshader(gl, htmlid_fshader);
    let vshader = gl_getshader(gl, htmlid_vshader);
    let program = gl_program_new(gl, fshader, vshader);
    gl.useProgram(program);

    let shadervars = {
        va_position:   gl.getAttribLocation(program,  "va_position"),
        vu_canvassize: gl.getUniformLocation(program, "vu_canvassize"),
        vu_transform:  gl.getUniformLocation(program, "vu_transform"),
        vu_projection: gl.getUniformLocation(program, "vu_projection"),
        fu_color:      gl.getUniformLocation(program, "fu_color"),
    };

    let root = new Node(transform_new()); // empty node as root of entire scene tree

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    return {
        gl: gl,
        shadervars: shadervars,
        camera: new Camera(transform_new(), Math.PI * 0.5, aspect, 1, 2000),
        nodes: [], // all nodes in scene tree (i don't wanna do recursion waaaaaaa :sob: )
    };
}

function engine_run(engine) {
    console.log("Hello, world!");

    /* ============ */
    /* set up world */
    /* ============ */
    engine.nodes.push(new Node(transform_new()));
    engine.nodes.push(new CubeMesh(engine.gl, vec3_new(100, -100, 90), vec3_new(10, 10, 10), color_new(0.0, 0.5, 0.8, 1.0)));

    engine.nodes.push(new Mesh(
        engine.gl,
        transform_translate(transform_new(), vec3_new(0, 0, 50)),
        [
            vec3_new(0, 0, 0),
            vec3_new(100, 0, 0),
            vec3_new(100, 100, 0),
        ],
        color_new(1.0, 0.3, 0.3, 1.0)
    ));
    engine.nodes.push(new Mesh(
        engine.gl,
        transform_translate(transform_new(), vec3_new(-200, 400, -200)),
        [
            vec3_new(0, 0, 0),
            vec3_new(0, 0, -100),
            vec3_new(0, 400, 0),

            vec3_new(0, 400, -110),
            vec3_new(0, 400, -10),
            vec3_new(0, 0, -110),

            vec3_new(-400, 0, 0),
            vec3_new(0, 0, 0),
            vec3_new(-400, 400, 0),

            vec3_new(-400, 0, -100),
            vec3_new(0, 0, -100),
            vec3_new(-400, 0, 0),
        ],
        color_new(1.0, 0.3, 0.3, 1.0)
    ));

    // start draw loop
    requestAnimationFrame((delta) => engine_draw(engine, delta));
}

function engine_draw(engine, delta) {
    let gl = engine.gl;
    let shadervars = engine.shadervars;

    gl_resize(gl);
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    for (let node of engine.nodes) {
        if (node instanceof Mesh) {
            gl.bindBuffer(gl.ARRAY_BUFFER, node.vbo);
            gl.enableVertexAttribArray(shadervars.va_position);
            gl.vertexAttribPointer(shadervars.va_position, 3, gl.FLOAT, false, 0, 0);
            gl.uniform2fv(shadervars.vu_canvassize, [gl.canvas.width, gl.canvas.height]);
            gl_uniform_transform(gl, shadervars.vu_transform, node.transform);
            gl.uniform4fv(shadervars.fu_color, [
                node.color.r,
                node.color.b,
                node.color.g,
                node.color.a,
            ]);
            gl_uniform_mat4(gl, shadervars.vu_projection, engine.camera.projection);
            gl.drawArrays(gl.TRIANGLES, 0, node.vbo_length / 3);
        }
    }

    //gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    //gl.enableVertexAttribArray(shadervars.va_position);
    //gl.vertexAttribPointer(shadervars.va_position, 2 /* x y */, gl.FLOAT, false, 0, 0);
    //gl.uniform2fv(shadervars.vu_canvassize, [gl.canvas.width, gl.canvas.height]);
    //gl_uniform_xform(gl, shadervars.vu_xform, xform);
    //gl.uniform4fv(shadervars.fu_color, [color.r, color.g, color.b, color.a]);
    //gl.drawArrays(gl.TRIANGLES, 0, 3 /* 1 triangle */);

    // draw again
    requestAnimationFrame((delta) => engine_draw(engine, delta));
}

