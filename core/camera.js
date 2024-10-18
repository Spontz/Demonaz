import { mat4 } from '../vendor/wgpu-matrix.js';

export class Camera {
    pos = [0, 0, 0]
    target = [0, 0, -1.0]
    up = [0, 1, 0]
    zNear = 0.1
    zFar = 100.0
    aspect = 1.77
    FOV = 60 * Math.PI / 180

    mProj = mat4.perspective(this.FOV, this.aspect, this.zNear, this.zFar)

    constructor(pos, target, up) {
        this.pos = pos ? pos : this.pos;
        this.target = target ? target : this.target;
        this.up = up ? up : this.up;

        this.mView = mat4.lookAt(this.pos, this.target, this.up);
        this.mProjView = mat4.mul(this.mProj, this.mView);
    }

    // return projection matrix
    projection(FOV, aspect, near, far) {
        this.mProj = mat4.perspective(FOV, aspect, zNear, zFar);
        this.mProjView = mat4.mul(this.mProj, this.mView);
    }

    // return viewmatrix
    // a lo mejor hacer que esto solo sea un setter y a partir de ahi generar matrix
    lookAt(pos, target, up) {
        this.pos = pos;
        this.target = target;
        this.up = up;
        this.mView = mat4.lookAt(this.pos, this.target, this.up);
        this.mProjView = mat4.mul(this.mProj, this.mView);
    }

    set pos(pos) {
        this.lookAt(pos, this.target, this.up)
    }

    set target(target) {
        this.lookAt(this.pos, target, this.up)
    }

    set up(up) {
        this.lookAt(this.pos, this.target, up)
    }

    setFOV(degrees) {
        this.FOV = degrees * Math.PI / 180;
    }

}