// 子弹类

class Bullet {
    constructor(position, direction, damage) {
        // 子弹属性
        this.position = position.clone();
        this.direction = direction.clone();
        this.velocity = direction.clone().multiplyScalar(50); // 子弹速度
        this.damage = damage;
        this.isActive = true;
        this.lifeTime = 2; // 子弹生命周期（秒）
        this.elapsedTime = 0;
        
        // 子弹几何体
        this.geometry = new THREE.SphereGeometry(0.05, 8, 8);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.mesh = null;
    }
    
    // 创建子弹网格
    createMesh(scene) {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
    }
    
    // 更新
    update(deltaTime) {
        if (!this.isActive) return;
        
        // 更新生命周期
        this.elapsedTime += deltaTime;
        if (this.elapsedTime >= this.lifeTime) {
            this.deactivate();
            return;
        }
        
        // 更新位置
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // 更新网格位置
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
        
        // 检查是否超出边界
        this.checkBoundaries();
    }
    
    // 检查边界
    checkBoundaries() {
        const worldSize = GameConfig.world.size;
        
        // 检查是否超出世界边界
        if (
            this.position.x > worldSize ||
            this.position.x < -worldSize ||
            this.position.y > worldSize ||
            this.position.y < 0 ||
            this.position.z > worldSize ||
            this.position.z < -worldSize
        ) {
            this.deactivate();
        }
    }
    
    // 检查与敌人的碰撞
    checkCollision(enemy) {
        if (!this.isActive || !enemy.isAlive) return false;
        
        // 计算与敌人的距离
        const distance = new THREE.Vector3()
            .subVectors(this.position, enemy.position)
            .length();
        
        // 检查是否碰撞（考虑敌人高度）
        return distance < 1 && this.position.y < 2;
    }
    
    // 停用子弹
    deactivate() {
        this.isActive = false;
    }
    
    // 从场景中移除
    remove(scene) {
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}
