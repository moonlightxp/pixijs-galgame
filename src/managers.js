import { Assets, Sprite, Text, Graphics, Container } from 'pixi.js';
import { SCREEN } from './styles.js';
import { ASSET_PATHS, CHARACTER_EFFECTS } from './config.js';
import { DialogScene, SelectScene, StartScene } from './scenes.js';
import { GAME_DATA } from './gameData.js';

/** 资源管理器 */
export class AssetManager {
    constructor(game) {
        this.game = game;
        this.cache = {
            backgrounds: new Map(),
            characters: new Map(),
            audios: new Map()
        };
        this.loadingProgress = 0;
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    /** 获取所有需要预加载的资源路径 */
    getAllAssetPaths() {
        const assets = {
            backgrounds: new Set(),
            characters: new Set(),
            music: new Set(),
            voice: new Set()
        };

        // 遍历所有场景数据
        Object.values(GAME_DATA).forEach(scene => {
            // 收集背景和音乐
            if (scene.background) assets.backgrounds.add(scene.background);
            if (scene.music) assets.music.add(scene.music);

            // 对话场景特殊处理
            if (scene.type === 'dialog' && scene.contents) {
                scene.contents.forEach(content => {
                    if (content.bg) assets.backgrounds.add(content.bg);
                    if (content.music) assets.music.add(content.music);
                    if (content.voice) assets.voice.add(content.voice);
                    if (content.character_left) assets.characters.add(content.character_left);
                    if (content.character_center) assets.characters.add(content.character_center);
                    if (content.character_right) assets.characters.add(content.character_right);
                });
            }

            // 选择场景特殊处理
            if (scene.type === 'select' && scene.locations) {
                scene.locations.forEach(location => {
                    if (location.bg) assets.backgrounds.add(location.bg);
                    if (location.music) assets.music.add(location.music);
                    if (location.characters) {
                        location.characters.forEach(char => {
                            if (char.image) assets.characters.add(char.image);
                            if (char.voice) assets.voice.add(char.voice);
                        });
                    }
                });
            }
        });

        return assets;
    }

    /** 更新加载进度 */
    updateProgress() {
        this.loadedAssets++;
        this.loadingProgress = (this.loadedAssets / this.totalAssets) * 100;
        // 通知游戏更新加载进度显示
        if (this.game.uiManager) {
            this.game.uiManager.updateLoadingProgress(this.loadingProgress);
        }
    }

    /** 预加载所有资源 */
    async preloadAllAssets() {
        const assets = this.getAllAssetPaths();
        
        // 计算总资源数
        this.totalAssets = assets.backgrounds.size + 
                          assets.characters.size + 
                          assets.music.size + 
                          assets.voice.size;
        this.loadedAssets = 0;
        this.loadingProgress = 0;

        // 预加载所有资源
        const loadPromises = [];

        // 加载背景
        for (const bg of assets.backgrounds) {
            loadPromises.push(
                this.loadBackground(bg)
                    .then(() => this.updateProgress())
                    .catch(err => console.error('Failed to load background:', bg, err))
            );
        }

        // 加载角色
        for (const char of assets.characters) {
            loadPromises.push(
                this.loadCharacter(char)
                    .then(() => this.updateProgress())
                    .catch(err => console.error('Failed to load character:', char, err))
            );
        }

        // 加载音乐
        for (const music of assets.music) {
            loadPromises.push(
                this.loadAudio(music, 'music')
                    .then(() => this.updateProgress())
                    .catch(err => console.error('Failed to load music:', music, err))
            );
        }

        // 加载语音
        for (const voice of assets.voice) {
            loadPromises.push(
                this.loadAudio(voice, 'voice')
                    .then(() => this.updateProgress())
                    .catch(err => console.error('Failed to load voice:', voice, err))
            );
        }

        // 等待所有资源加载完成
        await Promise.all(loadPromises);
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
            // 强制预加载
            await new Promise((resolve, reject) => {
                audio.preload = 'auto';  // 设置预加载模式
                audio.load();  // 强制加载
                
                // 监听加载完成事件
                audio.addEventListener('canplaythrough', () => resolve(), { once: true });
                audio.addEventListener('error', (e) => reject(e), { once: true });
                
                // 设置超时
                setTimeout(() => reject(new Error('Audio load timeout')), 10000);
            });
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
            
            // 克隆音频元素以避免播放冲突
            const clonedAudio = audio.cloneNode();
            clonedAudio.currentTime = 0;
            clonedAudio.volume = 1;
            clonedAudio.loop = type === 'music';
            
            this.audioElements[elementKey] = clonedAudio;
            
            try {
                await clonedAudio.play();
                if (type === 'music' || type === 'voice') {
                    this[currentKey] = audioFile;
                }
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    this.pendingAudio[type] = audioFile;
                }
                console.warn(`Failed to play ${type}:`, error);
            }
        } catch (error) {
            console.warn(`Failed to load ${type}:`, error);
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
        this.dialogBox = null;
        this.nameText = null;
        this.dialogText = null;
        this.continueButton = null;
        this.loadingScreen = null;
        this.loadingText = null;
        this.loadingBar = null;
    }

    /** 创建加载界面 */
    createLoadingScreen() {
        // 创建加载界面容器
        this.loadingScreen = document.createElement('div');
        Object.assign(this.loadingScreen.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999'
        });

        // 创建加载进度条容器
        const progressContainer = document.createElement('div');
        Object.assign(progressContainer.style, {
            width: '60%',
            height: '20px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            margin: '20px'
        });

        // 创建加载进度条
        this.loadingBar = document.createElement('div');
        Object.assign(this.loadingBar.style, {
            width: '0%',
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s ease'
        });
        progressContainer.appendChild(this.loadingBar);

        // 创建加载文本
        this.loadingText = document.createElement('div');
        Object.assign(this.loadingText.style, {
            color: 'white',
            fontSize: '18px',
            marginTop: '10px',
            fontFamily: 'Arial, sans-serif'
        });
        this.loadingText.textContent = '资源加载中... 0%';

        // 组装加载界面
        this.loadingScreen.appendChild(progressContainer);
        this.loadingScreen.appendChild(this.loadingText);
        this.game.wrapper.appendChild(this.loadingScreen);
    }

    /** 更新加载进度 */
    updateLoadingProgress(progress) {
        if (!this.loadingScreen) return;
        
        const percentage = Math.min(100, Math.max(0, progress));
        this.loadingBar.style.width = `${percentage}%`;
        this.loadingText.textContent = `资源加载中... ${Math.round(percentage)}%`;

        // 如果加载完成，移除加载界面
        if (percentage >= 100) {
            setTimeout(() => {
                if (this.loadingScreen && this.loadingScreen.parentNode) {
                    this.loadingScreen.parentNode.removeChild(this.loadingScreen);
                }
                this.loadingScreen = null;
                this.loadingBar = null;
                this.loadingText = null;
            }, 500);
        }
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
        this.dialogBox = this.createUIElement('dialog', { y: dialogY });
        this.dialogBox.eventMode = 'static';
        this.dialogBox.cursor = 'pointer';
        this.addEventListeners(this.dialogBox, {
            pointerdown: () => this.game.contentManager.handleTextClick()
        });
        
        // 创建名字文本
        this.nameText = this.createUIElement('text', {
            style: this.game.ui.text.name
        });
        this.nameText.eventMode = 'none'; // 禁用交互，允许点击穿透
        this.setElementPosition(this.nameText, {
            x: this.game.ui.text.padding,
            y: dialogY + this.game.ui.text.nameOffsetY
        });
        
        // 创建对话文本
        this.dialogText = this.createUIElement('text', {});
        this.dialogText.eventMode = 'none'; // 禁用交互，允许点击穿透
        this.setElementPosition(this.dialogText, {
            x: this.game.ui.text.padding,
            y: dialogY + this.game.ui.text.dialogOffsetY
        });

        // 添加到舞台
        this.game.containers.ui.addChild(this.dialogBox, this.nameText, this.dialogText);
    }

    /** 移除对话框 */
    removeDialogBox() {
        this.game.containers.ui.removeChildren();
        this.dialogBox = null;
        this.nameText = null;
        this.dialogText = null;
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
    }

    /** 设置对话文本 */
    setDialogText(text) {
        if (this.dialogText) {
            this.dialogText.text = text || '';
        }
    }

    /** 设置说话人名字 */
    setNameText(name) {
        if (this.nameText) {
            this.nameText.text = name || '';
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
        const height = window.innerHeight;
        
        // 计算保持宽高比的缩放比例
        const scale = Math.min(width / SCREEN.width, height / SCREEN.height);
        
        // 计算实际尺寸（保持宽高比）
        const targetWidth = SCREEN.width * scale;
        const targetHeight = SCREEN.height * scale;
        
        // 设置容器尺寸
        this.game.wrapper.style.width = `${targetWidth}px`;
        this.game.wrapper.style.height = `${targetHeight}px`;
        
        // 调整渲染器大小
        this.game.app.renderer.resize(targetWidth, targetHeight);
        
        // 统一缩放所有容器
        Object.values(this.game.containers).forEach(container => {
            container.scale.set(scale);
        });
    }

    /** 清理按钮 */
    clearButton() {
        if (this.continueButton && this.continueButton.parentNode) {
            this.continueButton.parentNode.removeChild(this.continueButton);
        }
        this.continueButton = null;
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
            // 选择场景的继续按钮样式
            Object.assign(button.style, {
                ...baseStyle,
                width: '240px',
                height: '50px',
                padding: '6px 16px',
                fontSize: '24px',
                borderRadius: '6px'
            });
        } else {
            // 其他场景的按钮样式保持不变
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
            this.continueButton = button;
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

        this.continueButton = button;
        this.game.wrapper.appendChild(button);
    }

    /** 创建选择场景按钮 */
    createSelectButton(text, onClick) {
        const button = this.createUIElement('button', { text });
        
        Object.assign(button.style, {
            ...this.game.ui.button.base,
            ...this.game.ui.button.normal,
            width: '240px',
            height: '50px',
            padding: '6px 16px',
            fontSize: '24px',
            borderRadius: '6px',
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

    /** 处理选择场景的按钮容器样式 */
    handleSelectSceneButtons(scene) {
        // 创建按钮容器
        this.buttonContainer = document.createElement('div');
        Object.assign(this.buttonContainer.style, {
            position: 'absolute',
            right: '40px',
            top: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            width: '240px',
            padding: '20px',
            zIndex: '1000'
        });

        const locations = scene.locations || [];

        // 创建场景按钮组
        const locationGroup = document.createElement('div');
        Object.assign(locationGroup.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end'
        });
        
        // 创建角色按钮组
        const characterGroup = document.createElement('div');
        Object.assign(characterGroup.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end'
        });

        // 创建继续按钮容器
        const continueButtonContainer = document.createElement('div');
        Object.assign(continueButtonContainer.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end',
            marginTop: '30px'
        });

        // ... 其他代码保持不变 ...
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