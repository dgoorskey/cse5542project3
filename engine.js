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
        va_position:        gl.getAttribLocation(program,  "va_position"),
        vu_canvassize:      gl.getUniformLocation(program, "vu_canvassize"),
        vu_transform:       gl.getUniformLocation(program, "vu_transform"),
        vu_cameratransform: gl.getUniformLocation(program, "vu_cameratransform"),
        vu_projection:      gl.getUniformLocation(program, "vu_projection"),
        fu_color:           gl.getUniformLocation(program, "fu_color"),
    };

    return {
        gl: gl,
        shadervars: shadervars,
        camera: null, // the currently active camera
        nodes: [],    // all nodes in scene tree (i don't wanna do recursion waaaaaaa :sob: )
        time: 0.0,    // elapsed time (seconds), used to calculate delta
    };
}

function engine_run(engine) {
    console.log("Hello, world!");

    /* ============ */
    /* set up world */
    /* ============ */

    // spawn camera
    let aspect = engine.gl.canvas.clientWidth / engine.gl.canvas.clientHeight;
    let camera = new Camera(transform_translate(transform_new(), vec3_new(0, 100, 0)), Math.PI * 0.5, aspect, 1, 2000, (node, delta) => {
        //console.log(transform_getposition(node.transform).y);
        //if (transform_getposition(node.transform).y > -50) {

        // basic camera animation
        // this works somehow
        if (engine.time < 10) {
            node.transform = transform_translate(node.transform, vec3_scale(vec3_new(0, -20, -20), delta));
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, -1, 0), Math.PI * 0.05 * delta);
        } else if (engine.time < 20) {
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, -1, 0), Math.PI * 0.1 * delta);
        } else {
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, -1, 0), Math.PI * 0.1 * delta);
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, 0, 1), Math.PI * 0.1 * delta);
        }
    });
    engine.nodes.push(camera);
    engine.camera = camera;

    engine.nodes.push(engine.camera.add_child(
        new CubeMesh(engine.gl, vec3_new(0, 0, 0), vec3_new(5, 5, 5), color_new(0.0, 0.0, 0.0, 1.0), (node, delta) => {})
    ));
    engine.nodes.push(engine.camera.add_child(
        new CubeMesh(engine.gl, vec3_new(0, 0, -2.5), vec3_new(4, 4, 4), color_new(5.0, 5.0, 5.0, 1.0), (node, delta) => {})
    ));

    // spawn a grid of cubes
    for (let x = 0; x <= 1; x += 1/20) {
        for (let z = 0; z <= 1; z += 1/20) {
            let pos = vec3_new((x-0.5)*20*40, 0, (z-0.5)*20*40);
            let col = color_new(x*0.75+0.25, 1.0, z*0.75+0.25, 1.0);
            engine.nodes.push(new CubeMesh(engine.gl, pos, vec3_new(10, 10, 10), col, (node, delta) => {
                //node.transform = transform_translate(node.transform, vec3_new(0, Math.sin(engine.time) * delta, 0));
                //node.transform = transform_rotatelocal(node.transform, vec3_new(0, 0.5, 0.5), Math.PI * 0.5 * delta);
            }));
        }
    }


    // spawn some weird cube thing
    let cube = new CubeMesh(engine.gl, vec3_new(50, 25, 0), vec3_new(10, 10, 10), color_new(0.0, 0.5, 0.8, 1.0), (node, delta) => {
        //node.transform = transform_translate(node.transform, vec3_scale(vec3_new(-100, 0, 0), delta));
        node.transform = transform_rotate(node.transform, vec3_new(0, 1, 0), 1 * delta);
        node.transform = transform_rotatelocal(node.transform, vec3_new(1, 0, 0), -Math.PI * delta);
        //node.transform = transform_rotatelocal(node.transform, vec3_new(0, 0, 1), -Math.PI * delta);
    });
    engine.nodes.push(cube);
    /*
    let childcube = new CubeMesh(engine.gl, vec3_new(3, 0, 0), vec3_new(1, 1, 1), color_new(1.0, 0.0, 1.0, 1.0), (node, delta) => {});
    cube.add_child(childcube);
    engine.nodes.push(childcube);
    */

    engine.nodes.push(new Mesh(
        engine.gl,
        transform_translate(transform_new(), vec3_new(0, 0, 50)),
        [
            vec3_new(0, 0, 0),
            vec3_new(100, 0, 0),
            vec3_new(100, 100, 0),
        ],
        color_new(1.0, 0.3, 0.3, 1.0),
        (node, delta) => {}
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
        color_new(1.0, 0.3, 0.3, 1.0),
        (node, delta) => {}
    ));

    // start draw loop
    requestAnimationFrame((timestamp) => engine_draw(engine, timestamp));
}

function engine_draw(engine, timestamp) {
    let delta = timestamp/1000.0 - engine.time;
    engine.time = timestamp/1000.0;

    for (let node of engine.nodes) {
        node.update(delta);
    }

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
            gl_uniform_transform(gl, shadervars.vu_transform, node.get_global_transform());
            gl_uniform_transform(gl, shadervars.vu_cameratransform, engine.camera.get_global_transform());
            //gl_uniform_mat4(gl, shadervars.vu_cameratransform, mat4_inverse(engine.camera.get_global_transform()));
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
    requestAnimationFrame((timestamp) => engine_draw(engine, timestamp));
}

