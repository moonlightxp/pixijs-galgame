import { Application, Container, Graphics } from 'pixi.js';
import { SCREEN, LAYOUT, UI, PAGE } from './styles.js';
import { GAME_DATA } from './gameData.js';
import { INITIAL_STATE, CONTAINERS, APP_CONFIG } from './config.js';
import { SceneManager, UIManager, ContentManager, MusicManager } from './managers.js';

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
        this.contentManager = new ContentManager(this);
        this.musicManager = new MusicManager();
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
        // 重置内容管理器状态
        this.contentManager.currentDialogId++;
        this.contentManager.isShowingDialog = false;
        
        // 重置游戏状态
        this.state = {
            dialog: {
                currentSceneId: null,
                currentDialogIndex: 0,
                speed: 50
            },
            assets: {
                currentBg: null,
                currentCharacterLeft: null,
                currentCharacterCenter: null,
                currentCharacterRight: null,
                currentActiveCharacters: []
            }
        };
        
        // 停止当前音乐
        this.musicManager.stopMusic();
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 清理UI和容器
        this.uiManager.clearAll();
        this.containers.character.removeChildren();
        this.containers.background.removeChildren();
        
        // 重新加载初始场景
        const initialScene = this.gameData[Object.keys(this.gameData)[0]];
        if (initialScene) {
            await this.sceneManager.switchScene(initialScene.id);
        }
    }
}
const galGameEngine = new GalGameEngine();

// 启动环境
galGameEngine.init();