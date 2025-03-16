// 音效管理器类

class SoundManager {
    constructor() {
        // 音效列表
        this.sounds = {
            gunfire: document.getElementById('preload-gunfire'),
            hit: document.getElementById('preload-hit'),
            grenade: document.getElementById('preload-grenade'),
            explosion: document.getElementById('preload-explosion'),
            kill: document.getElementById('preload-kill')
        };
        
        // 音量设置
        this.volume = 0.5;
        
        // 初始化
        this.init();
    }
    
    // 初始化
    init() {
        // 设置所有音效的音量
        for (const sound in this.sounds) {
            if (this.sounds[sound]) {
                this.sounds[sound].volume = this.volume;
            }
        }
        
        // 将实例保存到全局，以便其他类可以访问
        window.soundManager = this;
    }
    
    // 播放音效
    playSound(name) {
        const sound = this.sounds[name];
        
        if (sound) {
            // 重置音效
            sound.currentTime = 0;
            
            // 播放音效
            sound.play().catch(error => {
                console.error(`无法播放音效 ${name}:`, error);
            });
        }
    }
    
    // 设置音量
    setVolume(volume) {
        // 限制音量范围
        this.volume = Math.max(0, Math.min(1, volume));
        
        // 更新所有音效的音量
        for (const sound in this.sounds) {
            if (this.sounds[sound]) {
                this.sounds[sound].volume = this.volume;
            }
        }
    }
    
    // 停止所有音效
    stopAll() {
        for (const sound in this.sounds) {
            if (this.sounds[sound]) {
                this.sounds[sound].pause();
                this.sounds[sound].currentTime = 0;
            }
        }
    }
    
    // 加载音效
    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            // 设置加载事件
            audio.addEventListener('canplaythrough', () => {
                this.sounds[name] = audio;
                resolve(audio);
            }, { once: true });
            
            // 设置错误事件
            audio.addEventListener('error', (error) => {
                reject(error);
            }, { once: true });
            
            // 设置音频属性
            audio.volume = this.volume;
            audio.src = url;
            audio.load();
        });
    }
}
