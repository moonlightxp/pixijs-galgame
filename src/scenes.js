import * as PIXI from 'pixi.js';
import { Assets, Sprite } from 'pixi.js';
import { SCREEN } from './styles.js';
import { ASSET_PATHS, CHARACTER_EFFECTS } from './config.js';

/** 基础场景类 */
export class BaseScene {
    constructor(game) {
        this.game = game;
    }

    /** 处理场景 */
    async handle(scene) {
        // 1. 预加载场景资源（显示加载进度）
        await this.game.assetManager.preloadSceneAssets(scene);

        // 2. 清理旧场景
        this.game.uiManager.clearAll();
        this.game.displayManager.clear();

        // 3. 准备并显示新场景
        if (scene.background) {
            await this.game.displayManager.setBackground(scene.background);
        }
        if (scene.music) {
            await this.game.audioManager.playBGM(scene.music);
        }
        await this.prepareSceneContent(scene);
        await this.handleScene(scene);
    }

    /** 准备场景特定内容（由子类实现） */
    async prepareSceneContent(scene) {
        // 默认实现为空
    }

    /** 处理具体场景逻辑（由子类实现） */
    async handleScene(scene) {
        throw new Error('handleScene must be implemented by subclass');
    }
}

/** 开始场景类 */
export class StartScene extends BaseScene {
    /** 准备场景特定内容 */
    async prepareSceneContent(scene) {
        // 准备场景显示内容
        await this.game.displayManager.prepareSceneDisplay({
            bg: scene.background,
            character_left: scene.character_left,
            character_center: scene.character_center,
            character_right: scene.character_right,
            active_characters: scene.active_characters
        });
    }

    /** 处理具体场景逻辑 */
    async handleScene(scene) {
        // 创建开始按钮
        const button = document.createElement('button');
        button.textContent = '开始游戏';
        Object.assign(button.style, {
            ...this.game.ui.button.base,
            ...this.game.ui.button.normal,
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
        });

        button.addEventListener('mouseenter', () => Object.assign(button.style, this.game.ui.button.hover));
        button.addEventListener('mouseleave', () => Object.assign(button.style, this.game.ui.button.normal));
        button.addEventListener('click', () => {
            button.remove();
            this.game.sceneManager.switchScene(scene.nextScene);
        });

        this.game.wrapper.appendChild(button);
    }
}

/** 对话场景类 */
export class DialogScene extends BaseScene {
    /** 准备场景特定内容 */
    async prepareSceneContent(scene) {
        const content = scene.contents[this.game.state.dialog.currentDialogIndex];
        if (!content) return;
        
        // 准备场景显示内容
        await this.game.displayManager.prepareSceneDisplay(content);
    }

    /** 处理具体场景逻辑 */
    async handleScene(scene) {
        // 创建对话框
        this.game.uiManager.createDialogBox();
        
        const content = scene.contents[this.game.state.dialog.currentDialogIndex];
        if (!content) return;

        // 播放语音
        if (content.voice) {
            await this.game.audioManager.playVoice(content.voice);
        }

        // 显示文本
        await this.game.contentManager.showText(content.text, content.name);
    }
}

/** 选择场景类 */
export class SelectScene extends BaseScene {
    /** 处理具体场景逻辑 */
    async handleScene(scene) {
        // TODO: 实现选择场景的逻辑
        console.log('Select scene handling is not implemented yet');
    }
} 