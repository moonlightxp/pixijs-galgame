import { Graphics, Container, Text } from 'pixi.js';
import { DEFAULT_STYLES, SCREEN } from './styles.js';

// 位置自适应类型
export const POS_ADAPT = {
    CENTER:       { pivot: { x: 0.5, y: 0.5 }, pos: { x: 0.5, y: 0.5 } },
    TOP:          { pivot: { x: 0.5, y: 0   }, pos: { x: 0.5, y: 0   } },
    BOTTOM:       { pivot: { x: 0.5, y: 1   }, pos: { x: 0.5, y: 1   } },
    LEFT:         { pivot: { x: 0, y: 0.5   }, pos: { x: 0, y: 0.5   } },
    RIGHT:        { pivot: { x: 1, y: 0.5   }, pos: { x: 1, y: 0.5   } },
    TOP_LEFT:     { pivot: { x: 0, y: 0     }, pos: { x: 0, y: 0     } },
    TOP_RIGHT:    { pivot: { x: 1, y: 0     }, pos: { x: 1, y: 0     } },
    BOTTOM_LEFT:  { pivot: { x: 0, y: 1     }, pos: { x: 0, y: 1     } },
    BOTTOM_RIGHT: { pivot: { x: 1, y: 1     }, pos: { x: 1, y: 1     } }
};

export function applyPosAdapt(obj, parent, offset) {
    if (!obj || !parent) return;

    const posAdapt = obj.finalStyle?.posAdapt;
    if (!posAdapt) return;

    // stage特殊处理
    const parentWidth = parent.uid === 1 ? SCREEN.width : (parent.finalStyle?.width);
    const parentHeight = parent.uid === 1 ? SCREEN.height : (parent.finalStyle?.height);

    // 计算位置
    obj.position.x = parentWidth * posAdapt.pos.x;
    obj.position.y = parentHeight * posAdapt.pos.y;

    // 应用offset
    if (offset) {
        obj.position.x += offset.x;
        obj.position.y += offset.y;
    }
}

// UI创建函数的统一接口
export const uiCreateButton = ({ text, onClick, style = {} } = {}) => {
    const finalStyle = { ...DEFAULT_STYLES.button, ...style };
    
    // 1. 创建container
    const container = new Container();

    // 设置zIndex
    container.zIndex = finalStyle.zIndex;

    // 设置锚点
    container.pivot.set(
        finalStyle.width * finalStyle.posAdapt.pivot.x,
        finalStyle.height * finalStyle.posAdapt.pivot.y
    );
    
    // 创建背景rect并设置专属属性
    const background = new Graphics();
    background
        .roundRect(0, 0, finalStyle.width, finalStyle.height, finalStyle.radius || 0)
        .fill({ color: finalStyle.background, alpha: finalStyle.alpha });
    
    // 创建文本并设置专属属性
    const buttonText = new Text({
        text: text,
        style: {
            fontSize: finalStyle.textSize,
            fill: finalStyle.textColor
        }
    });
    
    // 文本居中
    buttonText.anchor.set(0.5);
    buttonText.position.set(finalStyle.width / 2, finalStyle.height / 2);
    
    // 将背景和文本添加到container
    container.addChild(background, buttonText);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    if (onClick) {
        container.on('click', onClick);
    }
    
    container.finalStyle = finalStyle;
    
    return container;
};

export const uiCreateText = ({ text, style = {} } = {}) => {
    const finalStyle = { ...DEFAULT_STYLES.text, ...style };

    const element = new Text({
        text: text,
        style: {
            fontSize: finalStyle.textSize,
            fill: finalStyle.textColor,
            align: finalStyle.lineAlign,
            wordWrap: true,
            wordWrapWidth: finalStyle.width || SCREEN.width,
            fontFamily: 'Arial',
            lineHeight: finalStyle.textSize,
            padding: 5
        }
    });

    element.zIndex = finalStyle.zIndex;
    
    element.alpha = finalStyle.alpha;
    
    switch(finalStyle.expand) {
        case 'left':
            element.anchor.set(1, finalStyle.posAdapt.pivot.y);
            break;
        case 'right':
            element.anchor.set(0, finalStyle.posAdapt.pivot.y);
            break;
        case 'center':
            element.anchor.set(0.5, finalStyle.posAdapt.pivot.y);
            break;
    }
    
    element.finalStyle = finalStyle;  // 保存最终的样式
    return element;
};

export const uiCreateRect = ({ style = {} } = {}) => {
    const finalStyle = { ...DEFAULT_STYLES.rect, ...style };
    
    const container = new Container();
    container.zIndex = finalStyle.zIndex;

    container.pivot.set(
        finalStyle.width * finalStyle.posAdapt.pivot.x,
        finalStyle.height * finalStyle.posAdapt.pivot.y
    );

    const rect = new Graphics();
    rect
        .roundRect(0, 0, finalStyle.width, finalStyle.height, finalStyle.radius || 0)
        .fill({ color: finalStyle.background, alpha: finalStyle.alpha });
    
    container.addChild(rect);
    container.sortChildren();
    
    container.finalStyle = finalStyle;
    return container;
};

export const uiCreateSprite = ({ sprite, style = {} } = {}) => {
    const finalStyle = { ...DEFAULT_STYLES.sprite, ...style };
    const element = new Container();
    
    element.pivot.set(
        finalStyle.width * finalStyle.posAdapt.pivot.x,
        finalStyle.height * finalStyle.posAdapt.pivot.y
    );
    
    element.finalStyle = finalStyle;  // 保存最终的样式
    return element;
};

export const uiCreateSlider = ({ value = 0, min = 0, max = 100, onChange, style = {} } = {}) => {
    const finalStyle = { ...DEFAULT_STYLES.slider, ...style };
    const element = new Container();
    
    element.pivot.set(
        finalStyle.width * finalStyle.posAdapt.pivot.x,
        finalStyle.height * finalStyle.posAdapt.pivot.y
    );
    
    element.finalStyle = finalStyle;  // 保存最终的样式
    return element;
}; 

// 统一更新UI自适应
export function updateUI(element) {
    if (!element || !element.finalStyle) return;

    const finalStyle = element.finalStyle;

    applyPosAdapt(element, element.parent, finalStyle.offset);
}

// 递归更新所有UI元素
export function updateAllUI(container) {
    if (!container) return;

    updateUI(container);

    if (container.children) {
        container.children.forEach(updateAllUI);
    }
} 