/**
 * 游戏场景数据配置
 * 
 * 场景类型：
 * - normal: 正常场景，有对话内容
 * - select: 特殊场景,暂时没有具体功能,留空备用
 */
export const GAME_DATA = {
    scene_1: {
        id: 'scene_1',
        type: 'normal',
        nextScene: 'scene_2',
        contents: [
            {
                bg: 'bg_001.png',
                character_left: 'c_001.png',
                character_center: 'c_002.png',
                character_right: '',
                text: '欢迎来到测试场景...',
                name: '测试角色 1'
            },
            {
                bg: 'bg_002.png',
                character_left: 'c_002.png',
                character_center: '',
                character_right: '',
                text: '这是一段较长的对话，用来测试文本换行和打字机效果。我们需要确保文本显示正常，不会出现排版问题。',
                name: '测试角色 2'
            },
            {
                bg: 'bg_003.png',
                character_left: 'c_004.png',
                character_center: '',
                character_right: 'c_003.png',
                text: '现在我们来测试不同的立绘位置，这句话的立绘在右边。',
                name: '测试角色 3'
            },
            {
                bg: 'bg_001.png',
                character_left: '',
                character_center: 'c_004.png',
                character_right: '',
                text: '接下来测试立绘和背景的切换效果，注意观察过渡是否流畅。',
                name: '测试角色 4'
            },
            {
                bg: 'bg_002.png',
                character_left: 'c_005.png',
                character_center: 'c_005.png',
                character_right: 'c_005.png',
                text: '测试场景到此结束，感谢您的耐心体验。',
                name: '测试角色 5'
            }
        ]
    },
    scene_2: {
        id: 'scene_2',
        type: 'select',
        nextScene: '',
        contents: [

        ]
    }
}; 