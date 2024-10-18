import gl from './core/gl/gl.js';
import { UniformBuffer, fetchShader } from './core/gl/shaders.js';
import { mat4 } from './vendor/wgpu-matrix.js';
import { Pipeline } from './core/gl/pipeline.js';
import { Keyboard } from './core/keyboard.js';
import { Camera } from './core/camera.js';
import { Mesh } from './core/gl/mesh.js';
import { Cube } from './core/cube.js';
import { getDepthTexture, createTextureFromURL, Texture } from './core/gl/texture.js';

const shaders = await fetchShader('main');
const clearColor = { r: 0.4, g: 0.3, b: 0.8, a: 1.0 };

const cube = new Cube();

await gl.init('c');

const mymesh = new Mesh();
// //const mymeshGLTF = new Mesh();
//await mymesh.loadGLTF('butterfly.gltf');
await mymesh.fetchW3D('./assets/man_gon.w3d');
const mytexture = await createTextureFromURL('./assets/man_goni2.jpg');
const mysampler = Texture.createSampler();
console.log(mytexture);

mymesh.writeBuffers();

const renderPipeline = new Pipeline("pipe1").
    setBufferLayout(mymesh.vertexLayout).
    setShader(shaders).
    create();
const unibuf = new UniformBuffer('uniforms for triangle', { color: 4, time: 1, model: 16, viewProj: 16, normalMat: 16 });

console.log(unibuf)


const bindGroup = gl.device.createBindGroup({

    label: 'triangle bind group',
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: unibuf.uniformBuffer } },
        { binding: 1, resource: mysampler },
        { binding: 2, resource: mytexture.texture.createView() },
    ],
});

// 7: Create GPUCommandEncoder to issue commands to the GPU
// Note: render pass descriptor, command encoder, etc. are destroyed after use, fresh one needed for each frame.

let lastTime = 0;
let fps = 0;
let xpos = 0.0, zpos = 0.0;


let model = mat4.identity();


model = mat4.scale(mat4.translation([0, -5.0, -15.0]), [0.1, 0.1, 0.1]);
//let model = mat4.translation([0, 0.0, -2.0]);
mat4.rotateX(model, 3.8, model);
mat4.rotateY(model, 1.8, model);
const camera = new Camera()
camera.lookAt([xpos, 0.0, zpos], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0]);


// let view = mat4.lookAt([xpos, 0.0, zpos], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0]);
// let proj = mat4.perspective(60 * Math.PI / 180, 1.77, 10, 2000);

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

const depthTexture = getDepthTexture();
console.log(depthTexture);


const mainLoop = (time) => {

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



    const commandEncoder = gl.device.createCommandEncoder();
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


    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    // 9: Draw the triangle

    passEncoder.setPipeline(renderPipeline);

    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.setVertexBuffer(0, mymesh.vertexBuffer);
    passEncoder.setIndexBuffer(mymesh.indexBuffer, "uint16");
    passEncoder.drawIndexed(mymesh.indexes.length);

    // End the render pass
    passEncoder.end();

    // 10: End frame by passing array of command buffers to command queue for execution
    gl.device.queue.submit([commandEncoder.finish()]);


    if (lastTime) {
        const deltaTime = time - lastTime;
        fps = 1000 / deltaTime;
        //console.log(`FPS: ${fps.toFixed(2)}`);
    }
    lastTime = time;
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);