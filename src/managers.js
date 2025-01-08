import { Assets, Sprite, Text, Graphics, Container } from 'pixi.js';
import { SCREEN } from './styles.js';
import { ASSET_PATHS, CHARACTER_EFFECTS } from './config.js';
import { DialogScene, SelectScene, StartScene } from './scenes.js';

/** 资源管理器 */
export class AssetManager {
    constructor(game) {
        this.game = game;
        this.cache = {
            backgrounds: new Map(),
            characters: new Map(),
            audios: new Map()
        };
    }

    /** 加载背景图片 */
    async loadBackground(path) {
        if (!this.cache.backgrounds.has(path)) {
            const sprite = Sprite.from(await Assets.load(ASSET_PATHS.background + path));
            sprite.width = SCREEN.width;
            sprite.height = SCREEN.height;
            this.cache.backgrounds.set(path, sprite);
        }
        return this.cache.backgrounds.get(path);
    }

    /** 加载角色图片 */
    async loadCharacter(path) {
        if (!this.cache.characters.has(path)) {
            const sprite = Sprite.from(await Assets.load(ASSET_PATHS.character + path));
            sprite.anchor.set(0.5);
            this.cache.characters.set(path, sprite);
        }
        return this.cache.characters.get(path);
    }

    /** 加载音频 */
    async loadAudio(path, type = 'music') {
        const cacheKey = `${type}:${path}`;
        if (!this.cache.audios.has(cacheKey)) {
            const audio = new Audio(ASSET_PATHS[type] + path);
            this.cache.audios.set(cacheKey, audio);
        }
        return this.cache.audios.get(cacheKey);
    }

    /** 预加载场景资源 */
    async preloadSceneAssets(scene) {
        const assets = new Set();
        const characterAssets = new Set();
        const audioAssets = new Set();

        // 收集所有需要加载的资源
        if (scene.background) {
            assets.add(scene.background);
        }
        if (scene.music) {
            audioAssets.add({ path: scene.music, type: 'music' });
        }

        if (scene.contents) {
            scene.contents.forEach(content => {
                if (content.bg) assets.add(content.bg);
                if (content.character_left) characterAssets.add(content.character_left);
                if (content.character_center) characterAssets.add(content.character_center);
                if (content.character_right) characterAssets.add(content.character_right);
                if (content.music) audioAssets.add({ path: content.music, type: 'music' });
                if (content.voice) audioAssets.add({ path: content.voice, type: 'voice' });
            });
        }

        // 创建加载任务列表
        const loadTasks = [
            ...Array.from(assets).map(bg => () => this.loadBackground(bg)),
            ...Array.from(characterAssets).map(char => () => this.loadCharacter(char)),
            ...Array.from(audioAssets).map(audio => () => this.loadAudio(audio.path, audio.type))
        ];

        // 显示加载提示
        this.game.uiManager.showLoadingTip(0);

        try {
            let loaded = 0;
            const total = loadTasks.length;

            // 串行加载以准确显示进度
            for (const task of loadTasks) {
                await task();
                loaded++;
                this.game.uiManager.showLoadingTip(loaded / total);
            }
        } finally {
            // 隐藏加载提示
            this.game.uiManager.hideLoadingTip();
        }
    }

    /** 清理资源缓存 */
    clearCache() {
        this.cache.backgrounds.clear();
        this.cache.characters.clear();
        this.cache.audios.clear();
    }
}

/** 音频管理器 */
export class AudioManager {
    constructor(game) {
        this.game = game;
        this.currentBGM = null;
        this.currentVoice = null;
        this.audioElements = {
            music: null,
            voice: null,
            sound: null
        };
        this.pendingAudio = {
            music: null,
            voice: null,
            sound: null
        };
        this.hasInteracted = false;
        this.preloadedAudios = new Map();

        // 监听用户交互
        document.addEventListener('click', () => {
            this.hasInteracted = true;
            Object.entries(this.pendingAudio).forEach(([type, audio]) => {
                if (audio) {
                    this.playAudio(audio, type);
                    this.pendingAudio[type] = null;
                }
            });
        }, { once: true });
    }

    /** 预加载音频 */
    async preloadAudio(audioFile, type = 'music') {
        const cacheKey = `${type}:${audioFile}`;
        if (!this.preloadedAudios.has(cacheKey)) {
            const audio = new Audio(ASSET_PATHS[type] + audioFile);
            audio.loop = type === 'music';
            audio.volume = 0;
            await audio.play().catch(() => {});
            this.preloadedAudios.set(cacheKey, audio);
        }
    }

    /** 播放音频 */
    async playAudio(audioFile, type = 'music') {
        const currentKey = type === 'music' ? 'currentBGM' : 'currentVoice';
        if (type === 'music' && this[currentKey] === audioFile) return;

        if (!this.hasInteracted) {
            this.pendingAudio[type] = audioFile;
            return;
        }

        const elementKey = type;
        if (this.audioElements[elementKey]) {
            this.audioElements[elementKey].pause();
            this.audioElements[elementKey] = null;
        }

        try {
            const cacheKey = `${type}:${audioFile}`;
            if (!this.preloadedAudios.has(cacheKey)) {
                await this.preloadAudio(audioFile, type);
            }
            this.audioElements[elementKey] = this.preloadedAudios.get(cacheKey);
            this.audioElements[elementKey].currentTime = 0;
            this.audioElements[elementKey].volume = 1;
            
            if (type === 'music' || type === 'voice') {
                this[currentKey] = audioFile;
            }
        } catch (error) {
            console.warn(`Failed to play ${type}:`, error);
            if (error.name === 'NotAllowedError') {
                this.pendingAudio[type] = audioFile;
            }
        }
    }

    /** 播放音效 */
    async playSound(soundFile) {
        await this.playAudio(soundFile, 'sound');
    }

    /** 停止音效 */
    stopSound() {
        this.stopAudio('sound');
    }

    /** 停止音频 */
    stopAudio(type = 'music') {
        if (this.audioElements[type]) {
            this.audioElements[type].pause();
            this.audioElements[type] = null;
        }
        const currentKey = type === 'music' ? 'currentBGM' : 'currentVoice';
        this[currentKey] = null;
        this.pendingAudio[type] = null;
    }

    /** 播放背景音乐 */
    async playBGM(musicFile) {
        await this.playAudio(musicFile, 'music');
    }

    /** 停止背景音乐 */
    stopBGM() {
        this.stopAudio('music');
    }

    /** 播放语音 */
    async playVoice(voiceFile) {
        await this.playAudio(voiceFile, 'voice');
    }

    /** 停止语音 */
    stopVoice() {
        this.stopAudio('voice');
    }
}

/** 场景管理器 */
export class SceneManager {
    constructor(game) {
        this.game = game;
        this.sceneHandlers = {
            'start': new StartScene(game),
            'dialog': new DialogScene(game),
            'select': new SelectScene(game)
        };
        this.state = {
            currentSceneId: null,
            dialogIndex: 0
        };
    }

    /** 获取当前场景 */
    getCurrentScene() {
        if (!this.state.currentSceneId || !this.game.gameData[this.state.currentSceneId]) {
            return null;
        }
        return this.game.gameData[this.state.currentSceneId];
    }

    /** 获取当前场景类型 */
    getCurrentSceneType() {
        const scene = this.getCurrentScene();
        return scene ? scene.type : null;
    }

    /** 切换到新场景 */
    async switchScene(sceneId) {
        // 检查场景是否存在
        if (!this.game.gameData[sceneId]) {
            console.error('Scene not found:', sceneId);
            return;
        }

        const newScene = this.game.gameData[sceneId];
        const handler = this.sceneHandlers[newScene.type];
        
        // 检查场景处理器是否存在
        if (!handler) {
            console.error('Unknown scene type:', newScene.type);
            return;
        }

        try {
            // 更新状态
            this.state.currentSceneId = sceneId;
            this.state.dialogIndex = 0;
            this.game.state.dialog.currentSceneId = sceneId;
            this.game.state.dialog.currentDialogIndex = 0;

            // 处理场景
            await handler.handle(newScene);
        } catch (error) {
            console.error('Failed to switch scene:', error);
            // 恢复状态
            this.state.currentSceneId = this.game.state.dialog.currentSceneId;
            this.state.dialogIndex = this.game.state.dialog.currentDialogIndex;
        }
    }

    /** 重置场景状态 */
    resetState() {
        this.state.currentSceneId = null;
        this.state.dialogIndex = 0;
        this.game.state.dialog.currentSceneId = null;
        this.game.state.dialog.currentDialogIndex = 0;
    }
}

/** UI管理器 */
export class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = {
            dialog: {
                container: null,
                nameText: null,
                contentText: null
            },
            buttons: {
                nextScene: null
            },
            loading: null
        };
    }

    /** 创建UI元素 */
    createUIElement(type, config) {
        switch (type) {
            case 'dialog':
                return new Graphics()
                    .rect(0, config.y, SCREEN.width, this.game.ui.dialog.height)
                    .fill(this.game.ui.dialog.background);
            case 'text':
                return new Text({
                    text: config.text || '',
                    style: { ...this.game.ui.text.base, ...config.style }
                });
            case 'button': {
                const button = document.createElement('button');
                button.textContent = config.text;
                this.applyButtonStyle(button, config.style);
                return button;
            }
            default:
                throw new Error(`Unknown UI element type: ${type}`);
        }
    }

    /** 应用按钮样式 */
    applyButtonStyle(button, style = {}, state = 'normal') {
        const baseStyle = this.game.ui.button.base;
        const stateStyle = this.game.ui.button[state] || {};
        
        Object.assign(button.style, {
            ...baseStyle,
            ...stateStyle,
            ...style,
            position: button.style.position,
            left: button.style.left,
            top: button.style.top,
            transform: button.style.transform
        });
    }

    /** 设置UI元素位置 */
    setElementPosition(element, position) {
        const { x, y, align = 'default' } = position;

        if (element instanceof Text) {
            element.x = x;
            element.y = y;
            if (align === 'center') {
                element.anchor.set(0.5);
            }
        } else if (element instanceof HTMLElement && align === 'center') {
            Object.assign(element.style, {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            });
        } else if (element instanceof HTMLElement) {
            Object.assign(element.style, {
                position: 'absolute',
                left: x + 'px',
                top: y + 'px'
            });
        }
    }

    /** 添加事件监听器 */
    addEventListeners(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            if (element instanceof HTMLElement) {
                if (event === 'hover') {
                    element.addEventListener('mouseenter', () => {
                        this.applyButtonStyle(element, events.style, 'hover');
                        handler?.('enter');
                    });
                    element.addEventListener('mouseleave', () => {
                        this.applyButtonStyle(element, events.style, 'normal');
                        handler?.('leave');
                    });
                } else {
                    element.addEventListener(event, handler);
                }
            } else {
                element.on(event, handler);
            }
        });
    }

    /** 创建对话框 */
    createDialogBox() {
        this.removeDialogBox();
        
        const dialogY = SCREEN.height - this.game.ui.dialog.height;
        
        // 创建对话框容器
        const dialogBox = this.createUIElement('dialog', { y: dialogY });
        dialogBox.eventMode = 'static';
        dialogBox.cursor = 'pointer';
        this.addEventListeners(dialogBox, {
            click: () => this.game.contentManager.handleTextClick()
        });
        
        // 创建名字文本
        const nameText = this.createUIElement('text', {
            style: this.game.ui.text.name
        });
        nameText.eventMode = 'none'; // 禁用交互，允许点击穿透
        this.setElementPosition(nameText, {
            x: this.game.ui.text.padding,
            y: dialogY + this.game.ui.text.nameOffsetY
        });
        
        // 创建对话文本
        const dialogText = this.createUIElement('text', {});
        dialogText.eventMode = 'none'; // 禁用交互，允许点击穿透
        this.setElementPosition(dialogText, {
            x: this.game.ui.text.padding,
            y: dialogY + this.game.ui.text.dialogOffsetY
        });

        // 保存元素引用
        this.elements.dialog = {
            container: dialogBox,
            nameText: nameText,
            contentText: dialogText
        };

        // 添加到舞台
        this.game.containers.ui.addChild(dialogBox, nameText, dialogText);
    }

    /** 移除对话框 */
    removeDialogBox() {
        this.game.containers.ui.removeChildren();
        this.elements.dialog = {
            container: null,
            nameText: null,
            contentText: null
        };
    }

    /** 显示加载提示 */
    showLoadingTip(progress) {
        if (!this.elements.loading) {
            const tip = this.createUIElement('text', {
                text: 'Loading...',
                style: {
                    fontSize: 24,
                    fill: 0xFFFFFF
                }
            });
            this.setElementPosition(tip, {
                x: 20,
                y: 20
            });
            this.elements.loading = tip;
            this.game.containers.ui.addChild(tip);
        }
        this.elements.loading.text = `Loading... ${Math.floor(progress * 100)}%`;
    }

    /** 隐藏加载提示 */
    hideLoadingTip() {
        if (this.elements.loading) {
            this.game.containers.ui.removeChild(this.elements.loading);
            this.elements.loading = null;
        }
    }

    /** 清空所有 UI 状态 */
    clearAll() {
        this.clearNextSceneButton();
        this.removeDialogBox();
        this.hideLoadingTip();
    }

    /** 设置对话文本 */
    setDialogText(text) {
        if (this.elements.dialog.contentText) {
            this.elements.dialog.contentText.text = text;
        }
    }

    /** 设置说话人名字 */
    setNameText(name) {
        if (this.elements.dialog.nameText) {
            this.elements.dialog.nameText.text = name;
        }
    }

    /** 清空对话文本 */
    clearDialogText() {
        this.setDialogText('');
        this.setNameText('');
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

    /** 清理下一场景按钮 */
    clearNextSceneButton() {
        const button = this.elements.buttons.nextScene;
        if (button && button.parentNode) {
            button.parentNode.removeChild(button);
        }
        this.elements.buttons.nextScene = null;
    }

    /** 显示下一场景按钮 */
    showNextSceneButton() {
        this.clearNextSceneButton();

        const button = this.createUIElement('button', {
            text: '继续',
            style: this.game.ui.button.next
        });

        this.addEventListeners(button, {
            hover: () => {},
            click: () => {
                this.clearNextSceneButton();
                this.game.sceneManager.switchScene(
                    this.game.gameData[this.game.state.dialog.currentSceneId].nextScene
                );
            }
        });

        this.setElementPosition(button, {
            align: 'center'
        });

        this.elements.buttons.nextScene = button;
        this.game.wrapper.appendChild(button);
    }

    /** 显示对话文本（带打字机效果） */
    async showDialogText(text, name = '', skipEffect = false, dialogId = null) {
        this.setNameText(name);
        this.setDialogText('');

        if (skipEffect) {
            this.setDialogText(text);
            return;
        }

        for (let i = 0; i < text.length; i++) {
            // 如果dialogId不匹配，说明对话已被中断
            if (dialogId !== null && dialogId !== this.game.contentManager.currentDialogId) {
                throw new Error('DIALOG_INTERRUPTED');
            }
            this.setDialogText(text.substring(0, i + 1));
            await new Promise(resolve => setTimeout(resolve, this.game.state.dialog.speed));
        }
    }
}

/** 内容管理器 */
export class ContentManager {
    constructor(game) {
        this.game = game;
        this.currentDialogId = 0;
        this.isShowingDialog = false;
        this.isSkipMode = false;
    }

    /** 检查是否有下一条内容 */
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
        this.isShowingDialog = true;

        try {
            await this.game.uiManager.showDialogText(text, name, this.isSkipMode, dialogId);
        } catch (error) {
            if (error.message === 'DIALOG_INTERRUPTED') {
                // 对话被中断，不做任何处理
                return;
            }
            throw error;
        } finally {
            if (dialogId === this.currentDialogId) {
                this.isShowingDialog = false;
            }
        }
    }

    /** 处理内容点击 */
    handleTextClick() {
        const currentScene = this.game.sceneManager.getCurrentScene();
        if (!currentScene) return;

        if (this.isShowingDialog) {
            // 如果正在显示对话，立即显示完整文本
            this.currentDialogId++; // 中断当前对话
            this.isShowingDialog = false;
            const content = this.getCurrentContent(currentScene);
            this.game.uiManager.setDialogText(content.text);
            this.game.uiManager.setNameText(content.name);
        } else {
            // 如果对话已经显示完，显示下一条对话
            this.showNextContent();
        }
    }

    /** 显示下一条内容 */
    async showNextContent() {
        const currentScene = this.game.sceneManager.getCurrentScene();
        if (!currentScene || currentScene.type !== 'dialog') return;

        if (this.hasNextContent(currentScene)) {
            this.game.state.dialog.currentDialogIndex++;
            const content = this.getCurrentContent(currentScene);

            // 更新场景显示
            await this.game.displayManager.updateSceneDisplay(content);

            // 播放音频
            await this.playContentAudio(content);

            // 显示文本
            await this.showText(content.text, content.name);
        } else if (currentScene.nextScene) {
            this.game.uiManager.showNextSceneButton();
        }
    }

    /** 播放内容相关的音频 */
    async playContentAudio(content) {
        if (content.music) {
            await this.game.audioManager.playBGM(content.music);
        }
        if (content.voice) {
            await this.game.audioManager.playVoice(content.voice);
        }
    }
}

/** 显示管理器 */
export class DisplayManager {
    constructor(game) {
        this.game = game;
        this.currentBackground = null;
        this.currentCharacters = {
            left: null,
            center: null,
            right: null
        };
        this.activeCharacters = [];
    }

    /** 设置背景 */
    async setBackground(background) {
        if (background === this.currentBackground) return;

        const sprite = background ? 
            await this.game.assetManager.loadBackground(background) : null;
        
        this.game.containers.background.removeChildren();
        if (sprite) {
            this.game.containers.background.addChild(sprite);
            this.currentBackground = background;
        } else {
            this.currentBackground = null;
        }
    }

    /** 准备场景显示内容 */
    async prepareSceneDisplay(content) {
        const tasks = [];

        // 准备背景
        if (content.bg) {
            tasks.push(this.setBackground(content.bg));
        }

        // 准备角色
        const positions = ['left', 'center', 'right'];
        for (const pos of positions) {
            const charPath = content[`character_${pos}`];
            if (charPath !== undefined) {
                tasks.push(this.showCharacter(pos, charPath));
            }
        }

        // 等待所有显示内容准备完成
        await Promise.all(tasks);

        // 更新活跃角色
        const activeCharacters = content.active_characters || [];
        this.setActiveCharacters(activeCharacters);
    }

    /** 清理显示 */
    clear() {
        this.game.containers.background.removeChildren();
        this.game.containers.character.removeChildren();
        this.currentBackground = null;
        this.currentCharacters = {
            left: null,
            center: null,
            right: null
        };
        this.activeCharacters = [];
    }

    /** 显示角色 */
    async showCharacter(position, charPath) {
        // 如果要清除该位置的角色
        if (!charPath) {
            const otherChars = this.game.containers.character.children
                .filter(c => c.characterPosition !== position);
            
            this.game.containers.character.removeChildren();
            otherChars.forEach(char => this.game.containers.character.addChild(char));
            this.currentCharacters[position] = null;
            return;
        }

        // 如果该位置已经显示了相同的角色，直接返回
        if (charPath === this.currentCharacters[position]) return;

        const character = await this.game.assetManager.loadCharacter(charPath);
        const sprite = new Sprite(character.texture);
        
        this.setCharacterPosition(sprite, position);
        sprite.characterPosition = position;
        this.updateCharacterDisplay(sprite, position);
        this.currentCharacters[position] = charPath;
    }

    /** 设置活跃角色 */
    setActiveCharacters(activeList) {
        if (this.activeCharacters.length === activeList.length &&
            !activeList.some(char => !this.activeCharacters.includes(char)) &&
            !this.activeCharacters.some(char => !activeList.includes(char))) {
            return;
        }

        this.activeCharacters = [...activeList];
        this.updateAllCharactersEffect();
    }

    /** 设置角色位置 */
    setCharacterPosition(character, position = 'center') {
        switch (position) {
            case 'left':
                character.anchor.set(0, 1);
                break;
            case 'right':
                character.anchor.set(1, 1);
                break;
            default:
                character.anchor.set(0.5, 1);
                break;
        }
        const layoutPosition = this.game.layout.character.positions[position];
        character.x = layoutPosition.x;
        character.y = layoutPosition.y;
    }

    /** 更新角色显示 */
    updateCharacterDisplay(character, position) {
        const otherChars = this.game.containers.character.children
            .filter(c => c.characterPosition !== position);

        this.game.containers.character.removeChildren();

        ['left', 'center', 'right'].forEach(pos => {
            if (pos === position) {
                this.game.containers.character.addChild(character);
            } else {
                const existingChar = otherChars.find(c => c.characterPosition === pos);
                if (existingChar) {
                    this.game.containers.character.addChild(existingChar);
                }
            }
        });

        this.updateAllCharactersEffect();
    }

    /** 更新所有角色效果 */
    updateAllCharactersEffect() {
        this.game.containers.character.children.forEach(char => {
            this.setCharacterEffect(char);
        });
    }

    /** 设置角色效果 */
    setCharacterEffect(character) {
        const isActive = this.activeCharacters.includes(`character_${character.characterPosition}`);
        const effects = isActive ? CHARACTER_EFFECTS.active : CHARACTER_EFFECTS.inactive;
        character.tint = effects.tint;
        character.alpha = effects.alpha;
    }

    /** 更新场景显示 */
    async updateSceneDisplay(content) {
        // 更新背景
        if (content.bg) {
            await this.setBackground(content.bg);
        }

        // 更新角色
        const positions = ['left', 'center', 'right'];
        for (const pos of positions) {
            const contentKey = `character_${pos}`;
            if (content[contentKey] !== undefined) {
                await this.showCharacter(pos, content[contentKey]);
            }
        }

        // 更新活跃角色
        const activeCharacters = content.active_characters || [];
        this.setActiveCharacters(activeCharacters);
    }
} 