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

class PointLight extends Node {
    constructor(transform, material, updatecallback) {
        super(transform, updatecallback);

        this.material = material;
        // TODO: other attributes?
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
    constructor(gl, transform, vec3_vertices, vec3_normals, material, updatecallback) {
        super(transform, updatecallback);
        this.material = material;

        this.vbo_vertices = gl.createBuffer();
        this.vbo_vertices_length = vec3_vertices.length * 3;
        console.assert(vec3_vertices.length % 3 == 0, "vec3_vertices.length must be a multiple of 3");
        let data = new Float32Array(this.vbo_vertices_length);
        for (let i = 0; i < vec3_vertices.length; i++) {
            data[i*3 + 0] = vec3_vertices[i].x;
            data[i*3 + 1] = vec3_vertices[i].y;
            data[i*3 + 2] = vec3_vertices[i].z;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo_vertices);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        this.vbo_normals = gl.createBuffer();
        this.vbo_normals_length = vec3_normals.length * 3;
        console.assert(this.vbo_normals.length == this.vbo_vertices.length, "vbo_normals.length must equal vbo_vertices.length");
        let data2 = new Float32Array(this.vbo_normals_length);
        for (let i = 0; i < vec3_normals.length; i++) {
            data2[i*3 + 0] = vec3_normals[i].x;
            data2[i*3 + 1] = vec3_normals[i].y;
            data2[i*3 + 2] = vec3_normals[i].z;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo_normals);
        gl.bufferData(gl.ARRAY_BUFFER, data2, gl.STATIC_DRAW);
    }
}

class CubeMesh extends Mesh {
    constructor(gl, vec3_position, vec3_size, material, updatecallback) {
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
        ], [
            // top face
            vec3_new(0, 1, 0), vec3_new(0, 1, 0), vec3_new(0, 1, 0),
            vec3_new(0, 1, 0), vec3_new(0, 1, 0), vec3_new(0, 1, 0),
            // bottom face,
            vec3_new(0, -1, 0), vec3_new(0, -1, 0), vec3_new(0, -1, 0),
            vec3_new(0, -1, 0), vec3_new(0, -1, 0), vec3_new(0, -1, 0),
            // left (-x face)
            vec3_new(-1, 0, 0), vec3_new(-1, 0, 0), vec3_new(-1, 0, 0),
            vec3_new(-1, 0, 0), vec3_new(-1, 0, 0), vec3_new(-1, 0, 0),
            // right (+x face)
            vec3_new(1, 0, 0), vec3_new(1, 0, 0), vec3_new(1, 0, 0),
            vec3_new(1, 0, 0), vec3_new(1, 0, 0), vec3_new(1, 0, 0),
            // back (-z face)
            vec3_new(0, 0, -1), vec3_new(0, 0, -1), vec3_new(0, 0, -1),
            vec3_new(0, 0, -1), vec3_new(0, 0, -1), vec3_new(0, 0, -1),
            // front (+z face)
            vec3_new(0, 0, 1), vec3_new(0, 0, 1), vec3_new(0, 0, 1),
            vec3_new(0, 0, 1), vec3_new(0, 0, 1), vec3_new(0, 0, 1),
            vec3_new(0, 0, 1), vec3_new(0, 0, 1), vec3_new(0, 0, 1),
        ], material, updatecallback);
    }
}

class CylinderMesh extends Mesh {
    constructor(gl, vec3_position, height, bottomradius, topradius, stacks, slices, material, updatecallback) {
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
            let vertex = vec3_new(x, y, z);

            let nx = Math.sin(theta);
            let nz = Math.cos(theta);
            let normal = vec3_new(nx, 0, nz);

            return [
                vertex,
                normal,
            ];
        }

        let vertices = [];
        let normals = [];

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
                let [a, na] = vertex(height, bottomradius, topradius, stacks, slices, stackidx+1, sliceidx);
                let [b, nb] = vertex(height, bottomradius, topradius, stacks, slices, stackidx+1, sliceidx+1);
                let [c, nc] = vertex(height, bottomradius, topradius, stacks, slices, stackidx, sliceidx);
                let [d, nd] = vertex(height, bottomradius, topradius, stacks, slices, stackidx, sliceidx+1);
                vertices.push(a);
                vertices.push(c);
                vertices.push(b);
                vertices.push(d);
                vertices.push(b);
                vertices.push(c);
                normals.push(na);
                normals.push(nc);
                normals.push(nb);
                normals.push(nd);
                normals.push(nb);
                normals.push(nc);
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
            normals.push(vec3_new(0, -1, 0));
            normals.push(vec3_new(0, -1, 0));
            normals.push(vec3_new(0, -1, 0));
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
            normals.push(vec3_new(0, 1, 0));
            normals.push(vec3_new(0, 1, 0));
            normals.push(vec3_new(0, 1, 0));
        }

        super(gl, transform, vertices, normals, material, updatecallback);
    }
}

class SphereMesh extends Mesh {
    constructor(gl, vec3_position, radius, stacks, slices, material, updatecallback) {
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
        let normals = [];

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

        for (let v of vertices) {
            normals.push(vec3_new(
                v.x / radius,
                v.y / radius,
                v.z / radius,
            ));
        }

        super(gl, transform, vertices, normals, material, updatecallback);
    }
}

