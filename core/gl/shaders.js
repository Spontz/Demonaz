import gl from './gl.js';
import { fetchAsset } from '../utils.js';

export function createShaderModule(gl, label, shaders) {
    return gl.device.createShaderModule({
        label,
        code: shaders
    });
}

export class UniformBuffer {
    offsets = {};

    constructor(label, values) {
        let bufferSize = 0;
        for (const [key, value] of Object.entries(values)) {
            this.offsets[key] = bufferSize / 4;
            const valueBytes = value * 4;
            const padding = (16 - (valueBytes % 16)) % 16;
            bufferSize += (valueBytes + padding); // padding per var
        }

        this.uniformBuffer = gl.device.createBuffer({
            label: label,
            size: bufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.uniformValues = new Float32Array(bufferSize / 4);
        //   const kColorOffset = 0;
        //   const kTimeOffset = 4;
        // uniformValues.set([0, 1, 0, 1], kColorOffset);        // set the color
        console.log(this.offsets);
    }

    update(uniformName, value) {
        if (!uniformName in this.offsets) {
            throw Error(`Uniform not found: ${uniformName}`);
        }
        this.uniformValues.set(value, this.offsets[uniformName]);
        return this;
    }

    write() {
        gl.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformValues);
    }
}

export async function fetchShader(shader) {
    const res = await fetchAsset(`./shaders/${shader}.wgsl`);
    return await res.text();
}