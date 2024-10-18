export class Cube {

    verticesNormals = new Float32Array([
        -0.5, -0.5, 0.5, -0.577, -0.577, 0.577,  // Front-bottom-left
        0.5, -0.5, 0.5, 0.577, -0.577, 0.577,  // Front-bottom-right
        0.5, 0.5, 0.5, 0.577, 0.577, 0.577,  // Front-top-right
        -0.5, 0.5, 0.5, -0.577, 0.577, 0.577,  // Front-top-left

        -0.5, -0.5, -0.5, -0.577, -0.577, -0.577,  // Back-bottom-left
        0.5, -0.5, -0.5, 0.577, -0.577, -0.577,  // Back-bottom-right
        0.5, 0.5, -0.5, 0.577, 0.577, -0.577,  // Back-top-right
        -0.5, 0.5, -0.5, -0.577, 0.577, -0.577,
    ]);

    vertices = new Float32Array([
        -0.5, -0.5, 0.5,   // Front-bottom-left
        0.5, -0.5, 0.5,   // Front-bottom-right
        0.5, 0.5, 0.5,   // Front-top-right
        -0.5, 0.5, 0.5,   // Front-top-left

        -0.5, -0.5, -0.5,  // Back-bottom-left
        0.5, -0.5, -0.5,  // Back-bottom-right
        0.5, 0.5, -0.5,  // Back-top-right
        -0.5, 0.5, -0.5,
    ]);

    indices = new Uint16Array([
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        3, 2, 6, 3, 6, 7, // Top face
        0, 1, 5, 0, 5, 4, // Bottom face
        1, 5, 6, 1, 6, 2, // Right face
        0, 4, 7, 0, 7, 3, // Left face
    ]);



}