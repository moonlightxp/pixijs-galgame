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
        currentCharacterRight: null   // 当前右侧角色
    }
};

/**
 * 资源路径配置
 */
export const ASSET_PATHS = {
    background: 'assets/images/bg/',
    character: 'assets/images/character/'
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