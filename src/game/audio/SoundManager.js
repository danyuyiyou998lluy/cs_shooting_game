// 声音管理系统

class SoundManager {
    constructor() {
        // 音频上下文
        this.audioContext = null;
        
        // 音频缓冲区
        this.audioBuffers = {};
        
        // 当前播放的音频
        this.activeSounds = {};
        
        // 背景音乐
        this.backgroundMusic = null;
        
        // 主音量
        this.masterVolume = 1.0;
        
        // 音效音量
        this.sfxVolume = 1.0;
        
        // 音乐音量
        this.musicVolume = 0.5;
        
        // 是否静音
        this.muted = false;
        
        // 音频配置
        this.soundConfig = {
            // 武器音效
            gunshot_pistol: { path: 'assets/sounds/weapons/pistol_shot.mp3', volume: 0.7, loop: false },
            gunshot_rifle: { path: 'assets/sounds/weapons/rifle_shot.mp3', volume: 0.8, loop: false },
            gunshot_shotgun: { path: 'assets/sounds/weapons/shotgun_shot.mp3', volume: 0.9, loop: false },
            gunshot_sniper: { path: 'assets/sounds/weapons/sniper_shot.mp3', volume: 0.8, loop: false },
            gunshot_smg: { path: 'assets/sounds/weapons/smg_shot.mp3', volume: 0.7, loop: false },
            
            // 武器操作音效
            weapon_reload: { path: 'assets/sounds/weapons/reload.mp3', volume: 0.6, loop: false },
            weapon_empty: { path: 'assets/sounds/weapons/empty.mp3', volume: 0.5, loop: false },
            weapon_switch: { path: 'assets/sounds/weapons/switch.mp3', volume: 0.5, loop: false },
            
            // 玩家音效
            player_footstep: { path: 'assets/sounds/player/footstep.mp3', volume: 0.4, loop: false },
            player_jump: { path: 'assets/sounds/player/jump.mp3', volume: 0.5, loop: false },
            player_land: { path: 'assets/sounds/player/land.mp3', volume: 0.5, loop: false },
            player_hurt: { path: 'assets/sounds/player/hurt.mp3', volume: 0.6, loop: false },
            player_death: { path: 'assets/sounds/player/death.mp3', volume: 0.7, loop: false },
            
            // 敌人音效
            enemy_footstep: { path: 'assets/sounds/enemies/footstep.mp3', volume: 0.3, loop: false },
            enemy_alert: { path: 'assets/sounds/enemies/alert.mp3', volume: 0.6, loop: false },
            enemy_hurt: { path: 'assets/sounds/enemies/hurt.mp3', volume: 0.5, loop: false },
            enemy_death: { path: 'assets/sounds/enemies/death.mp3', volume: 0.6, loop: false },
            
            // 物品音效
            itemPickup: { path: 'assets/sounds/items/pickup.mp3', volume: 0.5, loop: false },
            healthPickup: { path: 'assets/sounds/items/health_pickup.mp3', volume: 0.6, loop: false },
            armorPickup: { path: 'assets/sounds/items/armor_pickup.mp3', volume: 0.6, loop: false },
            ammoPickup: { path: 'assets/sounds/items/ammo_pickup.mp3', volume: 0.5, loop: false },
            
            // 界面音效
            ui_click: { path: 'assets/sounds/ui/click.mp3', volume: 0.4, loop: false },
            ui_hover: { path: 'assets/sounds/ui/hover.mp3', volume: 0.3, loop: false },
            
            // 游戏状态音效
            game_start: { path: 'assets/sounds/game/start.mp3', volume: 0.7, loop: false },
            game_over: { path: 'assets/sounds/game/over.mp3', volume: 0.7, loop: false },
            level_complete: { path: 'assets/sounds/game/level_complete.mp3', volume: 0.7, loop: false },
            
            // 命中音效
            hitmarker: { path: 'assets/sounds/feedback/hit.mp3', volume: 0.5, loop: false },
            hitmarker_headshot: { path: 'assets/sounds/feedback/headshot.mp3', volume: 0.6, loop: false },
            
            // 通知音效
            notification_info: { path: 'assets/sounds/notifications/info.mp3', volume: 0.4, loop: false },
            notification_success: { path: 'assets/sounds/notifications/success.mp3', volume: 0.5, loop: false },
            notification_warning: { path: 'assets/sounds/notifications/warning.mp3', volume: 0.5, loop: false },
            notification_error: { path: 'assets/sounds/notifications/error.mp3', volume: 0.5, loop: false },
            
            // 环境音效
            ambient_wind: { path: 'assets/sounds/ambient/wind.mp3', volume: 0.3, loop: true },
            
            // 背景音乐
            music_menu: { path: 'assets/sounds/music/menu.mp3', volume: 0.5, loop: true },
            music_gameplay: { path: 'assets/sounds/music/gameplay.mp3', volume: 0.4, loop: true },
            music_intense: { path: 'assets/sounds/music/intense.mp3', volume: 0.5, loop: true },
            music_gameover: { path: 'assets/sounds/music/gameover.mp3', volume: 0.5, loop: true }
        };
        
        // 初始化
        this.initialize();
        
        // 将实例保存到全局，以便其他类可以访问
        window.soundManager = this;
    }
    
    // 初始化
    async initialize() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主音量节点
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = this.masterVolume;
            this.masterGainNode.connect(this.audioContext.destination);
            
            // 创建音效音量节点
            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.gain.value = this.sfxVolume;
            this.sfxGainNode.connect(this.masterGainNode);
            
            // 创建音乐音量节点
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.gain.value = this.musicVolume;
            this.musicGainNode.connect(this.masterGainNode);
            
            // 预加载音频
            await this.preloadAudio();
            
            console.log('SoundManager initialized');
        } catch (error) {
            console.error('Error initializing SoundManager:', error);
        }
    }
    
    // 预加载音频
    async preloadAudio() {
        // 获取所有音频配置
        const soundKeys = Object.keys(this.soundConfig);
        
        // 创建加载音频的Promise数组
        const loadPromises = soundKeys.map(key => this.loadSound(key));
        
        // 等待所有音频加载完成
        try {
            await Promise.all(loadPromises);
            console.log('All sounds preloaded');
        } catch (error) {
            console.error('Error preloading sounds:', error);
        }
    }
    
    // 加载单个音频
    async loadSound(key) {
        // 获取音频配置
        const config = this.soundConfig[key];
        
        if (!config) {
            console.error(`Sound config not found for key: ${key}`);
            return;
        }
        
        try {
            // 加载音频文件
            const response = await fetch(config.path);
            const arrayBuffer = await response.arrayBuffer();
            
            // 解码音频数据
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // 存储音频缓冲区
            this.audioBuffers[key] = audioBuffer;
            
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading sound ${key}:`, error);
        }
    }
    
    // 播放音效
    playSound(key, options = {}) {
        // 如果静音，则不播放
        if (this.muted) return null;
        
        // 获取音频缓冲区
        const buffer = this.audioBuffers[key];
        
        if (!buffer) {
            console.warn(`Sound not loaded for key: ${key}`);
            return null;
        }
        
        // 获取音频配置
        const config = this.soundConfig[key] || {};
        
        // 创建音频源
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // 设置循环
        source.loop = options.loop !== undefined ? options.loop : config.loop || false;
        
        // 创建增益节点
        const gainNode = this.audioContext.createGain();
        
        // 设置音量
        const volume = options.volume !== undefined ? options.volume : config.volume || 1.0;
        gainNode.gain.value = volume;
        
        // 连接节点
        source.connect(gainNode);
        
        // 判断是否是音乐
        const isMusic = key.startsWith('music_');
        
        // 连接到相应的音量节点
        if (isMusic) {
            gainNode.connect(this.musicGainNode);
        } else {
            gainNode.connect(this.sfxGainNode);
        }
        
        // 播放音频
        source.start(0);
        
        // 生成唯一ID
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // 存储活动音频
        this.activeSounds[id] = {
            source,
            gainNode,
            key,
            isMusic
        };
        
        // 如果不循环，则在播放完成后移除
        if (!source.loop) {
            source.onended = () => {
                this.removeSound(id);
            };
        }
        
        // 如果是背景音乐，则停止当前的背景音乐
        if (isMusic) {
            this.stopBackgroundMusic();
            this.backgroundMusic = id;
        }
        
        return id;
    }
    
    // 停止音效
    stopSound(id) {
        const sound = this.activeSounds[id];
        
        if (!sound) return;
        
        try {
            sound.source.stop();
        } catch (error) {
            console.warn('Error stopping sound:', error);
        }
        
        this.removeSound(id);
    }
    
    // 移除音效
    removeSound(id) {
        const sound = this.activeSounds[id];
        
        if (!sound) return;
        
        // 如果是背景音乐，则清除背景音乐引用
        if (id === this.backgroundMusic) {
            this.backgroundMusic = null;
        }
        
        // 删除音效
        delete this.activeSounds[id];
    }
    
    // 播放背景音乐
    playBackgroundMusic(key, options = {}) {
        // 停止当前的背景音乐
        this.stopBackgroundMusic();
        
        // 播放新的背景音乐
        const id = this.playSound(key, { 
            ...options, 
            loop: options.loop !== undefined ? options.loop : true 
        });
        
        // 存储背景音乐ID
        this.backgroundMusic = id;
        
        return id;
    }
    
    // 停止背景音乐
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.stopSound(this.backgroundMusic);
            this.backgroundMusic = null;
        }
    }
    
    // 暂停所有音频
    pauseAll() {
        // 暂停音频上下文
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }
    
    // 恢复所有音频
    resumeAll() {
        // 恢复音频上下文
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // 停止所有音频
    stopAll() {
        // 获取所有活动音频ID
        const ids = Object.keys(this.activeSounds);
        
        // 停止所有音频
        ids.forEach(id => {
            this.stopSound(id);
        });
    }
    
    // 设置主音量
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
    }
    
    // 设置音效音量
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = this.sfxVolume;
        }
    }
    
    // 设置音乐音量
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.musicVolume;
        }
    }
    
    // 设置静音
    setMuted(muted) {
        this.muted = muted;
        
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = muted ? 0 : this.masterVolume;
        }
    }
    
    // 切换静音
    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }
    
    // 播放3D音效
    play3DSound(key, position, listenerPosition, options = {}) {
        // 如果静音，则不播放
        if (this.muted) return null;
        
        // 获取音频缓冲区
        const buffer = this.audioBuffers[key];
        
        if (!buffer) {
            console.warn(`Sound not loaded for key: ${key}`);
            return null;
        }
        
        // 获取音频配置
        const config = this.soundConfig[key] || {};
        
        // 创建音频源
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // 设置循环
        source.loop = options.loop !== undefined ? options.loop : config.loop || false;
        
        // 创建立体声声相节点
        const pannerNode = this.audioContext.createPanner();
        pannerNode.panningModel = 'HRTF';
        pannerNode.distanceModel = 'inverse';
        pannerNode.refDistance = 1;
        pannerNode.maxDistance = 100;
        pannerNode.rolloffFactor = 1;
        
        // 设置声源位置
        pannerNode.positionX.value = position.x;
        pannerNode.positionY.value = position.y;
        pannerNode.positionZ.value = position.z;
        
        // 设置监听器位置
        this.audioContext.listener.positionX.value = listenerPosition.x;
        this.audioContext.listener.positionY.value = listenerPosition.y;
        this.audioContext.listener.positionZ.value = listenerPosition.z;
        
        // 创建增益节点
        const gainNode = this.audioContext.createGain();
        
        // 设置音量
        const volume = options.volume !== undefined ? options.volume : config.volume || 1.0;
        gainNode.gain.value = volume;
        
        // 连接节点
        source.connect(pannerNode);
        pannerNode.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        // 播放音频
        source.start(0);
        
        // 生成唯一ID
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // 存储活动音频
        this.activeSounds[id] = {
            source,
            gainNode,
            pannerNode,
            key,
            isMusic: false,
            is3D: true
        };
        
        // 如果不循环，则在播放完成后移除
        if (!source.loop) {
            source.onended = () => {
                this.removeSound(id);
            };
        }
        
        return id;
    }
    
    // 更新3D音效位置
    update3DSoundPosition(id, position, listenerPosition) {
        const sound = this.activeSounds[id];
        
        if (!sound || !sound.is3D || !sound.pannerNode) return;
        
        // 更新声源位置
        sound.pannerNode.positionX.value = position.x;
        sound.pannerNode.positionY.value = position.y;
        sound.pannerNode.positionZ.value = position.z;
        
        // 更新监听器位置
        this.audioContext.listener.positionX.value = listenerPosition.x;
        this.audioContext.listener.positionY.value = listenerPosition.y;
        this.audioContext.listener.positionZ.value = listenerPosition.z;
    }
    
    // 更新监听器位置和方向
    updateListenerPosition(position, forward, up) {
        // 更新监听器位置
        this.audioContext.listener.positionX.value = position.x;
        this.audioContext.listener.positionY.value = position.y;
        this.audioContext.listener.positionZ.value = position.z;
        
        // 更新监听器方向
        this.audioContext.listener.forwardX.value = forward.x;
        this.audioContext.listener.forwardY.value = forward.y;
        this.audioContext.listener.forwardZ.value = forward.z;
        this.audioContext.listener.upX.value = up.x;
        this.audioContext.listener.upY.value = up.y;
        this.audioContext.listener.upZ.value = up.z;
    }
    
    // 播放随机脚步声
    playFootstepSound(isPlayer = true, position = null, listenerPosition = null) {
        // 选择脚步声类型
        const key = isPlayer ? 'player_footstep' : 'enemy_footstep';
        
        // 随机音量和音调变化，使脚步声更自然
        const volumeVariation = 0.1;
        const rateVariation = 0.2;
        
        const volume = this.soundConfig[key].volume * (1 - volumeVariation / 2 + Math.random() * volumeVariation);
        const playbackRate = 1 - rateVariation / 2 + Math.random() * rateVariation;
        
        // 如果提供了位置，则播放3D音效
        if (position && listenerPosition) {
            return this.play3DSound(key, position, listenerPosition, { 
                volume, 
                playbackRate 
            });
        } else {
            return this.playSound(key, { 
                volume, 
                playbackRate 
            });
        }
    }
    
    // 播放武器射击音效
    playWeaponSound(weaponType, position = null, listenerPosition = null) {
        // 根据武器类型选择音效
        let key;
        switch (weaponType) {
            case 'pistol':
                key = 'gunshot_pistol';
                break;
            case 'rifle':
                key = 'gunshot_rifle';
                break;
            case 'shotgun':
                key = 'gunshot_shotgun';
                break;
            case 'sniper':
                key = 'gunshot_sniper';
                break;
            case 'smg':
                key = 'gunshot_smg';
                break;
            default:
                key = 'gunshot_pistol';
        }
        
        // 如果提供了位置，则播放3D音效
        if (position && listenerPosition) {
            return this.play3DSound(key, position, listenerPosition);
        } else {
            return this.playSound(key);
        }
    }
}

// 导出SoundManager类
export default SoundManager;
