import { Assets, Sprite } from 'pixi.js';
import { SCREEN } from './styles.js';
import { ASSET_PATHS } from './config.js';

/** 普通场景类 */
export class NormalScene {
    constructor(game) {
        this.game = game;
    }

    /** 处理普通场景 */
    async handle(scene) {
        await this.preloadSceneAssets(scene);
        await this.updateSceneDisplay(scene, 0);
        const content = scene.contents[0];
        await this.game.dialogManager.showText(content.text, content.name);
    }

    /** 预加载场景所有资源 */
    async preloadSceneAssets(scene) {
        // 收集所有需要加载的资源
        const assets = new Set();
        const characterAssets = new Set();

        scene.contents.forEach(content => {
            if (content.bg) assets.add(content.bg);
            if (content.character) characterAssets.add(content.character);
        });

        // 加载所有背景
        const bgPromises = Array.from(assets).map(async bg => {
            if (!this.game.assetCache.backgrounds.has(bg)) {
                const sprite = Sprite.from(await Assets.load(ASSET_PATHS.background + bg));
                sprite.width = SCREEN.width;
                sprite.height = SCREEN.height;
                this.game.assetCache.backgrounds.set(bg, sprite);
            }
        });

        // 加载所有角色
        const characterPromises = Array.from(characterAssets).map(async char => {
            if (!this.game.assetCache.characters.has(char)) {
                const sprite = Sprite.from(await Assets.load(ASSET_PATHS.character + char));
                sprite.anchor.set(0.5);
                this.game.assetCache.characters.set(char, sprite);
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

        // 更新背景
        if (content.bg && content.bg !== this.game.state.assets.currentBg) {
            const bg = this.game.assetCache.backgrounds.get(content.bg);
            this.game.containers.background.removeChildren();
            this.game.containers.background.addChild(bg);
            this.game.state.assets.currentBg = content.bg;
        }

        // 更新角色
        if (!content.character) {
            this.game.containers.character.removeChildren();
            this.game.state.assets.currentCharacter = null;
        } else {
            const character = this.game.assetCache.characters.get(content.character);
            const isNewCharacter = content.character !== this.game.state.assets.currentCharacter;

            if (isNewCharacter) {
                this.setCharacterPosition(character, content.position);
                this.game.containers.character.removeChildren();
                this.game.containers.character.addChild(character);
                this.game.state.assets.currentCharacter = content.character;
            }
        }
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