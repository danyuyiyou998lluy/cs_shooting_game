// 手榴弹管理器类

class GrenadeManager {
    constructor(scene) {
        // 保存场景引用
        this.scene = scene;
        
        // 手榴弹列表
        this.grenades = [];
        
        // 最大手榴弹数量
        this.maxGrenades = 10;
        
        // 将实例保存到全局，以便玩家可以访问
        window.grenadeManager = this;
    }
    
    // 添加手榴弹
    addGrenade(grenade) {
        // 检查是否达到最大手榴弹数量
        if (this.grenades.length >= this.maxGrenades) {
            // 移除最旧的手榴弹
            const oldestGrenade = this.grenades.shift();
            oldestGrenade.remove();
        }
        
        // 添加到手榴弹列表
        this.grenades.push(grenade);
        
        // 播放投掷音效
        if (window.soundManager) {
            window.soundManager.playSound('grenade');
        }
    }
    
    // 更新所有手榴弹
    update(deltaTime) {
        // 更新所有手榴弹
        this.grenades.forEach(grenade => {
            grenade.update(deltaTime);
        });
        
        // 移除非活动手榴弹
        const inactiveGrenades = this.grenades.filter(grenade => !grenade.isActive);
        inactiveGrenades.forEach(grenade => {
            grenade.remove();
        });
        
        // 更新手榴弹列表
        this.grenades = this.grenades.filter(grenade => grenade.isActive);
    }
    
    // 检查爆炸
    checkExplosions() {
        const explosions = [];
        
        // 查找已爆炸的手榴弹
        this.grenades.forEach(grenade => {
            if (grenade.hasExploded) {
                // 记录爆炸
                explosions.push({
                    position: grenade.position.clone(),
                    radius: grenade.explosionRadius,
                    damage: grenade.explosionDamage
                });
            }
        });
        
        return explosions;
    }
    
    // 清理所有手榴弹
    clear() {
        // 移除所有手榴弹
        this.grenades.forEach(grenade => {
            grenade.remove();
        });
        
        // 清空手榴弹列表
        this.grenades = [];
    }
}
