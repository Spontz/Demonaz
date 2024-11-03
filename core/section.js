export class Section {

    constructor(opts) {
        this.name = opts.name;
        this.startTime = opts.startTime || 0;
        this.endTime = opts.endTime || 0;
        this.layer = opts.layer || 0;
    }

    async init() { }
    render() { }
}