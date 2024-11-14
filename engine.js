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
        va_position:             gl.getAttribLocation(program,  "va_position"),
        va_normal:               gl.getAttribLocation(program,  "va_normal"),
        vu_canvassize:           gl.getUniformLocation(program, "vu_canvassize"),
        vu_transform:            gl.getUniformLocation(program, "vu_transform"),
        vu_cameratransform:      gl.getUniformLocation(program, "vu_cameratransform"),
        vu_projection:           gl.getUniformLocation(program, "vu_projection"),

        fu_materialambient:      gl.getUniformLocation(program, "fu_materialambient"),
        fu_materialdiffuse:      gl.getUniformLocation(program, "fu_materialdiffuse"),
        fu_materialspecular:     gl.getUniformLocation(program, "fu_materialspecular"),
        fu_materialemission:     gl.getUniformLocation(program, "fu_materialemission"),
        fu_materialreflectivity: gl.getUniformLocation(program, "fu_materialreflectivity"),

        fu_cameraposition:       gl.getUniformLocation(program, "fu_cameraposition"),
        fu_lightposition:        gl.getUniformLocation(program, "fu_lightposition"),
        fu_lightambient:         gl.getUniformLocation(program, "fu_lightambient"),
        fu_lightdiffuse:         gl.getUniformLocation(program, "fu_lightdiffuse"),
        fu_lightspecular:        gl.getUniformLocation(program, "fu_lightspecular"),
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
        transform_translate(transform_new(), vec3_new(0, 100, 120)), Math.PI * 0.5, aspect, 1, 2000, (node, delta) => {
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

        let turnspeed = Math.PI * 0.2 * delta;
        if (global_keys.has("ArrowUp")) {
            node.transform = transform_rotatelocal(node.transform, vec3_new(1, 0, 0), turnspeed);
        }
        if (global_keys.has("ArrowDown")) {
            node.transform = transform_rotatelocal(node.transform, vec3_new(1, 0, 0), -turnspeed);
        }
        if (global_keys.has("ArrowLeft")) {
            node.transform = transform_rotate(node.transform, vec3_new(0, 1, 0), turnspeed);
        }
        if (global_keys.has("ArrowRight")) {
            node.transform = transform_rotate(node.transform, vec3_new(0, 1, 0), -turnspeed);
        }
        if (global_keys.has(",")) {
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, 0, 1), turnspeed);
        }
        if (global_keys.has(".")) {
            node.transform = transform_rotatelocal(node.transform, vec3_new(0, 0, 1), -turnspeed);
        }
        /*
        if (global_keys.has(" ")) {
            if (global_keys.has("Shift")) {
                node.transform = transform_translate(node.transform, vec3_new(0, 100 * delta, 0));
            } else {
                node.transform = transform_translate(node.transform, vec3_new(0, -100 * delta, 0));
            }
        }
        */
    });
    engine.nodes.push(camera);
    engine.camera = camera;

    /*
    engine.nodes.push(engine.camera.add_child(
        new CubeMesh(engine.gl, vec3_new(0, 0, 0), vec3_new(5, 5, 5),
            material_new(
                color_new(0.0, 0.0, 0.0, 1.0),
                color_new(0.0, 0.0, 0.0, 1.0),
                color_new(0.0, 0.0, 0.0, 1.0),
                color_new(0.0, 0.0, 0.0, 0.0),
                8.0,
            ), (node, delta) => {})
    ));
    engine.nodes.push(engine.camera.add_child(
        new CubeMesh(engine.gl, vec3_new(0, 0, -2.5), vec3_new(4, 4, 4), 
            material_new(
                color_new(1.0, 1.0, 1.0, 1.0),
                color_new(1.0, 1.0, 1.0, 1.0),
                color_new(1.0, 1.0, 1.0, 1.0),
                color_new(0.0, 0.0, 0.0, 0.0),
                8.0,
            ), (node, delta) => {})
    ));
    */

    // spawn a grid of cubes
    for (let x = 0; x <= 1; x += 1/20) {
        for (let z = 0; z <= 1; z += 1/20) {
            let height = 20 * Math.random();
            let pos = vec3_new((x-0.5)*20*15, height/2, (z-0.5)*20*15);
            //let col = color_new(x*0.75+0.25, 0.0, z*0.75+0.25, 1.0);
            let col = color_new(x*0.75+0.25, 1.0, 1.0 - z*0.75+0.25, 1.0);
            let mat = material_new(
                //col,
                color_new(0.0, 0.0, 0.0, 1.0),
                color_new(0.1, 0.1, 0.1, 1.0),
                color_new(1.0, 0.6, 1.0, 1.0),
                color_new(0.0, 0.0, 0.0, 0.0),
                128.0,
            );
            if (Math.random() < 0.2) {
                mat = material_new(
                    col,
                    color_new(1.0, 1.0, 1.0, 1.0),
                    color_new(1.0, 1.0, 1.0, 1.0),
                    col,
                    1.0,
                );
            }
            let cube = new CubeMesh(engine.gl, pos, vec3_new(10, height, 10), mat, (node, delta) => {
                //node.transform = transform_translate(node.transform, vec3_new(0, Math.sin(engine.time) * delta, 0));
                //node.transform = transform_rotatelocal(node.transform, vec3_new(0, 1, 0), Math.PI * 0.5 * delta);
            });
            engine.nodes.push(cube);
        }
    }

    // make pillars
    let pillar = (position) => {
        for (let i = 0; i < 10; i++) {
            let segment = new CylinderMesh(
                engine.gl,
                vec3_new(position.x, position.y + 25 + i*50, position.z),
                50,
                Math.random()*10 + 10,
                Math.random()*10 + 10,
                4,
                8,
                material_new(
                    color_new(1.0, 1.0, i/10, 1.0),
                    color_new(1.0, 1.0, 1.0, 1.0),
                    color_new(1.0, 1.0, 1.0, 1.0),
                    color_new(0.0, 0.0, 0.0, 0.0),
                    8.0,
                ),
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

    /*
    // make table
    let table = new CylinderMesh(
        engine.gl,
        vec3_new(0, -0.5, 0),
        1,
        320,
        320,
        1,
        64,
        material_new(
            color_new(0.0, 1.0, 1.0, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(0.0, 0.0, 0.0, 0.0),
            8.0,
        ),
        (node, delta) => {}
    );
    engine.nodes.push(table);
    */

    // make orrery
    let sun = new SphereMesh(
        engine.gl,
        vec3_new(0, 50, 0),
        20,
        8,
        16,
        material_new(
            color_new(1.0, 0.7, 0.5, 1.0),
            //color_new(1.0, 1.0, 1.0, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(1.0, 0.7, 0.5, 1.0),
            512.0,
        ),
        (node, delta) => {
            let new_y = Math.sin(engine.time * 2) * 10;
            let delta_y = new_y - node._y;
            node.transform = transform_translate(node.transform, vec3_new(0, delta_y, 0));
            node._y = new_y;

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
            if (global_keys.has(" ")) {
                movement.y += 1;
            }
            if (global_keys.has("Shift")) {
                movement.y -= 1;
            }
            node.transform = transform_translate(node.transform, vec3_scale(movement, speed * delta));
        }
    );
    sun._y = 0;
    engine.nodes.push(sun);

    let sunlight = new PointLight(transform_new(),
        material_new(
            color_new(0.3, 0.3, 0.3, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(0.0, 0.0, 0.0, 1.0),
            1.0,
        ), (node, delta) => {});
    sun.add_child(sunlight);
    engine.nodes.push(sunlight);

    // add planets
    for (let i = 0; i < 10; i++) {
        let planet = new SphereMesh(
            engine.gl,
            vec3_new(i*20 + 70, 0, 0),
            5,
            4,
            8,
            material_new(
                color_new(Math.random(), Math.random(), Math.random(), 1.0),
                color_new(1.0, 1.0, 1.0, 1.0),
                color_new(1.0, 1.0, 1.0, 1.0),
                color_new(0.0, 0.0, 0.0, 0.0),
                8.0,
            ),
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
                material_new(
                    color_new(Math.random(), Math.random(), Math.random(), 1.0),
                    color_new(1.0, 1.0, 1.0, 1.0),
                    color_new(1.0, 1.0, 1.0, 1.0),
                    color_new(0.0, 0.0, 0.0, 0.0),
                    8.0,
                ),
                (node, delta) => {
                    node.transform = transform_rotate(node.transform, vec3_new(0, 1, 0), node._speed * delta);
                }
            );
            moon._speed = Math.PI * 0.7 * Math.random() / (m/3);
            planet.add_child(moon);
            engine.nodes.push(moon);
        }
    }

    // add lighting
    /*
    let light = new PointLight(transform_translate(transform_new(), vec3_new(0, 100, 0)),
        material_new(
            color_new(0.2, 0.2, 0.2, 1.0),
            color_new(1.0, 0.0, 0.0, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(0.0, 0.0, 0.0, 0.0),
            1.0,
        ), (node, delta) => {});
    engine.nodes.push(light);
    let lightshape = new SphereMesh(engine.gl, vec3_new(0, 0, 0), 5, 4, 8,
        material_new(
            color_new(1.0, 0.0, 0.0, 0.0),
            color_new(1.0, 0.0, 0.0, 0.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(0.0, 0.0, 0.0, 0.0),
            1.0,
        ), (node, delta) => {});
    engine.nodes.push(lightshape);
    light.add_child(lightshape);
    */

    // add blahaj
    let blahaj = new Mesh(
        engine.gl,
        transform_translate(
            transform_scale(
                transform_new(),
                vec3_new(20, 20, 20)
            ),
            vec3_new(0, 100, 0)
        ),
        model_vertices(MODEL_BLAHAJ_SMOOTH),
        model_normals(MODEL_BLAHAJ_SMOOTH),
        material_new(
            color_new(0.0, 0.0, 1.0, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(1.0, 1.0, 1.0, 1.0),
            color_new(0.0, 0.0, 0.0, 0.0),
            8.0,
        ),
        (node, delta) => {
            node.transform = transform_rotate(
                node.transform,
                vec3_new(0, 1, 0),
                delta * Math.PI * 2 * -0.5
            );
        }
    );
    engine.nodes.push(blahaj);

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
    //gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clearColor(1.0, 1.0, 0.7, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    for (let node of engine.nodes) {
        if (node instanceof Mesh) {
            // vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, node.vbo_vertices);
            gl.enableVertexAttribArray(shadervars.va_position);
            gl.vertexAttribPointer(shadervars.va_position, 3, gl.FLOAT, false, 0, 0);
            // normals
            gl.bindBuffer(gl.ARRAY_BUFFER, node.vbo_normals);
            gl.enableVertexAttribArray(shadervars.va_normal);
            gl.vertexAttribPointer(shadervars.va_normal, 3, gl.FLOAT, false, 0, 0);
            // other vars
            gl.uniform2fv(shadervars.vu_canvassize, [gl.canvas.width, gl.canvas.height]);
            gl_uniform_transform(gl, shadervars.vu_transform, node.get_global_transform());
            gl_uniform_transform(gl, shadervars.vu_cameratransform, transform_inverse(engine.camera.get_global_transform()));
            gl_uniform_mat4(gl, shadervars.vu_projection, engine.camera.projection);

            // lighting
            let light = null; // find closest light
            let lightdistance = 0.0;
            for (let node2 of engine.nodes) {
                if (node2 instanceof PointLight) {
                    distance = vec3_length(
                        transform_getposition(node2.get_global_transform()),
                        //node.position
                        transform_getposition(node.get_global_transform())
                    );
                    if (light == null || distance < lightdistance) {
                        light = node2;
                        lightdistance = distance;
                    }
                }
            }
            console.assert(light != null, "scene must contain at least 1 light");
            gl.uniform3fv(shadervars.fu_materialambient, [
                node.material.ambient.r,
                node.material.ambient.g,
                node.material.ambient.b,
            ]);
            gl.uniform3fv(shadervars.fu_materialdiffuse, [
                node.material.diffuse.r,
                node.material.diffuse.g,
                node.material.diffuse.b,
            ]);
            gl.uniform3fv(shadervars.fu_materialspecular, [
                node.material.specular.r,
                node.material.specular.g,
                node.material.specular.b,
            ]);
            gl.uniform3fv(shadervars.fu_materialemission, [
                node.material.emission.r,
                node.material.emission.g,
                node.material.emission.b,
            ]);
            gl.uniform1f(shadervars.fu_materialreflectivity, node.material.reflectivity); // TODO: get from material
            let cameraposition = transform_getposition(engine.camera.get_global_transform());
            gl.uniform3fv(shadervars.fu_cameraposition, [
                cameraposition.x,
                cameraposition.y,
                cameraposition.z,
            ]);
            let lightposition = transform_getposition(light.get_global_transform());
            gl.uniform3fv(shadervars.fu_lightposition, [
                lightposition.x,
                lightposition.y,
                lightposition.z,
            ]);
            gl.uniform3fv(shadervars.fu_lightambient, [
                light.material.ambient.r,
                light.material.ambient.g,
                light.material.ambient.b,
            ]);
            gl.uniform3fv(shadervars.fu_lightdiffuse, [
                light.material.diffuse.r,
                light.material.diffuse.g,
                light.material.diffuse.b,
            ]);
            gl.uniform3fv(shadervars.fu_lightspecular, [
                light.material.specular.r,
                light.material.specular.g,
                light.material.specular.b,
            ]);

            gl.drawArrays(gl.TRIANGLES, 0, node.vbo_vertices_length / 3);
            //gl.drawArrays(gl.LINE_LOOP, 0, node.vbo_vertices_length / 3);
        }
    }

    // draw again
    requestAnimationFrame((timestamp) => engine_draw(engine, timestamp));
}

