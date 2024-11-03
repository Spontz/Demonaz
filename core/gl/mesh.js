import gl from './gl.js';
import { glTFLoader } from '../../vendor/minimal-gltf-loader.js';
import { vec3 } from '../../vendor/wgpu-matrix.js';
import { fetchAsset } from '../utils.js';

export class Mesh {

    async loadGLTF(url) {
        const gltf = await this._loadGLTFAsync(url);
        this.indexes = new Uint16Array(gltf.bufferViews[0].data);
        this.vertices = new Float32Array(gltf.bufferViews[1].data);
    }

    _loadGLTFAsync(path) {
        return new Promise((resolve, reject) => {
            try {
                const gltfL = new glTFLoader();
                gltfL.loadGLTF(path, resolve);
            } catch (error) {
                reject(error);
            }
        })
    }

    base64ToUint8Array(data) {
        const binaryString = atob(data);
        const buffer = new ArrayBuffer(binaryString.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < binaryString.length; i++) {
            view[i] = binaryString.charCodeAt(i);
        }

        return buffer
    }

    loadW3D(file) {
        let buffer = this.base64ToUint8Array(file.meshes[0].indexes);
        this.indexes = new Uint16Array(buffer);
        buffer = this.base64ToUint8Array(file.meshes[0].vertices);
        this.vertices = new Float32Array(buffer);
        this.generateVertexLayout({ normals: file.meshes[0].normals, coords: file.meshes[0].normals });
        console.log(`Mesh loaded [triangles: ${this.indexes.length} vertices: ${this.vertices.length / 8}] - normals: ${file.meshes[0].normals} coords: ${file.meshes[0].coords} }`);
    }

    generateVertexLayout(opts) {
        let offset = 12;
        let location = 1;
        const attributes = [{
            shaderLocation: 0, // position
            offset: 0,
            format: 'float32x3'
        }];

        if (opts.normals) {
            attributes.push({
                shaderLocation: location, // normal
                offset: offset,
                format: 'float32x3'
            });
            offset += 12;
            location++;
        }
        if (opts.coords) {
            attributes.push({
                shaderLocation: location, // coords
                offset: offset,
                format: 'float32x2'
            });
            offset += 8;
        }

        this.vertexLayout = [{
            attributes: attributes,
            arrayStride: offset,
        }];

        console.log(this.vertexLayout);
    }

    writeBuffers() {
        this.vertexBuffer = gl.device.createBuffer({
            size: this.vertices.byteLength, // make it big enough to store vertices in
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        gl.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices, 0, this.vertices.length);

        this.indexBuffer = gl.device.createBuffer({
            size: this.indexes.byteLength, // make it big enough to store vertices in
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        gl.device.queue.writeBuffer(this.indexBuffer, 0, this.indexes, 0, this.indexes.length);
    }

    async fetchW3D(url) {
        const res = await fetchAsset(url);
        try {
            const json = await res.json();
            this.loadW3D(json);
        } catch (error) {
            console.error(error.message);
        }
    }


    generateNormals() {
        const vn = Array.from({ length: this.vertices.length / 5 }, () => ({ x: 0.0, y: 0.0, z: 0.0 }));

        for (let i = 0; i < this.indexes.length; i += 3) {
            const i1 = this.indexes[i];
            const i2 = this.indexes[i + 1];
            const i3 = this.indexes[i + 2];

            const v1 = vec3.create(this.vertices[i1 * 8], this.vertices[i1 * 8 + 1], this.vertices[i1 * 8 + 2]);
            const v2 = vec3.create(this.vertices[i2 * 8], this.vertices[i2 * 8 + 1], this.vertices[i2 * 8 + 2]);
            const v3 = vec3.create(this.vertices[i3 * 8], this.vertices[i3 * 8 + 1], this.vertices[i3 * 8 + 2]);

            const tmp1 = vec3.create(v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]); //    vec3.subtract(v3, v2);
            const tmp2 = vec3.create(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]); // vec3.subtract(v1, v2);
            const normal = vec3.normalize(vec3.cross(tmp1, tmp2));
            vn[i1].x += normal[0];
            vn[i1].y += normal[1];
            vn[i1].z += normal[2];

            vn[i2].x += normal[0];
            vn[i2].y += normal[1];
            vn[i2].z += normal[2];

            vn[i3].x += normal[0];
            vn[i3].y += normal[1];
            vn[i3].z += normal[2];
        }
    }
}
