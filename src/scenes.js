import * as PIXI from 'pixi.js';
import { Assets, Sprite } from 'pixi.js';
import { SCREEN } from './styles.js';
import { ASSET_PATHS, CHARACTER_EFFECTS } from './config.js';

/** 基础场景类 */
export class BaseScene {
    constructor(game) {
        this.game = game;
    }

    /** 是否播放场景音乐 */
    shouldPlaySceneMusic() {
        return true;
    }

    /** 处理场景 */
    async handle(scene) {
        // 1. 清理旧场景
        this.clear();  // 调用场景自己的清理方法
        this.game.uiManager.clearAll();  // 清理所有UI元素
        this.game.displayManager.clear();  // 清理显示内容
        this.game.audioManager.stopAll();  // 停止所有音频

        // 2. 准备并显示新场景
        if (scene.background) {
            await this.game.displayManager.setBackground(scene.background);
        }
        if (scene.music && this.shouldPlaySceneMusic()) {
            await this.game.audioManager.playBGM(scene.music);
        }
        await this.prepareSceneContent(scene);
        await this.handleScene(scene);
    }

    /** 清理场景（由子类实现具体清理逻辑） */
    clear() {
        // 默认实现为空
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
    /** 处理具体场景逻辑 */
    async handleScene(scene) {
        // 创建并添加开始按钮
        this.game.uiManager.addContinueButton();
    }
}

/** 对话场景类 */
export class DialogScene extends BaseScene {
    /** 是否播放场景音乐 */
    shouldPlaySceneMusic() {
        return false;
    }

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

        // 播放音频
        await this.game.contentManager.playContentAudio(content);

        // 直接显示文本
        this.game.uiManager.setNameText(content.name);
        this.game.uiManager.setDialogText(content.text);

        // 如果是最后一条对话，显示继续按钮
        if (this.game.state.dialog.currentDialogIndex === scene.contents.length - 1) {
            this.game.uiManager.addContinueButton();
        }
    }
}

/** 选择场景类 */
export class SelectScene extends BaseScene {
    constructor(game) {
        super(game);
        this.selectedLocation = 0;
        this.selectedCharacter = 0;
        this.buttonContainer = null;
    }

    /** 处理具体场景逻辑 */
    async handleScene(scene) {
        // 1. 清理并准备场景
        await this.game.displayManager.clear();
        this.game.uiManager.createDialogBox();
        
        // 2. 创建按钮容器
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

        // 3. 创建场景按钮组
        const locationGroup = document.createElement('div');
        Object.assign(locationGroup.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end'
        });
        
        // 创建场景按钮
        locations.forEach((location, locationIndex) => {
            const button = this.game.uiManager.createSelectButton(location.name, async () => {
                this.selectedLocation = locationIndex;
                this.selectedCharacter = 0;
                this.game.uiManager.updateSelectButtonStates(locationGroup, locationIndex);
                
                await this.showLocation(location);
                await this.updateCharacterButtons(location.characters, characterGroup);
            });

            if (locationIndex === this.selectedLocation) {
                this.game.uiManager.setSelectButtonActive(button);
            } else {
                this.game.uiManager.setSelectButtonInactive(button);
            }
            locationGroup.appendChild(button);
        });
        
        // 4. 创建角色按钮组
        const characterGroup = document.createElement('div');
        Object.assign(characterGroup.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end'
        });

        // 5. 创建继续按钮容器
        const continueButtonContainer = document.createElement('div');
        Object.assign(continueButtonContainer.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end',
            marginTop: '30px'
        });
        
        // 6. 组装所有按钮组
        if (locations.length > 0) {
            this.buttonContainer.appendChild(locationGroup);
            this.buttonContainer.appendChild(characterGroup);
        }
        this.buttonContainer.appendChild(continueButtonContainer);
        this.game.wrapper.appendChild(this.buttonContainer);
        
        // 7. 显示初始内容
        if (locations.length > 0) {
            const initialLocation = locations[0];
            await this.showLocation(initialLocation);
            await this.updateCharacterButtons(initialLocation.characters, characterGroup);
        }

        // 8. 创建继续按钮
        const continueButton = this.game.uiManager.createContinueButton();
        if (continueButton) {
            continueButtonContainer.appendChild(continueButton);
        }
    }
    
    /** 更新角色按钮组 */
    async updateCharacterButtons(characters = [], characterGroup) {
        characterGroup.innerHTML = '';
        
        if (!characters.length) return;

        characters.forEach((character, charIndex) => {
            const charButton = this.game.uiManager.createSelectButton(character.name || '', async () => {
                this.selectedCharacter = charIndex;
                this.game.uiManager.updateSelectButtonStates(characterGroup, charIndex);
                await this.showCharacter(character);
                this.updateCharacterInfo(character);
            });
            
            if (charIndex === this.selectedCharacter) {
                this.game.uiManager.setSelectButtonActive(charButton);
            } else {
                this.game.uiManager.setSelectButtonInactive(charButton);
            }
            characterGroup.appendChild(charButton);
        });

        // 显示第一个角色
        const firstCharacter = characters[0];
        await this.showCharacter(firstCharacter);
        this.updateCharacterInfo(firstCharacter);
    }

    /** 更新角色信息 */
    async updateCharacterInfo(character) {
        if (!character) return;
        
        this.game.uiManager.setNameText(character.name || '');
        this.game.uiManager.setDialogText(character.text || '');
        if (character.voice) {
            await this.game.audioManager.playVoice(character.voice);
        }
    }
    
    /** 显示场景 */
    async showLocation(location) {
        if (!location) return;
        
        if (location.bg) {
            await this.game.displayManager.setBackground(location.bg);
        }
        if (location.music) {
            await this.game.audioManager.playBGM(location.music);
        }
        
        this.game.uiManager.setDialogText(location.text || '');
        await this.clearCharacters();
    }
    
    /** 清理所有角色 */
    async clearCharacters() {
        await this.game.displayManager.showCharacter('left', null);
        await this.game.displayManager.showCharacter('center', null);
        await this.game.displayManager.showCharacter('right', null);
    }
    
    /** 显示角色 */
    async showCharacter(character) {
        if (!character) return;
        
        await this.clearCharacters();
        
        const position = character.position || 'center';
        if (character.image) {
            await this.game.displayManager.showCharacter(position, character.image);
            this.game.displayManager.setActiveCharacters([`character_${position}`]);
        }
    }

    /** 清理场景 */
    clear() {
        if (this.buttonContainer && this.buttonContainer.parentNode) {
            this.buttonContainer.parentNode.removeChild(this.buttonContainer);
        }
        this.buttonContainer = null;
    }
}

/** 功能场景类 */
export class FunctionScene extends BaseScene {
    /** 处理具体场景逻辑 */
    async handleScene(scene) {
        // 1. 清理并准备场景
        await this.game.displayManager.clear();

        // 打印一条信息占位
        this.game.uiManager.setDialogText('功能场景');
    }
}