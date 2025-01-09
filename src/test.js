import { Application, Graphics, Container, Text } from 'pixi.js';

export class Test {
    constructor() {
        // 创建两个音频元素
        this.bgm = new Audio('assets/audio/music/music_scene01.mp3');
        this.voice = new Audio('assets/audio/voice/c_001.wav');
        
        // 设置BGM循环播放
        this.bgm.loop = true;
    }

    async playAll() {
        // 同时播放BGM和语音
        try {
            await this.bgm.play();
            await this.voice.play();
        } catch (error) {
            console.log('Audio play error:', error);
        }
    }
}

export const test = new Test(); 