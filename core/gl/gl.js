class gl {
    static async init(canvasElement) {
        if (!navigator.gpu) {
            throw Error("WebGPU not supported.");
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw Error("Couldn't request WebGPU adapter.");
        }

        gl.device = await adapter.requestDevice();

        const canvas = document.querySelector("#" + canvasElement);
        gl.context = canvas.getContext("webgpu");

        gl.context.configure({
            device: gl.device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: "premultiplied",
        });
    }
}

export default gl;