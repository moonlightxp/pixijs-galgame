/**
 * 游戏初始状态配置
 */
export const INITIAL_STATE = {
    dialog: {
        isShowing: false, // 是否显示对话框
        speed: 50, // 数值越大，打字速度越慢
        currentSceneId: 'scene_1', // 当前场景ID
        currentDialogIndex: 0 // 当前对话索引
    },
    assets: {
        currentBg: null, // 当前背景
        currentCharacterLeft: null,   // 当前左侧角色
        currentCharacterCenter: null, // 当前中间角色
        currentCharacterRight: null,   // 当前右侧角色
        currentActiveCharacters: []  // 追踪当前活跃角色
    }
};

/**
 * 资源路径配置
 */
export const ASSET_PATHS = {
    background: 'assets/images/bg/',
    character: 'assets/images/character/',
    music: 'assets/audio/music/'
};

/**
 * 容器配置
 */
export const CONTAINERS = {
    background: 'background',
    character: 'character',
    ui: 'ui'
};

/**
 * 应用配置
 */
export const APP_CONFIG = {
    backgroundColor: 0x000000,
    resolution: 1
};

/**
 * 角色位置配置
 */
export const CHARACTER_POSITIONS = {
    left: 'left',
    center: 'center',
    right: 'right'
};

/**
 * 角色显示效果配置
 */
export const CHARACTER_EFFECTS = {
    active: {
        tint: 0xFFFFFF,    // 正常显示
        alpha: 1.0         // 完全不透明
    },
    inactive: {
        tint: 0x404040,    // 灰色滤镜
        alpha: 1.0         // 稍微透明
    }
}; 