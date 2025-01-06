import { Application, Container, Graphics } from 'pixi.js';
import { SCREEN, LAYOUT, UI, PAGE } from './styles.js';
import { GAME_DATA } from './gameData.js';
import { INITIAL_STATE, CONTAINERS, APP_CONFIG } from './config.js';
import { SceneManager, UIManager, DialogManager } from './managers.js';
import { test } from './test.js';
import { snake } from './snake.js';

/** Galgame引擎 */
class GalGameEngine {
    constructor() {
        // 配置
        this.layout = LAYOUT;
        this.ui = UI;
        this.gameData = GAME_DATA;  

        // 核心
        this.app = new Application();
        this.containers = {};
        this.sprites = {};

        // 状态
        this.state = structuredClone(INITIAL_STATE);

        // 缓存
        this.assetCache = {
            backgrounds: new Map(),
            characters: new Map()
        };

        // 管理器
        this.sceneManager = new SceneManager(this);
        this.uiManager = new UIManager(this);
        this.dialogManager = new DialogManager(this);
    }

    /** 初始化应用 */
    async init() {
        await this.app.init({
            width: SCREEN.width,
            height: SCREEN.height,
            ...APP_CONFIG
        });

        Object.assign(document.body.style, PAGE);

        this.wrapper = document.createElement('div');
        this.wrapper.style.position = 'relative';
        this.wrapper.style.margin = '0 auto';
        this.wrapper.appendChild(this.app.canvas);
        document.body.appendChild(this.wrapper);

        Object.entries(CONTAINERS).forEach(([key, value]) => {
            this.containers[key] = new Container();
            this.app.stage.addChild(this.containers[key]);
        });

        this.uiManager.resizeGame();
        window.addEventListener('resize', () => this.uiManager.resizeGame());
        await this.uiManager.init();

        // 加载初始场景
        const initialScene = this.sceneManager.getCurrentScene();
        if (initialScene) {
            await this.sceneManager.switchScene(initialScene.id);
        }

        this.uiManager.createRestartButton();
    }

    /** 重新开始游戏 */
    async restartGame() {
        this.dialogManager.currentDialogId++;
        this.dialogManager.isShowingDialog = false;
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        this.uiManager.clearAll();
        this.state = structuredClone(INITIAL_STATE);
        this.containers.character.removeChildren();
        this.containers.background.removeChildren();

        const initialScene = this.sceneManager.getCurrentScene();
        if (initialScene) {
            await this.sceneManager.switchScene(initialScene.id);
        }
    }
}
const galGameEngine = new GalGameEngine();

// 启动环境
// galGameEngine.init();
// test.init();
snake.init();