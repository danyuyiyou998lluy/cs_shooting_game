import { sounds } from '../config/sounds.js';

class SoundManager {
    constructor() {
        // 音频上下文
        this.audioContext = null;
        
        // 音频缓存
        this.audioBuffers = {};
        
        // 当前正在播放的音频
        this.currentSounds = {};
        
        // 初始化音频上下文
        this.initAudioContext();
        
        // 加载音效
        this.loadSounds();
        
        console.log('SoundManager initialized');
    }
    
    // 初始化音频上下文
    initAudioContext() {
        try {
            // 创建音频上下文
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('Audio context created successfully');
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
        }
    }
    
    // 加载音效
    loadSounds() {
        // 如果没有音频上下文，则不加载
        if (!this.audioContext) return;
        
        // 加载所有音效
        Object.keys(sounds).forEach(id => {
            const sound = sounds[id];
            
            // 如果有音频文件，则加载
            if (sound.file) {
                this.loadSoundFile(id, sound.file);
            }
        });
    }
    
    // 加载音效文件
    loadSoundFile(id, file) {
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.audioBuffers[id] = audioBuffer;
                console.log(`Sound ${id} loaded successfully`);
            })
            .catch(e => {
                console.error(`Error loading sound ${id} from ${file}:`, e);
            });
    }
    
    // 播放音效
    playSound(id) {
        // 如果没有音频上下文，则不播放
        if (!this.audioContext) {
            console.warn('No audio context available');
            return;
        }
        
        // 如果音效不存在，则生成
        if (!this.audioBuffers[id]) {
            console.warn(`Sound ${id} not loaded, generating fallback sound`);
            this.generateSound(id);
            return;
        }
        
        try {
            // 创建音源
            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffers[id];
            
            // 创建增益节点（用于控制音量）
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0.5; // 设置音量
            
            // 连接节点
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 播放音效
            source.start(0);
            
            // 存储当前播放的音效，以便后续控制
            // 使用数组存储多个同类型音效实例，允许重叠播放
            if (!this.currentSounds[id]) {
                this.currentSounds[id] = [];
            }
            this.currentSounds[id].push({ source, gainNode });
            
            // 音效播放完成后从列表中移除
            source.onended = () => {
                const index = this.currentSounds[id].findIndex(sound => sound.source === source);
                if (index !== -1) {
                    this.currentSounds[id].splice(index, 1);
                }
            };
            
            console.log(`Playing sound ${id}`);
        } catch (e) {
            console.error(`Error playing sound ${id}:`, e);
            this.generateSound(id);
        }
    }
    
    // 生成音效（作为备用）
    generateSound(id) {
        // 如果没有音频上下文，则不生成
        if (!this.audioContext) return;
        
        // 获取音效配置
        const sound = sounds[id];
        if (!sound) {
            console.error(`Sound ${id} not found in config`);
            return;
        }
        
        try {
            // 创建振荡器
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = sound.fallback.type || 'sine';
            oscillator.frequency.value = sound.fallback.frequency || 440;
            
            // 创建增益节点
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = sound.fallback.volume || 0.1;
            
            // 设置音量包络
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(sound.fallback.volume || 0.1, now + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, now + (sound.fallback.duration || 0.3));
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 播放音效
            oscillator.start();
            oscillator.stop(now + (sound.fallback.duration || 0.3));
            
            console.log(`Generated fallback sound for ${id}`);
        } catch (e) {
            console.error(`Error generating fallback sound for ${id}:`, e);
        }
    }
    
    // 播放武器射击音效
    playWeaponSound(type) {
        switch(type) {
            case 'pistol':
                this.playSound('pistolShot');
                break;
            case 'rifle':
                this.playSound('rifleShot');
                break;
            case 'shotgun':
                this.playSound('shotgunShot');
                break;
            default:
                console.warn(`Unknown weapon type: ${type}`);
                this.playSound('pistolShot');
        }
    }
    
    // 播放装弹音效
    playReloadSound() {
        this.playSound('reload');
    }
    
    // 播放弹药耗尽音效
    playEmptySound() {
        this.playSound('empty');
    }
    
    // 播放命中音效
    playHitSound() {
        this.playSound('hit');
    }
}

export default SoundManager;
