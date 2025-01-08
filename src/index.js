import { Application, Container, Graphics } from 'pixi.js';
import { SCREEN, LAYOUT, UI, PAGE } from './styles.js';
import { GAME_DATA } from './gameData.js';
import { INITIAL_STATE, CONTAINERS, APP_CONFIG } from './config.js';
import { SceneManager, UIManager, ContentManager, AudioManager, AssetManager, DisplayManager } from './managers.js';

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

        // 初始化容器
        Object.entries(CONTAINERS).forEach(([key, value]) => {
            this.containers[key] = new Container();
        });

        // 状态
        this.state = structuredClone(INITIAL_STATE);

        // 管理器
        this.assetManager = new AssetManager(this);
        this.displayManager = new DisplayManager(this);
        this.sceneManager = new SceneManager(this);
        this.uiManager = new UIManager(this);
        this.contentManager = new ContentManager(this);
        this.audioManager = new AudioManager(this);
    }

    /** 初始化应用 */
    async init() {
        // 初始化 PixiJS 应用
        await this.app.init({
            width: SCREEN.width,
            height: SCREEN.height,
            backgroundColor: 0x000000,
            autoDensity: true,
            resolution: window.devicePixelRatio,
            ...APP_CONFIG
        });

        Object.assign(document.body.style, PAGE);

        this.wrapper = document.createElement('div');
        this.wrapper.style.position = 'relative';
        this.wrapper.style.margin = '0 auto';
        this.wrapper.appendChild(this.app.canvas);
        document.body.appendChild(this.wrapper);

        // 将容器添加到舞台
        Object.values(this.containers).forEach(container => {
            this.app.stage.addChild(container);
        });

        this.uiManager.resizeGame();
        window.addEventListener('resize', () => this.uiManager.resizeGame());

        // 显示加载界面
        this.uiManager.createLoadingScreen();

        try {
            // 预加载所有资源
            await this.assetManager.preloadAllAssets();
            
            // 加载完成后，切换到开始场景
            await this.sceneManager.switchScene('start_scene');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            // 显示错误信息
            if (this.uiManager.loadingText) {
                this.uiManager.loadingText.textContent = '资源加载失败，请刷新页面重试';
                this.uiManager.loadingText.style.color = '#ff4444';
            }
        }
    }
}

const galGameEngine = new GalGameEngine();

// 启动游戏
galGameEngine.init().catch(error => {
    console.error('Failed to start game:', error);
});