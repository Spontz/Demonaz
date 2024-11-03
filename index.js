
import { Demonaz } from './core/demonaz.js';
import { section } from './effect1.js';

const demonaz = new Demonaz({ sound: false, canvasId: 'c' });
demonaz.addSection(section);
await demonaz.init();

demonaz.run();
