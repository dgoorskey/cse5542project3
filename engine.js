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
    //let camera = new Camera(transform_translate(transform_new(), vec3_new(0, 100, 0)), Math.PI * 0.5, aspect, 1, 2000, (node, delta) => {
    let camera = new Camera(
        transform_translate(transform_new(), vec3_new(0, -100, -100)), Math.PI * 0.5, aspect, 1, 2000, (node, delta) => {
        // basic camera animation
        // this works somehow
        /*
        if (engine.time < 10) {
            node.transform = transform_translate(node.transform, vec3_scale(vec3_new(0, -20, -20), delta));
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, -1, 0), Math.PI * 0.05 * delta);
        } else if (engine.time < 20) {
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, -1, 0), Math.PI * 0.1 * delta);
        } else {
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, -1, 0), Math.PI * 0.1 * delta);
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, 0, 1), Math.PI * 0.1 * delta);
        }
        */

        let turnspeed = Math.PI * 0.1 * delta;
        if (global_keys.has("p")) {
            node.transform = transform_rotate(node.transform, vec3_new(1, 0, 0), turnspeed);
        }
        if (global_keys.has("P")) {
            node.transform = transform_rotate(node.transform, vec3_new(1, 0, 0), -turnspeed);
        }
        if (global_keys.has("y")) {
            node.transform = transform_rotate(node.transform, vec3_new(0, 1, 0), turnspeed);
        }
        if (global_keys.has("Y")) {
            node.transform = transform_rotate(node.transform, vec3_new(0, 1, 0), -turnspeed);
        }
        if (global_keys.has("r")) {
            node.transform = transform_rotate(node.transform, vec3_new(0, 0, 1), turnspeed);
        }
        if (global_keys.has("R")) {
            node.transform = transform_rotate(node.transform, vec3_new(0, 0, 1), -turnspeed);
        }
        if (global_keys.has(" ")) {
            if (global_keys.has("Shift")) {
                node.transform = transform_translate(node.transform, vec3_new(0, 100 * delta, 0));
            } else {
                node.transform = transform_translate(node.transform, vec3_new(0, -100 * delta, 0));
            }
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
            let height = 20 * Math.random();
            let pos = vec3_new((x-0.5)*20*15, height/2 - 20, (z-0.5)*20*15);
            let col = color_new(x*0.75+0.25, 1.0, z*0.75+0.25, 1.0);
            let cube = new CubeMesh(engine.gl, pos, vec3_new(10, height, 10), col, (node, delta) => {
                //node.transform = transform_translate(node.transform, vec3_new(0, Math.sin(engine.time) * delta, 0));
                //node.transform = transform_rotatelocal(node.transform, vec3_new(0, 0.5, 0.5), Math.PI * 0.5 * delta);
            });
            engine.nodes.push(cube);
        }
    }

    // make pillars
    let pillar = (position) => {
        for (let i = 0; i < 10; i++) {
            let segment = new CylinderMesh(
                engine.gl,
                vec3_new(position.x, position.y + 50 + i*50, position.z),
                50,
                Math.random()*10 + 10,
                Math.random()*10 + 10,
                4,
                8,
                color_new(1.0, 0.5 + (i/20), 1.0, 1.0),
                (node, delta) => {}
            );
            engine.nodes.push(segment);
        }
    }

    for (let i = 0; i < Math.PI * 2; i += Math.PI * 2 / 16) {
        let x = Math.sin(i) * 300;
        let z = Math.cos(i) * 300;
        pillar(vec3_new(x, 0, z));
    }

    // make orrery
    let sun = new SphereMesh(
        engine.gl,
        vec3_new(0, 100, 0),
        40,
        8,
        16,
        color_new(1.0, 0.7, 0.5, 1.0),
        (node, delta) => {
            let new_y = Math.sin(engine.time * 2) * 10;
            let delta_y = new_y - node._y;
            node.transform = transform_translate(node.transform, vec3_new(0, delta_y, 0));
            node._y = new_y;
        }
    );
    sun._y = 0;
    engine.nodes.push(sun);
    // add planets
    for (let i = 0; i < 10; i++) {
        let planet = new SphereMesh(
            engine.gl,
            vec3_new(i*20 + 70, 0, 0),
            5,
            4,
            8,
            color_new(Math.random(), Math.random(), Math.random(), 1.0),
            (node, delta) => {
                node.transform = transform_rotate(node.transform, vec3_new(0, 1, 0), node._speed * delta);
            }
        );
        planet._speed = Math.PI * 0.1 * Math.random() / (i/10);
        sun.add_child(planet);
        engine.nodes.push(planet);

        // add moons
        let mooncount = Math.max(0, Math.floor(Math.random() * 5) - 1);
        for (let m = 0; m < mooncount; m++) {
            let moon = new SphereMesh(
                engine.gl,
                vec3_new(m*3 + 8, 0, 0),
                2,
                3,
                6,
                color_new(Math.random(), Math.random(), Math.random(), 1.0),
                (node, delta) => {
                    node.transfomr = transform_rotate(node.transform, vec3_new(0, 1, 0), node._speed * delta);
                }
            );
            moon._speed = Math.PI * 0.7 * Math.random() / (m/3);
            planet.add_child(moon);
            engine.nodes.push(moon);
        }
    }

    // add player
    let player = new CubeMesh(engine.gl, vec3_new(50, 5, 0), vec3_new(10, 10, 10), color_new(0.0, 0.5, 0.8, 1.0), (node, delta) => {
        let movement = vec3_new(0, 0, 0);
        let speed = 100;
        if (global_keys.has("a")) {
            movement.x -= 1;
        }
        if (global_keys.has("d")) {
            movement.x += 1;
        }
        if (global_keys.has("w")) {
            movement.z -= 1;
        }
        if (global_keys.has("s")) {
            movement.z += 1;
        }
        node.transform = transform_translate(node.transform, vec3_scale(movement, speed * delta));
    });
    player.add_child(sun);
    engine.nodes.push(player);

    // spawn some weird cube thing
    /*
    let cube = new CubeMesh(engine.gl, vec3_new(50, 25, 0), vec3_new(10, 10, 10), color_new(0.0, 0.5, 0.8, 1.0), (node, delta) => {
        //node.transform = transform_translate(node.transform, vec3_scale(vec3_new(-100, 0, 0), delta));
        node.transform = transform_rotate(node.transform, vec3_new(0, 1, 0), 1 * delta);
        node.transform = transform_rotatelocal(node.transform, vec3_new(1, 0, 0), -Math.PI * delta);
        //node.transform = transform_rotatelocal(node.transform, vec3_new(0, 0, 1), -Math.PI * delta);
    });
    engine.nodes.push(cube);
    */
    /*
    let childcube = new CubeMesh(engine.gl, vec3_new(3, 0, 0), vec3_new(1, 1, 1), color_new(1.0, 0.0, 1.0, 1.0), (node, delta) => {});
    cube.add_child(childcube);
    engine.nodes.push(childcube);
    */

    /*
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
    */

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
            //gl.drawArrays(gl.LINES, 0, node.vbo_length / 3);
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

