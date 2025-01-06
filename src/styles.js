import * as UI_CREATER from './ui.js';

/**
 * 布局配置
 */
export const SCREEN = {
    width: 1920,
    height: 1080,
    aspectRatio: 1920 / 1080
};

export const LAYOUT = {
    character: {
        positions: {
            left: { x: 0, y: SCREEN.height },
            center: { x: SCREEN.width / 2, y: SCREEN.height },
            right: { x: SCREEN.width, y: SCREEN.height }
        }
    }
};

/**
 * UI组件配置
 */
export const UI = {
    dialog: {
        height: 200,
        background: {
            color: 0x000000,
            alpha: 0.7
        }
    },
    text: {
        padding: 50,
        base: {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: 0xffffff,
            wordWrap: true,
            wordWrapWidth: 1820 // SCREEN.width - (padding * 2)
        },
        name: {
            fontSize: 32
        },
        nameOffsetY: 20,
        dialogOffsetY: 70
    },
    button: {
        base: {
            position: 'absolute',
            right: '20px',
            top: '20px',
            padding: '12px 24px',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            userSelect: 'none',
            zIndex: '1000'
        },
        hover: {
            backgroundColor: 'rgba(40, 40, 40, 0.8)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        },
        normal: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        },
        next: {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
        }
    }
};

/**
 * 全局页面样式
 */
export const PAGE = {
    backgroundColor: '#000000',
    margin: '0',
    padding: '0',
    overflow: 'hidden'
};

/**
 * UI组件默认样式
 */
export const DEFAULT_STYLES = {
    button: {
        width: 120,
        height: 40,

        background: 0x000000,
        alpha: 0.7,

        textSize: 16,
        textColor: 0xFFFFFF,

        zIndex: 1000,

        posAdapt: UI_CREATER.POS_ADAPT.TOP_LEFT,
        offset: { x: 0, y: 0 }
    },
    
    text: {
        width: 100, 

        textSize: 16,
        textColor: 0xFFFFFF,
        alpha: 1,

        lineAlign: 'left',
        expand: 'right',

        zIndex: 1000,

        posAdapt: UI_CREATER.POS_ADAPT.TOP_LEFT,
        offset: { x: 0, y: 0 }
    },
    
    rect: {
        width: 100,
        height: 100,

        background: 0x000000,
        alpha: 0.7,
        radius: 0,

        zIndex: 1000,

        posAdapt: UI_CREATER.POS_ADAPT.TOP_LEFT,
        offset: { x: 0, y: 0 }
    },
    
    sprite: {
        width: 100,
        height: 100,

        alpha: 1,
        color: 0xFFFFFF,

        zIndex: 1000,

        posAdapt: UI_CREATER.POS_ADAPT.TOP_LEFT,
        offset: { x: 0, y: 0 }
    },
    
    slider: {
        width: 200,
        height: 20,

        background: 0x000000,
        alpha: 0.7,
        barColor: 0x666666,
        knobColor: 0xFFFFFF,

        zIndex: 1000,

        posAdapt: UI_CREATER.POS_ADAPT.TOP_LEFT,
        offset: { x: 0, y: 0 }
    }
}; 