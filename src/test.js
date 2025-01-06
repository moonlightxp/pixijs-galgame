import { Application, Graphics, Container, Text } from 'pixi.js';
import * as UI from './ui.js';

export class Test {
    constructor() {
        this.app = new Application();
    }

    async init() {
        await this.app.init({
            width: 1920,
            height: 1080,
            backgroundColor: 0xAAAAAA,
        });
        document.body.appendChild(this.app.canvas);
        
        const testRect = UI.uiCreateRect({
            style: {
                width: 800,
                height: 100,

                background: 0x000000,
                alpha: 0.4, 

                zIndex: 900,

                posAdapt: UI.POS_ADAPT.TOP_LEFT,
                offset: { x: 0, y: 0 }, 
            }
        });

        const testText = UI.uiCreateText({
            text: 'test',
            style: {
                width: 200,

                textSize: 50,
                textColor: 0xFF0000,
                alpha: 1,

                zIndex: 999,

                lineAlign: 'left',
                expand: 'right',

                posAdapt: UI.POS_ADAPT.TOP_LEFT,
                offset: { x: 0, y: 0 }, 
            }
        });
        
        this.app.stage.addChild(testRect);
        this.app.stage.addChild(testText);
        
        UI.updateAllUI(this.app.stage);
    }
}

export const test = new Test(); 