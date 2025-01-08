/**
 * 游戏场景数据配置
 * 
 * 场景类型：
 * - start: 开始场景,也就是登录界面
 * - dialog: 对话场景，有对话内容
 * - select: 选择场景,用于选择角色和场景
 * - function: 功能场景,用于执行特定功能,暂时没有具体功能,留空备用
 */
export const GAME_DATA = {
    start_scene: {
        id: 'start_scene',
        type: 'start',
        nextScene: 'scene_1',
        continueButton: '开始游戏',
        
        background: 'bg_001.png',
        music: 'music_scene03.mp3'
    },

    scene_1: {
        id: 'scene_1',
        type: 'dialog',
        nextScene: 'scene_2',
        continueButton: '前往下一场景',

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
        nextScene: 'scene_1',
        continueButton: '确认',

        locations: [
            {
                name: '咖啡厅',
                bg: 'bg_001.png',
                music: 'music_scene01.mp3',
                text: '咖啡厅外种着樱花树的街道',

                characters: [
                    {
                        name: '小太妹',
                        image: 'c_001.png',
                        position: 'left',
                        voice: 'c_001.wav',
                        text: '其实是个杀手'
                    },
                ]
            },
            {
                name: '花田',
                bg: 'bg_002.png',
                music: 'music_scene02.mp3',
                text: '雪山下的花田,花田中有一颗巨大的橡树',

                characters: [
                    {
                        name: '主妇',
                        image: 'c_002.png',
                        position: 'left',
                        voice: 'c_002.wav',
                        text: '落魄的家庭主妇'
                    },

                    {
                        name: '小太妹',
                        image: 'c_001.png',
                        position: 'left',
                        voice: 'c_001.wav',
                        text: '其实是个杀手'
                    }
                ]
            },
            {
                name: '广场',
                bg: 'bg_003.png',
                music: 'music_scene03.mp3',
                text: '广场中央水池旁的热闹集市',

                characters: [
                    {
                        name: '名媛',
                        image: 'c_003.png',
                        position: 'left',
                        voice: 'c_003.wav',
                        text: '看起来很有钱的名媛'
                    },
                    
                    {
                        name: '主妇',
                        image: 'c_002.png',
                        position: 'left',
                        voice: 'c_002.wav',
                        text: '落魄的家庭主妇'
                    },

                    {
                        name: '小太妹',
                        image: 'c_001.png',
                        position: 'left',
                        voice: 'c_001.wav',
                        text: '其实是个杀手'
                    },
                ]
            }
        ],
    }
}; 