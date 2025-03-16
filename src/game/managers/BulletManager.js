// 子弹管理器类

class BulletManager {
    constructor(scene) {
        // 保存场景引用
        this.scene = scene;
        
        // 子弹列表
        this.bullets = [];
        
        // 最大子弹数量
        this.maxBullets = 100;
    }
    
    // 添加子弹
    addBullet(bullet) {
        // 检查是否达到最大子弹数量
        if (this.bullets.length >= this.maxBullets) {
            // 移除最旧的子弹
            const oldestBullet = this.bullets.shift();
            oldestBullet.remove(this.scene);
        }
        
        // 创建子弹网格
        bullet.createMesh(this.scene);
        
        // 添加到子弹列表
        this.bullets.push(bullet);
    }
    
    // 更新所有子弹
    update(deltaTime) {
        // 更新所有子弹
        this.bullets.forEach(bullet => {
            bullet.update(deltaTime);
        });
        
        // 移除非活动子弹
        const inactiveBullets = this.bullets.filter(bullet => !bullet.isActive);
        inactiveBullets.forEach(bullet => {
            bullet.remove(this.scene);
        });
        
        // 更新子弹列表
        this.bullets = this.bullets.filter(bullet => bullet.isActive);
    }
    
    // 检查子弹与敌人的碰撞
    checkCollisions(enemies) {
        const hits = [];
        
        // 检查所有子弹与所有敌人的碰撞
        this.bullets.forEach(bullet => {
            enemies.forEach(enemy => {
                if (bullet.checkCollision(enemy)) {
                    // 记录命中
                    hits.push({
                        bullet: bullet,
                        enemy: enemy
                    });
                    
                    // 停用子弹
                    bullet.deactivate();
                }
            });
        });
        
        return hits;
    }
    
    // 清理所有子弹
    clear() {
        // 移除所有子弹
        this.bullets.forEach(bullet => {
            bullet.remove(this.scene);
        });
        
        // 清空子弹列表
        this.bullets = [];
    }
}
