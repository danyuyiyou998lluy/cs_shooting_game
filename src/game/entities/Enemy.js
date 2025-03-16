import * as THREE from 'three';

// 敌人类

class Enemy {
    constructor(scene, position, speed, health) {
        // 保存场景引用
        this.scene = scene;
        
        // 敌人属性
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.speed = speed;
        this.maxHealth = health;
        this.health = health;
        this.isAlive = true;
        
        // 创建敌人模型
        this.createModel();
    }
    
    // 创建敌人模型
    createModel() {
        // 创建敌人身体
        const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.copy(this.position);
        this.body.position.y = 1; // 将身体放在地面上
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        
        // 创建敌人头部
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.7; // 头部位置
        this.head.castShadow = true;
        
        // 将头部添加到身体
        this.body.add(this.head);
        
        // 将敌人添加到场景
        this.scene.add(this.body);
    }
    
    // 更新
    update(deltaTime, playerPosition) {
        if (!this.isAlive) return;
        
        // 计算到玩家的方向
        const direction = new THREE.Vector3()
            .subVectors(playerPosition, this.position)
            .normalize();
        
        // 设置速度
        this.velocity.x = direction.x * this.speed;
        this.velocity.z = direction.z * this.speed;
        
        // 更新位置
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // 更新模型位置
        this.body.position.copy(this.position);
        this.body.position.y = 1; // 保持身体在地面上
        
        // 让敌人面向玩家
        this.body.lookAt(new THREE.Vector3(playerPosition.x, 1, playerPosition.z));
    }
    
    // 受到伤害
    takeDamage(damage) {
        if (!this.isAlive) return false;
        
        // 减少生命值
        this.health -= damage;
        
        // 检查是否死亡
        if (this.health <= 0) {
            this.die();
            return true; // 返回是否击杀
        }
        
        return false;
    }
    
    // 死亡
    die() {
        this.isAlive = false;
        
        // 改变颜色表示死亡
        this.body.material.color.set(0x333333);
        this.head.material.color.set(0x333333);
        
        // 倒下动画
        this.body.rotation.x = Math.PI / 2;
        this.body.position.y = 0.5;
        
        // 一段时间后移除敌人
        setTimeout(() => {
            this.remove();
        }, 3000);
    }
    
    // 移除敌人
    remove() {
        // 从场景中移除
        if (this.body.parent) {
            this.scene.remove(this.body);
        }
    }
    
    // 检查与玩家的碰撞
    checkCollision(playerPosition, radius) {
        if (!this.isAlive) return false;
        
        // 计算距离
        const distance = new THREE.Vector3()
            .subVectors(this.position, playerPosition)
            .length();
        
        // 检查是否碰撞
        return distance < radius + 0.5; // 0.5是敌人半径
    }
}

export default Enemy;
