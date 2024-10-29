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
    constructor(transform) {
        super(transform);
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

        super(gl, transform_new(), [
            // top face
            a, b, c,
            d, c, b,
            // bottom face
            e, f, g,
            h, g, f,
            // left (-x) face
            a, c, e,
            g, e, c,
            // right (+x) face
            d, b, h,
            f, h, b,
            // back (-z) face
            b, a, f,
            e, f, a,
            // right (+z) face
            c, d, g,
            h, g, d,
        ], color);
    }
}

