class Node {
    constructor(transform, updatecallback) {
        this.transform = transform;
        this.parent = null; // null or a Node
        //this.children = []; // Node array
        this.updatecallback = updatecallback;
    }

    add_child(node) {
        node.parent = this;
        //this.children.push(node);
        // TODO: error if cycle
        return node; // ergonomics
    }

    get_global_transform() {
        let result = transform_new();
        let node = this;
        while (node != null) {
            result.mat = mat4_multiplymat4(node.transform.mat, result.mat);
            node = node.parent;
        }
        return result;
    }

    update(delta) {
        let f = this.updatecallback; //(this, delta);
        f(this, delta);
    }
}

class Camera extends Node {
    constructor(transform, fov, aspect, near, far, updatecallback) {
        super(transform, updatecallback);

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
    constructor(gl, transform, vec3_vertices, color, updatecallback) {
        super(transform, updatecallback);
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
    constructor(gl, vec3_position, vec3_size, color, updatecallback) {
        let transform = transform_translate(transform_new(), vec3_position);

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
        let a = vec3_new(-vec3_size.x/2, vec3_size.y/2,  -vec3_size.z/2);
        let b = vec3_new(vec3_size.x/2,  vec3_size.y/2,  -vec3_size.z/2);
        let c = vec3_new(-vec3_size.x/2, vec3_size.y/2,  vec3_size.z/2);
        let d = vec3_new(vec3_size.x/2,  vec3_size.y/2,  vec3_size.z/2);
        let e = vec3_new(-vec3_size.x/2, -vec3_size.y/2, -vec3_size.z/2);
        let f = vec3_new(vec3_size.x/2,  -vec3_size.y/2, -vec3_size.z/2);
        let g = vec3_new(-vec3_size.x/2, -vec3_size.y/2, vec3_size.z/2);
        let h = vec3_new(vec3_size.x/2,  -vec3_size.y/2, vec3_size.z/2);

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
        ], color, updatecallback);
    }
}

class CylinderMesh extends Mesh {
    constructor(gl, vec3_position, height, bottomradius, topradius, stacks, slices, color, updatecallback) {
        let transform = transform_translate(transform_new(), vec3_position);

        // given cylinder params and a ring and column idx, calculates and returns that vertex.
        let vertex = (height, bottomradius, topradius, stacks, slices, ringidx, columnidx) => {
            // # rings = # stacks + 1
            // e.g. 2 stacks makes 3 rings
            // same for slices and columns
            let stackheight = height/stacks;
            let y = ringidx*stackheight - height/2; // y position of ring
            let radiusslope = (topradius - bottomradius) / height; // rise over run
            let radius = (y+height/2)*radiusslope + bottomradius;

            let sliceangle = Math.PI * 2 / slices;
            let theta = columnidx * sliceangle;

            let x = Math.sin(theta) * radius;
            let z = Math.cos(theta) * radius;
            return vec3_new(x, y, z);
        }

        let vertices = [];
        // a---b---c---d...
        // |  /|  /|  /|
        // | / | / | / |
        // |/  |/  |/  |
        // e---f---g---h...
        // triangles: aeb, fbe, bfc, gcf, cgd, hdg, etc.
        for (let stackidx = 0; stackidx < stacks; stackidx++) {
            for (let sliceidx = 0; sliceidx < slices; sliceidx++) {
                // we do one square at a time, from the bottom to the top
                // .   .
                // .   .
                // .   .
                // a---b...
                // |  /|
                // | / |
                // |/  |
                // c---d...
                let a = vertex(height, bottomradius, topradius, stacks, slices, stackidx+1, sliceidx);
                let b = vertex(height, bottomradius, topradius, stacks, slices, stackidx+1, sliceidx+1);
                let c = vertex(height, bottomradius, topradius, stacks, slices, stackidx, sliceidx);
                let d = vertex(height, bottomradius, topradius, stacks, slices, stackidx, sliceidx+1);
                vertices.push(a);
                vertices.push(c);
                vertices.push(b);
                vertices.push(d);
                vertices.push(b);
                vertices.push(c);
            }
        }

        // create the top and bottom circles
        // bottom face, looking up (+y is towards screen):
        //   b---c
        //  / \ / \
        // a---x---d
        //  \ / \ /
        //   f---e
        // triangles: axb, bxc, cxd, dxe, exf, ...
        for (let sliceidx = 0; sliceidx < slices; sliceidx++) {
            let sliceangle = Math.PI * 2 / slices;
            let a_theta = sliceidx     * sliceangle;
            let b_theta = (sliceidx+1) * sliceangle;
            let a = vec3_new(
                Math.sin(a_theta) * bottomradius,
                -height/2,
                Math.cos(a_theta) * bottomradius,
            );
            let b = vec3_new(
                Math.sin(b_theta) * bottomradius,
                -height/2,
                Math.cos(b_theta) * bottomradius,
            );
            let x = vec3_new(
                0,
                -height/2,
                0
            );
            vertices.push(a);
            vertices.push(x);
            vertices.push(b);
        }
        // top face, looking down (+y is towards you):
        //   f---e
        //  / \ / \
        // a---x---d
        //  \ / \ /
        //   b---c
        // triangles: bxa, cxb, dxc, exd, fxe, ...
        for (let sliceidx = 0; sliceidx < slices; sliceidx++) {
            let sliceangle = Math.PI * 2 / slices;
            let a_theta = sliceidx     * sliceangle;
            let b_theta = (sliceidx+1) * sliceangle;
            let a = vec3_new(
                Math.sin(a_theta) * topradius,
                height/2,
                Math.cos(a_theta) * topradius,
            );
            let b = vec3_new(
                Math.sin(b_theta) * topradius,
                height/2,
                Math.cos(b_theta) * topradius,
            );
            let x = vec3_new(
                0,
                height/2,
                0
            );
            vertices.push(b);
            vertices.push(x);
            vertices.push(a);
        }

        super(gl, transform, vertices, color, updatecallback);
    }
}

class SphereMesh extends Mesh {
    constructor(gl, vec3_position, radius, stacks, slices, color, updatecallback) {
        let transform = transform_translate(transform_new(), vec3_position);

        // given sphere params and a ring and column idx, calculates and returns that vertex.
        // 0 < ringidx < stacks
        let vertex = (radius, stacks, slices, ringidx, columnidx) => {
            // # rings = # stacks - 1 (zenith and nadir don't count as rings)
            // e.g. 2 stacks makes 3 rings
            // # columns = # slices + 1
            // e.g. 8 slices makes 9 columns
            let stackangle = Math.PI / stacks;
            let ringtheta = ringidx*stackangle; // angle from nadir
            let ringradius = Math.sin(ringtheta) * radius;
            let y = Math.cos(ringtheta) * radius;
            let sliceangle = Math.PI * 2 / slices;
            let theta = columnidx*sliceangle;
            let x = Math.sin(theta) * ringradius;
            let z = Math.cos(theta) * ringradius;
            return vec3_new(x, y, z);
        }

        let vertices = [];

        // a---b---c---d...
        // |  /|  /|  /|
        // | / | / | / |
        // |/  |/  |/  |
        // e---f---g---h...
        // triangles: aeb, fbe, bfc, gcf, cgd, hdg, etc.
        for (let stackidx = 1; stackidx < stacks; stackidx++) {
            for (let sliceidx = 0; sliceidx < slices; sliceidx++) {
                // we do one square at a time, from the bottom to the top
                // .   .
                // .   .
                // .   .
                // a---b...
                // |  /|
                // | / |
                // |/  |
                // c---d...
                let a = vertex(radius, stacks, slices, stackidx+1, sliceidx+1);
                let b = vertex(radius, stacks, slices, stackidx+1, sliceidx);
                let c = vertex(radius, stacks, slices, stackidx, sliceidx+1);
                let d = vertex(radius, stacks, slices, stackidx, sliceidx);
                vertices.push(a);
                vertices.push(c);
                vertices.push(b);
                vertices.push(d);
                vertices.push(b);
                vertices.push(c);
            }
        }

        // create the top and bottom stacks (endcaps)
        let stackangle = Math.PI / stacks;
        let ringradius = Math.sin(stackangle) * radius;
        let ringheightfromcenter = Math.cos(stackangle) * radius;
        // bottom face, looking up (+y is towards screen):
        //   b---c
        //  / \ / \
        // a---x---d
        //  \ / \ /
        //   f---e
        // triangles: axb, bxc, cxd, dxe, exf, ...
        for (let sliceidx = 0; sliceidx < slices; sliceidx++) {
            let sliceangle = Math.PI * 2 / slices;
            let a_theta = sliceidx     * sliceangle;
            let b_theta = (sliceidx+1) * sliceangle;
            let a = vec3_new(
                Math.sin(a_theta) * ringradius,
                -ringheightfromcenter,
                Math.cos(a_theta) * ringradius,
            );
            let b = vec3_new(
                Math.sin(b_theta) * ringradius,
                -ringheightfromcenter,
                Math.cos(b_theta) * ringradius,
            );
            let x = vec3_new(
                0,
                -radius,
                0
            );
            vertices.push(a);
            vertices.push(x);
            vertices.push(b);
        }
        // top face, looking down (+y is towards you):
        //   f---e
        //  / \ / \
        // a---x---d
        //  \ / \ /
        //   b---c
        // triangles: bxa, cxb, dxc, exd, fxe, ...
        for (let sliceidx = 0; sliceidx < slices; sliceidx++) {
            let sliceangle = Math.PI * 2 / slices;
            let a_theta = sliceidx     * sliceangle;
            let b_theta = (sliceidx+1) * sliceangle;
            let a = vec3_new(
                Math.sin(a_theta) * ringradius,
                ringheightfromcenter,
                Math.cos(a_theta) * ringradius,
            );
            let b = vec3_new(
                Math.sin(b_theta) * ringradius,
                ringheightfromcenter,
                Math.cos(b_theta) * ringradius,
            );
            let x = vec3_new(
                0,
                radius,
                0
            );
            vertices.push(b);
            vertices.push(x);
            vertices.push(a);
        }

        super(gl, transform, vertices, color, updatecallback);
    }
}

