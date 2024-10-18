import gl from './gl.js';
import { createShaderModule } from './shaders.js';


export const POL_MODE_POINTS = 'point-list';
export const POL_MODE_LINES = 'line-list';
export const POL_MODE_LINE_STRIP = 'line-strip';
export const POL_MODE_TRIANGLE = 'triangle-list';
export const POL_MODE_TRIANGLE_STRIP = 'triangle-strip';

export class Pipeline {
    constructor(label) {
        this.label = label;
        this.pipeline = {
            label: label,
            vertex: {
                module: this.shaderModule,
                entryPoint: 'vmain',
                //buffers: vertexBuffers
            },
            fragment: {
                module: this.shaderModule,
                entryPoint: 'fmain',
                targets: [{
                    format: navigator.gpu.getPreferredCanvasFormat()
                }]
            },
            primitive: {
                topology: POL_MODE_TRIANGLE,
                cullMode: 'none',
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
            layout: 'auto'
        }
    }

    setPolMode(polMode) {
        this.pipeline.primitive.topology = polMode;
        return this;
    }

    setBufferLayout(layout) {
        this.pipeline.vertex.buffers = layout;
        return this;
    }

    setShader(shader) {
        this.shaderModule = createShaderModule(gl, this.label + 'ShaderModule', shader);
        this.pipeline.vertex.module = this.shaderModule;
        this.pipeline.fragment.module = this.shaderModule;
        return this;
    }

    create() {
        if (!this.shaderModule) {
            throw new Error(`no shadermodule created in pipeline (${this.label})`);
        }
        return gl.device.createRenderPipeline(this.pipeline);
    }
}