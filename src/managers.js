import { Assets, Sprite, Text, Graphics, Container } from 'pixi.js';
import { SCREEN } from './styles.js';
import { ASSET_PATHS } from './config.js';
import { NormalScene, SelectScene } from './scenes.js';

/** 场景管理器 */
export class SceneManager {
    constructor(game) {
        this.game = game;
        this.normalScene = new NormalScene(game);
        this.selectScene = new SelectScene(game);
    }

    /** 获取当前场景 */
    getCurrentScene() {
        return this.game.gameData[this.game.state.dialog.currentSceneId];
    }

    /** 切换到新场景 */
    async switchScene(sceneId) {
        if (!this.game.gameData[sceneId]) return;
        
        this.game.state.dialog.currentSceneId = sceneId;
        this.game.state.dialog.currentDialogIndex = 0;
        
        const scene = this.getCurrentScene();
        switch (scene.type) {
            case 'normal':
                await this.normalScene.handle(scene);
                break;
            case 'select':
                await this.selectScene.handle(scene);
                break;
            default:
                console.error('Unknown scene type:', scene.type);
        }
    }
}

/** UI管理器 */
export class UIManager {
    constructor(game) {
        this.game = game;
        this.nextSceneButton = null;
        this.nameText = null;
        this.dialogText = null;
    }

    /** 清空所有 UI 状态 */
    clearAll() {
        this.clearDialogText();
        this.clearNextSceneButton();
    }

    /** 设置对话文本 */
    setDialogText(text) {
        this.dialogText.text = text;
    }

    /** 设置说话人名字 */
    setNameText(name) {
        this.nameText.text = name;
    }

    /** 清空对话文本 */
    clearDialogText() {
        this.dialogText.text = '';
        this.nameText.text = '';
    }

    /** 调整画布大小 */
    resizeGame() {
        const width = window.innerWidth;
        const scale = width / SCREEN.width;
        const height = SCREEN.height * scale;
        
        this.game.wrapper.style.width = `${width}px`;
        this.game.wrapper.style.height = `${height}px`;
        this.game.app.renderer.resize(width, height);

        Object.values(this.game.containers).forEach(container => {
            container.scale.set(scale);
        });
    }

    /** 初始化UI */
    async init() {
        const dialogY = SCREEN.height - this.game.ui.dialog.height;
        
        const dialogBox = new Graphics()
            .rect(0, dialogY, SCREEN.width, this.game.ui.dialog.height)
            .fill(this.game.ui.dialog.background);
        
        dialogBox.eventMode = 'static';
        dialogBox.cursor = 'pointer';
        dialogBox.on('click', () => this.game.dialogManager.handleTextClick());
        
        this.nameText = new Text({
            text: '',
            style: { ...this.game.ui.text.base, ...this.game.ui.text.name }
        });
        this.nameText.x = this.game.ui.text.padding;
        this.nameText.y = dialogY + this.game.ui.text.nameOffsetY;
        
        this.dialogText = new Text({
            text: '',
            style: this.game.ui.text.base
        });
        this.dialogText.x = this.game.ui.text.padding;
        this.dialogText.y = dialogY + this.game.ui.text.dialogOffsetY;

        this.game.containers.ui.addChild(dialogBox, this.nameText, this.dialogText);
    }

    /** 创建重新开始按钮 */
    createRestartButton() {
        const button = document.createElement('button');
        button.textContent = '重新开始';
        Object.assign(button.style, {
            ...this.game.ui.button.base,
            ...this.game.ui.button.normal
        });

        button.addEventListener('mouseenter', () => Object.assign(button.style, this.game.ui.button.hover));
        button.addEventListener('mouseleave', () => Object.assign(button.style, this.game.ui.button.normal));
        button.addEventListener('click', () => this.game.restartGame());

        this.game.wrapper.appendChild(button);
    }

    /** 清理下一场景按钮 */
    clearNextSceneButton() {
        if (this.nextSceneButton && this.nextSceneButton.parentNode) {
            this.nextSceneButton.parentNode.removeChild(this.nextSceneButton);
            this.nextSceneButton = null;
        }
    }

    /** 显示下一场景按钮 */
    showNextSceneButton() {
        this.clearNextSceneButton();
        const button = document.createElement('button');
        this.nextSceneButton = button;
        button.textContent = '继续';
        Object.assign(button.style, {
            ...this.game.ui.button.base,
            ...this.game.ui.button.next
        });

        button.addEventListener('mouseenter', () => Object.assign(button.style, this.game.ui.button.hover));
        button.addEventListener('mouseleave', () => Object.assign(button.style, this.game.ui.button.normal));
        button.addEventListener('click', () => {
            this.clearNextSceneButton();
            this.game.sceneManager.switchScene(this.game.gameData[this.game.state.dialog.currentSceneId].nextScene);
        });

        this.game.wrapper.appendChild(button);
    }
}

/** 对话管理器 */
export class DialogManager {
    constructor(game) {
        this.game = game;
        this.currentDialogId = 0;
        this.isShowingDialog = false;
    }

    /** 检查是否有下一条文本 */
    hasNextContent(scene) {
        return this.game.state.dialog.currentDialogIndex < scene.contents.length - 1;
    }

    /** 获取当前内容 */
    getCurrentContent(scene) {
        return scene.contents[this.game.state.dialog.currentDialogIndex];
    }

    /** 显示对话文本 */
    async showText(text, name = '') {
        const dialogId = ++this.currentDialogId;

        if (this.isShowingDialog) {
            this.isShowingDialog = false;
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        if (dialogId !== this.currentDialogId) return;

        this.isShowingDialog = true;
        this.game.uiManager.setNameText(name);
        this.game.uiManager.setDialogText('');

        for (let i = 0; i < text.length && dialogId === this.currentDialogId && this.isShowingDialog; i++) {
            this.game.uiManager.setDialogText(text.substring(0, i + 1));
            await new Promise(resolve => setTimeout(resolve, this.game.state.dialog.speed));
        }

        if (dialogId === this.currentDialogId && this.isShowingDialog) {
            this.game.uiManager.setDialogText(text);
        }
        
        this.isShowingDialog = false;
    }

    /** 处理文本框点击 */
    handleTextClick() {
        const currentScene = this.game.sceneManager.getCurrentScene();
        if (!currentScene) return;

        if (this.isShowingDialog) {
            this.isShowingDialog = false;
            const content = this.getCurrentContent(currentScene);
            this.game.uiManager.setDialogText(content.text);
        } else {
            this.showNextContent();
        }
    }

    /** 显示下一条内容 */
    async showNextContent() {
        const currentScene = this.game.sceneManager.getCurrentScene();
        if (!currentScene || currentScene.type !== 'normal') return;

        if (this.hasNextContent(currentScene)) {
            this.game.state.dialog.currentDialogIndex++;
            await this.game.sceneManager.normalScene.updateSceneDisplay(currentScene, this.game.state.dialog.currentDialogIndex);
            const content = this.getCurrentContent(currentScene);
            await this.showText(content.text, content.name);
        } else if (currentScene.nextScene) {
            this.game.uiManager.showNextSceneButton();
        }
    }
} 