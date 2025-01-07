import * as PIXI from 'pixi.js';
import { Assets, Sprite } from 'pixi.js';
import { SCREEN } from './styles.js';
import { ASSET_PATHS, CHARACTER_EFFECTS } from './config.js';

/** 开始场景类 */
export class StartScene {
    constructor(game) {
        this.game = game;
    }

    /** 处理开始场景 */
    async handle(scene) {
        // 清理现有UI和容器
        this.game.uiManager.clearAll();
        this.game.containers.character.removeChildren();
        this.game.containers.background.removeChildren();

        // 加载并显示背景
        if (scene.background) {
            const cacheKey = scene.background;
            if (!this.game.assetCache.backgrounds.has(cacheKey)) {
                const sprite = Sprite.from(await Assets.load(ASSET_PATHS.background + scene.background));
                sprite.width = SCREEN.width;
                sprite.height = SCREEN.height;
                this.game.assetCache.backgrounds.set(cacheKey, sprite);
            }
            const bg = this.game.assetCache.backgrounds.get(cacheKey);
            this.game.containers.background.addChild(bg);
        }

        // 播放音乐
        if (scene.music) {
            this.game.musicManager.playMusic(scene.music);
        }

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
export class DialogScene {
    constructor(game) {
        this.game = game;
    }

    /** 处理对话场景 */
    async handle(scene) {
        // 创建对话框
        this.game.uiManager.createDialogBox();
        
        await this.preloadSceneAssets(scene);
        
        const content = scene.contents[this.game.state.dialog.currentDialogIndex];
        if (!content) return;

        // 播放音乐
        if (content.music) {
            this.game.musicManager.playMusic(content.music);
        }

        await this.updateSceneDisplay(scene, this.game.state.dialog.currentDialogIndex);
        await this.game.contentManager.showText(content.text, content.name);
    }

    /** 预加载场景所有资源 */
    async preloadSceneAssets(scene) {
        // 收集所有需要加载的资源
        const assets = new Set();
        const characterAssets = new Set();
        const voiceAssets = new Set();

        scene.contents.forEach(content => {
            if (content.bg) assets.add(content.bg);
            if (content.character_left) characterAssets.add(content.character_left);
            if (content.character_center) characterAssets.add(content.character_center);
            if (content.character_right) characterAssets.add(content.character_right);
            if (content.voice) voiceAssets.add(content.voice);
        });

        // 加载所有背景
        const bgPromises = Array.from(assets).map(async bg => {
            const cacheKey = bg;
            if (!this.game.assetCache.backgrounds.has(cacheKey)) {
                const sprite = Sprite.from(await Assets.load(ASSET_PATHS.background + bg));
                sprite.width = SCREEN.width;
                sprite.height = SCREEN.height;
                this.game.assetCache.backgrounds.set(cacheKey, sprite);
            }
        });

        // 加载所有角色
        const characterPromises = Array.from(characterAssets).map(async char => {
            const cacheKey = char;
            if (char && !this.game.assetCache.characters.has(cacheKey)) {
                const sprite = Sprite.from(await Assets.load(ASSET_PATHS.character + char));
                sprite.anchor.set(0.5);
                this.game.assetCache.characters.set(cacheKey, sprite);
            }
        });

        // 等待所有资源加载完成
        await Promise.all([...bgPromises, ...characterPromises]);
    }

    /** 更新场景显示 */
    async updateSceneDisplay(scene, dialogIndex) {
        const content = scene.contents[dialogIndex];
        if (!content) {
            console.error('Content not found:', dialogIndex);
            return;
        }

        const activeCharacters = content.active_characters || [];
        const hasActiveCharactersChanged = 
            !this.game.state.assets.currentActiveCharacters ||
            activeCharacters.length !== this.game.state.assets.currentActiveCharacters.length ||
            activeCharacters.some(char => !this.game.state.assets.currentActiveCharacters.includes(char)) ||
            this.game.state.assets.currentActiveCharacters.some(char => !activeCharacters.includes(char));

        // 更新背景
        if (content.bg && content.bg !== this.game.state.assets.currentBg) {
            const bg = this.game.assetCache.backgrounds.get(content.bg);
            this.game.containers.background.removeChildren();
            this.game.containers.background.addChild(bg);
            this.game.state.assets.currentBg = content.bg;
        }

        // 更新角色
        const positions = ['left', 'center', 'right'];
        positions.forEach(pos => {
            const contentKey = `character_${pos}`;
            const stateKey = `currentCharacter${pos.charAt(0).toUpperCase() + pos.slice(1)}`;
            
            if (content[contentKey] !== this.game.state.assets[stateKey] || hasActiveCharactersChanged) {
                if (content[contentKey]) {
                    let character;
                    const cacheKey = content[contentKey];
                    if (this.game.assetCache.characters.has(cacheKey)) {
                        character = this.game.assetCache.characters.get(cacheKey);
                    } else {
                        const baseCharacter = this.game.assetCache.characters.get(content[contentKey]);
                        character = new Sprite(baseCharacter.texture);
                        this.game.assetCache.characters.set(cacheKey, character);
                    }
                    this.setCharacterPosition(character, pos);
                    character.characterPosition = pos;
                    this.setCharacterEffect(character, activeCharacters);

                    // 保存其他位置的角色
                    const otherChars = this.game.containers.character.children
                        .filter(c => c.characterPosition !== pos);
                    
                    if (hasActiveCharactersChanged) {
                        otherChars.forEach(char => this.setCharacterEffect(char, activeCharacters));
                    }

                    this.game.containers.character.removeChildren();
                    
                    // 按位置顺序重新添加角色
                    positions.forEach(addPos => {
                        if (addPos === pos) {
                            this.game.containers.character.addChild(character);
                        } else {
                            const existingChar = otherChars.find(c => c.characterPosition === addPos);
                            if (existingChar) {
                                this.game.containers.character.addChild(existingChar);
                            }
                        }
                    });
                } else {
                    const others = this.game.containers.character.children
                        .filter(c => c.characterPosition !== pos);
                    
                    if (hasActiveCharactersChanged) {
                        others.forEach(char => this.setCharacterEffect(char, activeCharacters));
                    }

                    this.game.containers.character.removeChildren();
                    others.forEach(char => this.game.containers.character.addChild(char));
                }
                this.game.state.assets[stateKey] = content[contentKey];
            }
        });

        if (hasActiveCharactersChanged) {
            this.game.state.assets.currentActiveCharacters = [...activeCharacters];
        }
    }

    /** 设置角色效果 */
    setCharacterEffect(character, activeCharacters) {
        const isActive = activeCharacters.includes(`character_${character.characterPosition}`);
        const effects = isActive ? CHARACTER_EFFECTS.active : CHARACTER_EFFECTS.inactive;
        character.tint = effects.tint;
        character.alpha = effects.alpha;
    }

    /** 设置角色位置 */
    setCharacterPosition(character, position = 'center') {
        const pos = position || 'center';
        switch (pos) {
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
        const layoutPosition = this.game.layout.character.positions[pos];
        character.x = layoutPosition.x;
        character.y = layoutPosition.y;
    }
}

/** 选择场景类 */
export class SelectScene {
    constructor(game) {
        this.game = game;
    }

    /** 处理选择场景 */
    async handle(scene) {
        // TODO: 实现选择场景的逻辑
        console.log('Select scene handling is not implemented yet');
    }
} 