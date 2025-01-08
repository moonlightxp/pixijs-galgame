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
        
        background: 'bg_01.png',
        music: 'music_scene01.mp3'
    },

    scene_1: {
        id: 'scene_1',
        type: 'dialog',
        nextScene: 'scene_2',
        continueButton: '前往下一场景',

        contents: [                                            
            {
                bg: 'bg_01.png',

                character_left: 'c_001.png',
                character_center: '',
                character_right: 'c_002.png',

                active_characters: ['character_left'],

                name: 'Michael DeSanta',
                text: 'Alright, We’ve got to move fast. Let’s go, Let’s go! Keep your heads down!',

                music: 'music_scene04.mp3',
                voice: 'c_001.wav'
            },

            {
                bg: 'bg_01.png',

                character_left: 'c_001.png',
                character_center: '',
                character_right: 'c_002.png',

                active_characters: ['character_right'],

                name: 'Trevor Philips',
                text: "Hurry up, or I'll start shooting! This is taking too long!",

                music: 'music_scene04.mp3',
                voice: 'c_002.wav'
            },

            {
                bg: 'bg_01.png',

                character_left: 'c_003.png',
                character_center: '',
                character_right: 'c_002.png',

                active_characters: ['character_left'],

                name: 'Brad Snider',
                text: '(Looks very nervous)Calm down, man, don’t rush me. I’ll get it done.',

                music: 'music_scene04.mp3',
                voice: 'c_003.wav'
            },

            {
                bg: 'bg_01.png',

                character_left: 'c_001.png',
                character_center: '',
                character_right: 'c_002.png',


                active_characters: ['character_left'],

                name: 'Michael DeSanta',
                text: 'We need the money, Brad. Don’t screw this up!',

                music: 'music_scene04.mp3',
                voice: 'c_004.wav'
            },

            {
                bg: 'bg_01.png',

                character_left: 'c_001.png',
                character_center: 'c_003.png',
                character_right: 'c_002.png',


                active_characters: ['character_right'],

                name: 'Trevor Philips',
                text: 'You wanna get out of here alive, Do your job! Do it right!',

                music: 'music_scene04.mp3',
                voice: 'c_005.wav'
            },

            {
                bg: 'bg_01.png',

                character_left: 'c_001.png',
                character_center: 'c_003.png',
                character_right: 'c_002.png',


                active_characters: ['character_center'],

                name: 'Brad Snider',
                text: 'It’s just taking a little longer than expected, Allright?',

                music: 'music_scene04.mp3',
                voice: 'c_006.wav'
            },

            {
                bg: 'bg_02.png',

                character_left: 'c_001.png',
                character_center: '',
                character_right: '',

                active_characters: ['character_left'],

                name: 'Michael DeSanta',
                text: 'Shit, The cops are here! We need to move. Now!',

                music: 'music_scene04.mp3',
                voice: 'c_007.wav'
            },

            {
                bg: 'bg_02.png',

                character_left: 'c_002.png',
                character_center: '',
                character_right: 'c_003.png',

                active_characters: ['character_left'],

                name: 'Trevor Philips',
                text: 'Hell yeah! Let’s take these assholes down! We’re not done yet!',

                music: 'music_scene04.mp3',
                voice: 'c_008.wav'
            },

            {
                bg: 'bg_02.png',

                character_left: 'c_002.png',
                character_center: '',
                character_right: 'c_003.png',

                active_characters: ['character_right'],

                name: 'Brad Snider',
                text: 'We’ve gotta get out of here! This is bad! It’s all going to hell!',

                music: 'music_scene04.mp3',
                voice: 'c_009.wav'
            },

            {
                bg: 'bg_02.png',

                character_left: 'c_002.png',
                character_center: '',
                character_right: 'c_001.png',

                active_characters: ['character_right'],

                name: 'Michael DeSanta',
                text: 'Brad, Shut up and run! Get to the car!',

                music: 'music_scene04.mp3',
                voice: 'c_010.wav'
            },

            {
                bg: 'bg_02.png',

                character_left: 'c_002.png',
                character_center: '',
                character_right: 'c_001.png',

                active_characters: ['character_left'],

                name: 'Trevor Philips',
                text: 'You guys better keep up! Don’t let the cops catch you!',

                music: 'music_scene04.mp3',
                voice: 'c_011.wav'
            },

            {
                bg: 'bg_03.png',

                character_left: '',
                character_center: '',
                character_right: 'c_001_up.png',

                active_characters: ['character_right'],

                name: 'Michael DeSanta',
                text: 'Stay focused! We get out of here, we’re in the clear. Just don’t stop.',

                music: 'music_scene04.mp3',
                voice: 'c_012.wav'
            },

            {
                bg: 'bg_03.png',

                character_left: '',
                character_center: '',
                character_right: 'c_003_up.png',

                active_characters: ['character_right'],

                name: 'Brad Snider',
                text: 'They’re everywhere! They’re gonna get us!',

                music: 'music_scene04.mp3',
                voice: 'c_013.wav'
            },

            {
                bg: 'bg_03.png',

                character_left: '',
                character_center: '',
                character_right: 'c_002_up.png',

                active_characters: ['character_right'],

                name: 'Trevor Philips',
                text: '(Laugh wildly)They’re gonna have to work harder than that to catch us!',

                music: 'music_scene04.mp3',
                voice: 'c_014.wav'
            },
            
            {
                bg: 'bg_03.png',

                character_left: '',
                character_center: '',
                character_right: 'c_001_up.png',

                active_characters: ['character_right'],

                name: 'Michael DeSanta',
                text: 'Alright, we made it. Let’s get the hell out of here, lay low for a while.',

                music: 'music_scene04.mp3',
                voice: 'c_015.wav'
            },

            {
                bg: 'bg_03.png',

                character_left: '',
                character_center: '',
                character_right: 'c_002_up.png',

                active_characters: ['character_right'],

                name: 'Trevor Philips',
                text: 'That was too damn close, Michael. We’re not out of the woods yet.',

                music: 'music_scene04.mp3',
                voice: 'c_016.wav'
            },
            
            {
                bg: 'bg_03.png',

                character_left: '',
                character_center: '',
                character_right: 'c_003_up.png',

                active_characters: ['character_right'],

                name: 'Brad Snider',
                text: 'Man, We’re done. We’re done for. The cops are everywhere…',

                music: 'music_scene04.mp3',
                voice: 'c_017.wav'
            },
            
            {
                bg: 'bg_03.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'Brad becomes increasingly desperate and thinks they have no chance of escape.',

                music: 'music_scene04.mp3',
                voice: 'c_018.wav'
            },

            {
                bg: 'bg_04.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'When Brad is shot by a police bullet, Trevor angrily accuses Michael of believing the robbery plan was a complete failure.',

                music: 'music_scene04.mp3',
                voice: 'c_019.wav'
            },

            {
                bg: 'bg_04.png',

                character_left: 'c_002.png',
                character_center: '',
                character_right: 'c_001.png',

                active_characters: ['character_left'],

                name: 'Trevor Philips',
                text: 'What the hell, Michael?! You promised us a clean break!',

                music: 'music_scene04.mp3',
                voice: 'c_020.wav'
            },
          
            {
                bg: 'bg_04.png',

                character_left: 'c_002.png',
                character_center: '',
                character_right: 'c_001.png',

                active_characters: ['character_right'],

                name: 'Michael DeSanta',
                text: 'It wasn’t supposed to go down like this. We didn’t have a choice.',

                music: 'music_scene04.mp3',
                voice: 'c_021.wav'
            },

            {
                bg: 'bg_04.png',

                character_left: 'c_003.png',
                character_center: '',
                character_right: '',

                active_characters: ['character_left'],

                name: 'Brad Snider',
                text: 'Don’t leave me here… don’t leave me here…',

                music: 'music_scene04.mp3',
                voice: 'c_022.wav'
            },
            
            {
                bg: 'bg_04.png',

                character_left: 'c_002.png',
                character_center: '',
                character_right: 'c_001.png',

                active_characters: ['character_left'],

                name: 'Trevor Philips',
                text: 'What the hell, man?! What are we gonna do now? We’re done. They’ll find us…',

                music: 'music_scene04.mp3',
                voice: 'c_023.wav'
            },
            
            {
                bg: 'bg_04.png',

                character_left: 'c_002.png',
                character_center: '',
                character_right: 'c_001.png',

                active_characters: ['character_right'],

                name: 'Michael DeSanta',
                text: 'We have to get out. We’re not done. But Brad… Brad’s gone.',

                music: 'music_scene04.mp3',
                voice: 'c_024.wav'
            },
            
            {
                bg: 'bg_04.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'Michael is a bit lost, knowing that he and Trevor need to continue their escape, but realizes that they have lost Brad.',

                music: 'music_scene02.mp3',
                voice: 'c_025.wav'
            },

            {
                bg: 'bg_05.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'Three years later',

                music: 'music_scene02.mp3',
                voice: 'c_026.wav'
            },

            {
                bg: 'bg_05.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'Over the years, I really thought I could find a new beginning. But now, looking at all this, I just feel empty.',

                music: 'music_scene02.mp3',
                voice: 'c_027.wav'
            },

            {
                bg: 'bg_06.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'I knew what she was talking about, but how could I respond? Over the years, I had done nothing but watch myself slip into the past.',

                music: 'music_scene02.mp3',
                voice: 'c_028.wav'
            },

            {
                bg: 'bg_07.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'I once tried to connect with him, but now, my efforts seem to have been in vain.',

                music: 'music_scene02.mp3',
                voice: 'c_029.wav'
            },

            {
                bg: 'bg_08.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'Family, career, love... I have thought about it a lot over the years, but nothing seems to have changed.',

                music: 'music_scene02.mp3',
                voice: 'c_030.wav'
            },

            {
                bg: 'bg_09.png',

                character_left: '',
                character_center: '',
                character_right: '',

                active_characters: [''],

                name: 'Narration',
                text: 'I can\'t be confused any longer. It\'s time to make a change. No matter what the cost.',

                music: 'music_scene02.mp3',
                voice: 'c_031.wav'
            }
        ]
    },

    scene_2: {
        id: 'scene_001',
        type: 'select',
        nextScene: '',
        continueButton: '确认',

        locations: [
            {
                name: 'Weazel Plaza',
                bg: 'bg_11.png',
                music: 'music_scene01.mp3',
                text: 'Weazel Plaza is a bustling commercial district and the financial and corporate heart of Los Santos. Tall buildings, modern architectural styles, and busy streets constitute the characteristics of this area.',

                characters: [
                    {
                        name: 'Sophie',
                        image: 'c_008.png',
                        position: 'left',
                        voice: '',
                        text: 'A passionate and promiscuous nightclub girl who just attended a party and hopes to have a more enjoyable time.'
                    },

                    {
                        name: 'Elena',
                        image: 'c_005.png',
                        position: 'left',
                        voice: '',
                        text: 'The sexy new female neighbor exudes a primitive sensuality and alluring mystery, which will captivate you and make you crave more.'
                    },
                ]
            },

            {
                name: 'Grove Street',
                bg: 'bg_12.png',
                music: 'music_scene03.mp3',
                text: 'This is an iconic block in the game, originally the stronghold of the Grove Street Families gang. On both sides of the street are typical residential buildings in the Los Santos slums, filled with a lively atmosphere.',

                characters: [
                    {
                        name: 'Mia',
                        image: 'c_007.png',
                        position: 'left',
                        voice: '',
                        text: 'A typical Gothic girl, 19 years old, spends most of her time being very reclusive and likes to stare at others expressionlessly.'
                    },

                    {
                        name: 'Aiko',
                        image: 'c_009.png',
                        position: 'left',
                        voice: '',
                        text: 'A young and sincere girl I come from a poor family background She was forced to work for a living because her parents owed a lot of debt to the bank.'
                    }
                ]
            },

            {
                name: 'Vespucci Beach',
                bg: 'bg_13.png',
                music: 'music_scene05.mp3',
                text: 'This is one of the main beaches in Los Santos, with vast sandy beaches, amusement facilities, beach volleyball courts, and cycling trails. Beside the beach is a bustling street where many people often engage in various activities.',

                characters: [
                    {
                        name: 'Isabella',
                        image: 'c_006.png',
                        position: 'left',
                        voice: '',
                        text: 'The chief flight attendant of the famous airline LED, with a refined lifestyle and submission to money.'
                    },
                    
                    {
                        name: 'Luna',
                        image: 'c_004.png',
                        position: 'left',
                        voice: '',
                        text: 'A foreign student who has just entered the first year of a prestigious high school has a warm and bright smile, and enjoys making new friends.'
                    },
                ]
            }
        ],
    }
}; 