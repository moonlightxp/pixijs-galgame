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

    /** 清理资源缓存 */
    clearCache() {
        this.cache.backgrounds.clear();
        this.cache.characters.clear();
        this.cache.audios.clear();
    }

    /** 完整清理（仅在游戏重启时调用） */
    fullClear() {
        // 销毁背景纹理
        this.cache.backgrounds.forEach(sprite => {
            sprite.texture.destroy(true);
        });
        
        // 销毁角色纹理
        this.cache.characters.forEach(sprite => {
            sprite.texture.destroy(true);
        });
        
        // 销毁音频
        this.cache.audios.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        
        // 清空缓存
        this.clearCache();
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
            const audio = await this.game.assetManager.loadAudio(audioFile, type);
            audio.currentTime = 0;
            audio.volume = 1;
            audio.loop = type === 'music';
            this.audioElements[elementKey] = audio;
            
            try {
                await audio.play();
                if (type === 'music' || type === 'voice') {
                    this[currentKey] = audioFile;
                }
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    this.pendingAudio[type] = audioFile;
                }
                throw error;
            }
        } catch (error) {
            console.warn(`Failed to play ${type}:`, error);
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

    /** 停止所有音频 */
    stopAll() {
        this.stopBGM();
        this.stopVoice();
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
            // 清理 UI
            this.game.uiManager.clearAll();
            
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
            button: null  // 统一使用一个按钮引用
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

    /** 清空所有 UI 状态 */
    clearAll() {
        // 清理按钮
        this.clearButton();
        
        // 清理对话框
        this.removeDialogBox();
        
        // 清理可能存在的其他 DOM 元素
        const customElements = this.game.wrapper.querySelectorAll('div, button');
        customElements.forEach(element => {
            if (element.parentNode === this.game.wrapper) {
                element.parentNode.removeChild(element);
            }
        });
        
        // 重置所有元素引用
        this.elements = {
            dialog: {
                container: null,
                nameText: null,
                contentText: null
            },
            button: null
        };
    }

    /** 设置对话文本 */
    setDialogText(text) {
        if (this.elements.dialog.contentText) {
            this.elements.dialog.contentText.text = text || '';
        }
    }

    /** 设置说话人名字 */
    setNameText(name) {
        if (this.elements.dialog.nameText) {
            this.elements.dialog.nameText.text = name || '';
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
        
        // 调整容器大小
        this.game.wrapper.style.width = `${width}px`;
        this.game.wrapper.style.height = `${height}px`;
        
        // 调整渲染器大小
        this.game.app.renderer.resize(width, height);

        // 调整所有容器的缩放
        const containers = {
            background: this.game.containers.background,
            character: this.game.containers.character,
            ui: this.game.containers.ui
        };

        // 设置每个容器的缩放和位置
        Object.values(containers).forEach(container => {
            if (container) {
                container.scale.set(scale);
                // 保持容器的相对位置
                container.position.set(
                    (width - SCREEN.width * scale) / 2,
                    (height - SCREEN.height * scale) / 2
                );
            }
        });
    }

    /** 清理按钮 */
    clearButton() {
        const button = this.elements.button;
        if (button && button.parentNode) {
            button.parentNode.removeChild(button);
        }
        this.elements.button = null;
    }

    /** 创建继续按钮 */
    createContinueButton() {
        const currentScene = this.game.sceneManager.getCurrentScene();
        if (!currentScene.continueButton) return null;

        const button = this.createUIElement('button', {
            text: currentScene.continueButton
        });

        const baseStyle = {
            ...this.game.ui.button.base,
            ...this.game.ui.button.normal,
            transition: 'all 0.2s ease'
        };

        // 根据场景类型应用样式
        if (currentScene.type === 'select') {
            // 小按钮样式（与选择场景其他按钮对齐）
            Object.assign(button.style, {
                ...baseStyle,
                width: '120px',
                height: '25px',
                padding: '3px 8px',
                fontSize: '12px',
                borderRadius: '3px'
            });
        } else {
            // 大按钮样式（start和dialog场景）
            Object.assign(button.style, {
                ...baseStyle,
                width: '200px',
                height: '60px',
                padding: '12px 24px',
                fontSize: '16px',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            });
        }

        // 添加hover效果
        button.addEventListener('mouseenter', () => {
            if (currentScene.type === 'select') {
                Object.assign(button.style, {
                    ...this.game.ui.button.hover,
                    transform: 'scale(1.05)'
                });
            } else {
                Object.assign(button.style, {
                    ...this.game.ui.button.hover,
                    transform: 'translate(-50%, -50%)'
                });
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (currentScene.type === 'select') {
                Object.assign(button.style, {
                    ...this.game.ui.button.normal,
                    transform: 'scale(1)'
                });
            } else {
                Object.assign(button.style, {
                    ...this.game.ui.button.normal,
                    transform: 'translate(-50%, -50%)'
                });
            }
        });

        button.addEventListener('click', () => {
            if (currentScene.nextScene) {
                this.game.sceneManager.switchScene(currentScene.nextScene);
            }
        });

        return button;
    }

    /** 添加继续按钮到场景 */
    addContinueButton() {
        const button = this.createContinueButton();
        if (!button) return;

        const currentScene = this.game.sceneManager.getCurrentScene();
        if (currentScene.type === 'select') {
            // SelectScene 会自己处理按钮的添加
            return button;
        } else {
            // 其他场景直接添加到 wrapper
            this.game.wrapper.appendChild(button);
            this.elements.button = button;
        }
    }

    /** 显示下一场景按钮 */
    showNextSceneButton() {
        this.clearButton();

        const currentScene = this.game.sceneManager.getCurrentScene();
        const button = this.createUIElement('button', {
            text: currentScene.continueButton || '继续'
        });

        // 使用大按钮样式
        Object.assign(button.style, {
            ...this.game.ui.button.base,
            ...this.game.ui.button.normal,
            width: '200px',
            height: '60px',
            padding: '12px 24px',
            fontSize: '16px',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.2s ease'
        });

        // 添加hover效果
        button.addEventListener('mouseenter', () => {
            Object.assign(button.style, {
                ...this.game.ui.button.hover,
                transform: 'translate(-50%, -50%)'
            });
        });
        
        button.addEventListener('mouseleave', () => {
            Object.assign(button.style, {
                ...this.game.ui.button.normal,
                transform: 'translate(-50%, -50%)'
            });
        });

        button.addEventListener('click', () => {
            this.clearButton();
            this.game.sceneManager.switchScene(
                this.game.gameData[this.game.state.dialog.currentSceneId].nextScene
            );
        });

        this.elements.button = button;
        this.game.wrapper.appendChild(button);
    }

    /** 创建选择场景按钮 */
    createSelectButton(text, onClick) {
        const button = this.createUIElement('button', { text });
        
        Object.assign(button.style, {
            ...this.game.ui.button.base,
            ...this.game.ui.button.normal,
            width: '120px',
            height: '25px',
            padding: '3px 8px',
            fontSize: '12px',
            borderRadius: '3px',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        });
        
        button.addEventListener('mouseenter', () => {
            const isActive = button.style.backgroundColor === 'rgba(255, 255, 255, 0.8)';
            if (!isActive) {
                Object.assign(button.style, {
                    backgroundColor: 'rgba(128, 128, 128, 0.6)',
                    transform: 'scale(1.05)'
                });
            } else {
                Object.assign(button.style, {
                    transform: 'scale(1.05)'
                });
            }
        });
        
        button.addEventListener('mouseleave', () => {
            const isActive = button.style.backgroundColor === 'rgba(255, 255, 255, 0.8)';
            if (!isActive) {
                Object.assign(button.style, {
                    ...this.game.ui.button.normal,
                    backgroundColor: 'rgba(128, 128, 128, 0.4)',
                    color: '#ffffff',
                    transform: 'scale(1)'
                });
            } else {
                Object.assign(button.style, {
                    transform: 'scale(1)'
                });
            }
        });
        
        button.addEventListener('click', onClick);
        return button;
    }

    /** 设置选择场景按钮激活状态 */
    setSelectButtonActive(button) {
        Object.assign(button.style, {
            ...this.game.ui.button.normal,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: '#000000'
        });
    }

    /** 设置选择场景按钮非激活状态 */
    setSelectButtonInactive(button) {
        Object.assign(button.style, {
            ...this.game.ui.button.normal,
            backgroundColor: 'rgba(128, 128, 128, 0.4)',
            color: '#ffffff'
        });
    }

    /** 更新选择场景按钮组状态 */
    updateSelectButtonStates(group, activeIndex) {
        Array.from(group.children).forEach((button, index) => {
            if (index === activeIndex) {
                this.setSelectButtonActive(button);
            } else {
                this.setSelectButtonInactive(button);
            }
        });
    }
}

/** 内容管理器 */
export class ContentManager {
    constructor(game) {
        this.game = game;
    }

    /** 检查是否有下一条内容 */
    hasNextContent(scene) {
        return this.game.state.dialog.currentDialogIndex < scene.contents.length - 1;
    }

    /** 获取当前内容 */
    getCurrentContent(scene) {
        return scene.contents[this.game.state.dialog.currentDialogIndex];
    }

    /** 处理内容点击 */
    handleTextClick() {
        const currentScene = this.game.sceneManager.getCurrentScene();
        if (!currentScene) return;

        // 直接显示下一条对话
        this.showNextContent();
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

            // 直接显示文本
            this.game.uiManager.setNameText(content.name);
            this.game.uiManager.setDialogText(content.text);
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