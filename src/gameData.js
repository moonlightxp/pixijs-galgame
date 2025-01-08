/**
 * 游戏场景数据配置
 * 
 * 场景类型：
 * - start: 开始场景,也就是登录界面
 * - dialog: 对话场景，有对话内容
 * - select: 选择场景,暂时没有具体功能,留空备用
 */
export const GAME_DATA = {
    start_scene: {
        id: 'start_scene',
        type: 'start',
        nextScene: 'scene_1',
        
        background: 'bg_001.png',
        music: 'music_scene01.mp3'
    },

    scene_1: {
        id: 'scene_1',
        type: 'dialog',
        nextScene: 'scene_2',
        contents: [                                            
            {
                bg: 'bg_003.png',

                character_left: 'c_001.png',
                character_center: 'c_002.png',
                character_right: 'c_003.png',

                active_characters: ['character_left'],

                name: '左:',
                text: '欢迎来到测试场景...',

                music: 'music_scene01.mp3',
                voice: 'c_001.wav'
            },

            {
                bg: 'bg_002.png',

                character_left: 'c_001.png',
                character_center: 'c_002.png',
                character_right: 'c_003.png',

                active_characters: ['character_left', 'character_center'],

                name: '左 - 中:',
                text: '这是一段较长的对话，用来测试文本换行和打字机效果。我们需要确保文本显示正常，不会出现排版问题。',

                music: 'music_scene02.mp3',
                voice: 'c_002.wav'
            },

            {
                bg: 'bg_001.png',

                character_left: 'c_001.png',
                character_center: 'c_002.png',
                character_right: 'c_003.png',

                active_characters: ['character_left', 'character_center', 'character_right'],

                name: '左 - 中 - 右:',
                text: '对话结束,测试通过。',

                music: 'music_scene03.mp3',
                voice: 'c_003.wav'
            }
        ]
    },

    scene_2: {
        id: 'scene_2',
        type: 'select',
        nextScene: '',

        locations: [
            {
                bg: 'bg_001.png',
                music: 'music_scene01.mp3',
                text: '选择场景1'
            },
            {
                bg: 'bg_002.png',
                music: 'music_scene02.mp3',
                text: '选择场景2'
            },
            {
                bg: 'bg_003.png',
                music: 'music_scene03.mp3',
                text: '选择场景3'
            }
        ],

        characters: [
            {
                name: '角色1',
                image: 'c_001.png',
                voice: 'c_001.wav',
                text: '角色1'
            },
            {
                name: '角色2',
                image: 'c_002.png',
                voice: 'c_002.wav',
                text: '角色2'
            },
            {
                name: '角色3',
                image: 'c_003.png',
                voice: 'c_003.wav',
                text: '角色3'
            }
        ]
    }
}; 