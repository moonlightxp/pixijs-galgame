/**
 * 游戏场景数据配置
 * 
 * 场景类型：
 * - start: 开始场景，暂时没有具体功能,留空备用
 * - dialog: 对话场景，有对话内容
 * - select: 选择场景,暂时没有具体功能,留空备用
 */
export const GAME_DATA = {
    scene_1: {
        id: 'scene_1',
        type: 'dialog',
        nextScene: 'scene_2',
        contents: [                                            
            {
                bg: 'bg_001.png',

                character_left: 'c_001.png',
                character_center: 'c_002.png',
                character_right: 'c_003.png',

                active_characters: ['character_left'],

                name: '左:',
                text: '欢迎来到测试场景...',

                music: 'music_scene01.mp3'
            },

            {
                bg: 'bg_002.png',

                character_left: 'c_001.png',
                character_center: 'c_002.png',
                character_right: 'c_003.png',

                active_characters: ['character_center'],

                name: '中:',
                text: '这是一段较长的对话，用来测试文本换行和打字机效果。我们需要确保文本显示正常，不会出现排版问题。',

                music: 'music_scene01.mp3'
            },

            {
                bg: 'bg_003.png',

                character_left: 'c_001.png',
                character_center: 'c_002.png',
                character_right: 'c_003.png',

                active_characters: ['character_right'],

                name: '右:',
                text: '对话结束,测试通过。',

                music: 'music_scene01.mp3'
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