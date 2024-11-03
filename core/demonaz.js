import gl from './gl/gl.js';

export class Demonaz {
    currentTime = 0;
    totalTime = 0;
    sections = [];

    constructor(config) {
        if (!config) {
            throw Error("No config supplied");
        }
        this.sound = config?.sound ? true : false;
        this.canvasId = config.canvasId;
    }

    async init() {
        await gl.init(this.canvasId);
        for (let section of this.sections) {
            if (typeof section.init !== 'function') {
                throw Error(`section ${section.name} doesn't have init function`);
            }
            await section.init();
        }
    }

    addSection(section) {
        if (isNaN(section.startTime) ||
            isNaN(section.endTime) ||
            isNaN(section.layer)
        ) {
            throw Error(`Invalid section fields: ${JSON.stringify(section)}`);
        }
        this.sections.push(section);
    }

    run() {
        requestAnimationFrame(() => this.tick());
    }

    tick(time) {
        //console.log(this.sections);
        for (let section of this.sections) {
            if (this.currentTime >= section.startTime && this.currentTime <= section.endTime) {
                section.render(this.currentTime);

            }
        }

        if (this.totalTime) {
            const deltaTime = time - this.totalTime;
            //fps = 1000 / deltaTime;
            //console.log(`FPS: ${fps.toFixed(2)}`);
            this.currentTime += deltaTime;
        }
        this.totalTime = time;
        requestAnimationFrame((time) => this.tick(time));
    }


}