class Node {
    constructor(transform) {
        this.transform = transform;
        this.parent = null; // null or a Node
        //this.children = []; // Node array
    }

    add_child(node) {
        node.parent = this;
        //this.children.push(node);
        // TODO: error if cycle
    }
}

class Camera extends Node {
    constructor(transform, fov, aspect, near, far) {
        super(transform);

        // see https://webglfundamentals.org/webgl/lessons/webgl-3d-perspective.html
        // see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#perspective_projection_matrix
        /*
        let f = Math.tan((Math.PI * 0.5) - (0.5 * fov));
        let r = 1.0 / (near - far);
        this.projection = mat4_new(
            f/aspect, 0, 0,            0,
            0,        f, 0,            0,
            0,        0, (near+far)*r, 2*near*far*r,
            0,        0, -1,           0
        );
        */
        this.projection = mat4_new(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 1.0,
            0, 0, 0, 1
        )
    }
}

class Mesh extends Node {
    /* vec3_vertices is an array of vec3, each representing a vertex.
     * every 3 vertices becomes a triangle. */
    constructor(gl, transform, vec3_vertices, color) {
        super(transform);
        this.color = color;
        this.vbo = gl.createBuffer();
        this.vbo_length = vec3_vertices.length * 3;

        console.assert(vec3_vertices.length % 3 == 0, "vec3_vertices.length must be a multiple of 3");

        let data = new Float32Array(this.vbo_length);
        for (let i = 0; i < vec3_vertices.length; i++) {
            data[i*3 + 0] = vec3_vertices[i].x;
            data[i*3 + 1] = vec3_vertices[i].y;
            data[i*3 + 2] = vec3_vertices[i].z;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
}

class CubeMesh extends Mesh {
    constructor(gl, vec3_position, vec3_size, color) {
        let transform = transform_new();
        transform = transform_scale(transform, vec3_size);
        transform = transform_translate(transform, vec3_position);

        // a-----b      (+y)
        // |\   /|\      |
        // | \ / | \     |
        // |  c-----d    |
        // |  |  |  |    |
        // e--|--f  |    *-----(+x)
        //  \ | / \ |     \
        //   \|/   \|      \
        //    g-----h      (+z)
        // c-e, d-g, b-h, and a-f are also edges
        let a = vec3_new(-1, 1,  -1);
        let b = vec3_new(1,  1,  -1);
        let c = vec3_new(-1, 1,  1);
        let d = vec3_new(1,  1,  1);
        let e = vec3_new(-1, -1, -1);
        let f = vec3_new(1,  -1, -1);
        let g = vec3_new(-1, -1, 1);
        let h = vec3_new(1,  -1, 1);

        super(gl, transform, [
            // top face
            a, c, b,
            d, b, c,
            // bottom face
            e, f, g,
            h, g, f,
            // left (-x) face
            a, e, c,
            g, c, e,
            // right (+x) face
            d, h, b,
            f, b, h,
            // back (-z) face
            b, f, a,
            e, a, f,
            // front (+z) face
            c, g, d,
            h, d, g,
        ], color);
    }
}

