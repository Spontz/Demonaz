import gl from './gl.js';

export class Texture {
    texture
    width
    height

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.texture = gl.device.createTexture({
            size: [width, height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }

    static createSampler() {
        return gl.device.createSampler({
            addressModeU: "repeat",  // Default is "clamp-to-edge".
            addressModeV: "repeat",  //    (The other possible value is "mirror-repeat".)
            minFilter: "linear",
            magFilter: "linear",     // Default for filters is "nearest".
            mipmapFilter: "linear",
            maxAnisotropy: 8,        // 1 is the default; 16 is the maximum.
        });
    }

    write(textureData) {
        gl.device.queue.writeTexture(
            { texture: this.texture },
            textureData,
            { bytesPerRow: this.width * 4 },
            { width: this.width, height: this.height },
        );
    }

    createTextureFromBitmap(bitmap, label) {
        gl.device.queue.copyExternalImageToTexture(
            { source: bitmap, flipY: true },
            { texture: this.texture },
            [bitmap.width, bitmap.height],
        )
    }

};

export const createTextureFromURL = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server response: ${response.status}`);
        }
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });
        const texture = new Texture(bitmap.width, bitmap.height);
        texture.createTextureFromBitmap(bitmap, url);
        return texture;
    } catch (error) {
        console.error(error.message);
    }
};

export const getDepthTexture = () =>
    gl.device.createTexture({
        label: 'depthBufferTexture',
        size: [1280, 800, 1],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

const numMipLevels = (...sizes) => {
    const maxSize = Math.max(...sizes);
    return 1 + Math.log2(maxSize) | 0;
};