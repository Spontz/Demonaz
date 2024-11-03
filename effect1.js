import gl from './core/gl/gl.js';
import { Section } from './core/section.js';
import { Camera } from './core/camera.js';
import { Keyboard } from './core/keyboard.js';
import { UniformBuffer, fetchShader } from './core/gl/shaders.js';
import { mat4 } from './vendor/wgpu-matrix.js';
import { Pipeline } from './core/gl/pipeline.js';
import { Mesh } from './core/gl/mesh.js';
import { getDepthTexture, createTextureFromURL, Texture } from './core/gl/texture.js';


export const section = new Section({ name: 'section1', startTime: 0, endTime: 10000, layer: 1 });

let fps = 0;
let xpos = 0.0, zpos = 0.0;
let model = mat4.identity();
const camera = new Camera();
let shaders, mymesh, mytexture, mysampler, depthTexture;
let renderPipeline, unibuf, bindGroup;

model = mat4.scale(mat4.translation([0, -5.0, -15.0]), [0.1, 0.1, 0.1]);
mat4.rotateX(model, 3.8, model);
mat4.rotateY(model, 1.8, model);

const clearColor = { r: 0.4, g: 0.3, b: 0.8, a: 1.0 };

Keyboard.on('a', () => {
    xpos -= 0.5;
    camera.lookAt([xpos, 0.0, zpos], [0.0, 0.0, zpos - 1.0], [0.0, 1.0, 0.0]);
});
Keyboard.on('d', () => {
    xpos += 0.5;
    camera.lookAt([xpos, 0.0, zpos], [0.0, 0.0, zpos - 1.0], [0.0, 1.0, 0.0]);
});
Keyboard.on('w', () => {
    zpos -= 0.5;
    camera.lookAt([xpos, 0.0, zpos], [0.0, 0.0, zpos - 1.0], [0.0, 1.0, 0.0]);
});
Keyboard.on('s', () => {
    zpos += 0.5;
    camera.lookAt([xpos, 0.0, zpos], [0.0, 0.0, zpos - 1.0], [0.0, 1.0, 0.0]);
});


section.init = async () => {
    shaders = await fetchShader('main');
    mymesh = new Mesh();
    await mymesh.fetchW3D('./assets/man_gon.w3d');
    mytexture = await createTextureFromURL('./assets/man_goni2.jpg');
    mysampler = Texture.createSampler();
    mymesh.writeBuffers();
    depthTexture = getDepthTexture();


    renderPipeline = new Pipeline("pipe1").
        setBufferLayout(mymesh.vertexLayout).
        setShader(shaders).
        create();

    unibuf = new UniformBuffer('uniforms for triangle', { color: 4, time: 1, model: 16, viewProj: 16, normalMat: 16 });
    console.log(unibuf);

    bindGroup = gl.device.createBindGroup({
        label: 'triangle bind group',
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: unibuf.uniformBuffer } },
            { binding: 1, resource: mysampler },
            { binding: 2, resource: mytexture.texture.createView() },
        ],
    });



    camera.lookAt([xpos, 0.0, zpos], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0]);
};



section.render = (time) => {

    mat4.rotateX(model, 0.01, model);
    let normal = mat4.inverse(model)
    normal = mat4.transpose(normal);
    //model = mat4.translation([0, 0, - (time / 10000)]);
    // view = mat4.lookAt([Math.sin(time * 0.001), 0.0, 0.0], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0]);
    unibuf.update('time', [time]).
        update('color', [1, 1, 0, 1]).
        update('normalMat', normal).
        update('model', model).
        update('viewProj', camera.mProjView).
        write();


    const renderPassDescriptor = {
        colorAttachments: [{
            clearValue: clearColor,
            loadOp: 'clear',
            storeOp: 'store',
            view: gl.context.getCurrentTexture().createView()
        }],
        depthStencilAttachment: {
            view: depthTexture.createView(),
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: "store",
        }
    };


    const commandEncoder = gl.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);


    passEncoder.setPipeline(renderPipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.setVertexBuffer(0, mymesh.vertexBuffer);
    passEncoder.setIndexBuffer(mymesh.indexBuffer, "uint16");
    passEncoder.drawIndexed(mymesh.indexes.length);

    // End the render pass
    passEncoder.end();

    // 10: End frame by passing array of command buffers to command queue for execution
    gl.device.queue.submit([commandEncoder.finish()]);

}

