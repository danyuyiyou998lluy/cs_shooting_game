// 使用 Web Audio API 生成简单的音效
export function createOscillator(context, type = 'square', frequency = 440, duration = 0.1) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    return {
        start: () => {
            oscillator.start();
            setTimeout(() => oscillator.stop(), duration * 1000);
        }
    };
}

export const soundEffects = {
    pistol: {
        type: 'square',
        frequency: 220,
        duration: 0.1
    },
    rifle: {
        type: 'square',
        frequency: 440,
        duration: 0.05
    },
    shotgun: {
        type: 'square',
        frequency: 110,
        duration: 0.2
    },
    reload: {
        type: 'sine',
        frequency: 880,
        duration: 0.15
    },
    empty: {
        type: 'sine',
        frequency: 110,
        duration: 0.1
    }
};

// 音效配置
export const sounds = {
    // 武器音效
    pistolShot: {
        file: '/sounds/pistol-shot.mp3',
        fallback: {
            type: 'square',
            frequency: 220,
            duration: 0.1,
            volume: 0.3
        }
    },
    rifleShot: {
        file: '/sounds/rifle-shot.mp3',
        fallback: {
            type: 'square',
            frequency: 440,
            duration: 0.05,
            volume: 0.3
        }
    },
    shotgunShot: {
        file: '/sounds/shotgun-shot.mp3',
        fallback: {
            type: 'square',
            frequency: 110,
            duration: 0.2,
            volume: 0.4
        }
    },
    // 装弹音效
    reload: {
        file: '/sounds/reload.mp3',
        fallback: {
            type: 'sine',
            frequency: 440,
            duration: 0.3,
            volume: 0.2
        }
    },
    // 弹药耗尽音效
    empty: {
        file: '/sounds/empty.mp3',
        fallback: {
            type: 'sine',
            frequency: 220,
            duration: 0.15,
            volume: 0.2
        }
    },
    // 命中音效
    hit: {
        file: '/sounds/hit.mp3',
        fallback: {
            type: 'sine',
            frequency: 880,
            duration: 0.1,
            volume: 0.2
        }
    },
    // 玩家受伤音效
    playerHit: {
        file: '/sounds/player-hit.mp3',
        fallback: {
            type: 'sine',
            frequency: 220,
            duration: 0.2,
            volume: 0.3
        }
    },
    // 玩家死亡音效
    playerDeath: {
        file: '/sounds/player-death.mp3',
        fallback: {
            type: 'sine',
            frequency: 110,
            duration: 0.5,
            volume: 0.4
        }
    }
};
