import * as THREE from 'three';
import Enemy from '../entities/Enemy.js';

// 敌人管理器类
class EnemyManager {
    constructor(scene, spawnRate = 3000, enemySpeed = 3, enemyHealth = 100) {
        // 保存场景引用
        this.scene = scene;
        
        // 敌人属性
        this.spawnRate = spawnRate;         // 生成敌人的间隔（毫秒）
        this.enemySpeed = enemySpeed;       // 敌人移动速度
        this.enemyHealth = enemyHealth;     // 敌人生命值
        
        // 敌人列表
        this.enemies = [];
        
        // 上次生成敌人的时间
        this.lastSpawnTime = 0;
        
        // 游戏统计
        this.killCount = 0;
        
        console.log('EnemyManager initialized');
    }
    
    // 更新
    update(deltaTime, playerPosition) {
        // 生成新敌人
        this.spawnEnemies(playerPosition);
        
        // 更新所有敌人
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, playerPosition);
        });
        
        // 移除死亡的敌人
        this.enemies = this.enemies.filter(enemy => enemy.isAlive);
    }
    
    // 生成敌人
    spawnEnemies(playerPosition) {
        // 检查是否到达生成间隔
        const now = Date.now();
        if (now - this.lastSpawnTime < this.spawnRate) return;
        
        // 更新上次生成时间
        this.lastSpawnTime = now;
        
        // 在玩家周围随机位置生成敌人
        const spawnDistance = 30; // 生成距离
        const angle = Math.random() * Math.PI * 2; // 随机角度
        
        // 计算生成位置
        const spawnPosition = new THREE.Vector3(
            playerPosition.x + Math.cos(angle) * spawnDistance,
            0,
            playerPosition.z + Math.sin(angle) * spawnDistance
        );
        
        // 检查生成位置是否在世界边界内
        const worldSize = 100; // 假设世界大小为100x100
        if (
            spawnPosition.x > worldSize ||
            spawnPosition.x < -worldSize ||
            spawnPosition.z > worldSize ||
            spawnPosition.z < -worldSize
        ) {
            return; // 超出边界，不生成
        }
        
        // 创建新敌人
        const enemy = new Enemy(
            this.scene,
            spawnPosition,
            this.enemySpeed,
            this.enemyHealth
        );
        
        // 添加到敌人列表
        this.enemies.push(enemy);
        
        console.log(`Spawned enemy at (${spawnPosition.x.toFixed(2)}, ${spawnPosition.z.toFixed(2)}). Total enemies: ${this.enemies.length}`);
    }
    
    // 检查玩家碰撞
    checkPlayerCollision(playerPosition, radius) {
        // 检查所有敌人是否与玩家碰撞
        for (const enemy of this.enemies) {
            if (enemy.checkCollision(playerPosition, radius)) {
                return true;
            }
        }
        
        return false;
    }
    
    // 对范围内的敌人造成伤害
    damageInRadius(position, radius, damage) {
        let killedCount = 0;
        
        // 检查所有敌人是否在爆炸范围内
        this.enemies.forEach(enemy => {
            // 计算距离
            const distance = new THREE.Vector3()
                .subVectors(enemy.position, position)
                .length();
            
            // 检查是否在范围内
            if (distance <= radius) {
                // 造成伤害，并检查是否击杀
                if (enemy.takeDamage(damage)) {
                    killedCount++;
                    this.killCount++;
                }
            }
        });
        
        return killedCount;
    }
    
    // 射击检测
    checkShot(rayOrigin, rayDirection, range, damage) {
        let closestHit = null;
        let closestDistance = Infinity;
        
        // 检查所有敌人
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            // 创建射线
            const raycaster = new THREE.Raycaster(rayOrigin, rayDirection, 0, range);
            
            // 检测与敌人的碰撞
            const intersects = raycaster.intersectObject(enemy.body, true);
            
            if (intersects.length > 0) {
                // 找到最近的碰撞点
                const hit = intersects[0];
                
                if (hit.distance < closestDistance) {
                    closestDistance = hit.distance;
                    closestHit = {
                        enemy: enemy,
                        point: hit.point,
                        distance: hit.distance
                    };
                }
            }
        });
        
        // 如果有碰撞，造成伤害
        if (closestHit) {
            const killed = closestHit.enemy.takeDamage(damage);
            if (killed) {
                this.killCount++;
                console.log(`Enemy killed! Total kills: ${this.killCount}`);
            }
            
            return {
                hit: true,
                point: closestHit.point,
                killed: killed
            };
        }
        
        return { hit: false };
    }
    
    // 获取敌人数量
    getEnemyCount() {
        return this.enemies.length;
    }
    
    // 获取击杀数
    getKillCount() {
        return this.killCount;
    }
    
    // 清除所有敌人
    clearAllEnemies() {
        // 移除所有敌人
        this.enemies.forEach(enemy => {
            enemy.remove();
        });
        
        // 清空敌人列表
        this.enemies = [];
    }
}

export default EnemyManager;
