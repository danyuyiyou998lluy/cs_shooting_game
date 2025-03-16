// 手榴弹类

class Grenade {
    constructor(scene, position, direction) {
        // 保存场景引用
        this.scene = scene;
        
        // 手榴弹属性
        this.position = position.clone();
        this.velocity = direction.clone().multiplyScalar(15); // 初始速度
        this.velocity.y = 5; // 向上的初始速度
        this.isActive = true;
        this.hasExploded = false;
        this.timeToExplode = 3; // 爆炸倒计时（秒）
        this.elapsedTime = 0;
        
        // 爆炸属性
        this.explosionRadius = 8;
        this.explosionDamage = 100;
        
        // 物理属性
        this.gravity = 9.8;
        this.bounceCoefficient = 0.5; // 弹跳系数
        
        // 创建手榴弹模型
        this.createModel();
    }
    
    // 创建手榴弹模型
    createModel() {
        // 手榴弹几何体
        const grenadeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const grenadeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(grenadeGeometry, grenadeMaterial);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        
        // 添加到场景
        this.scene.add(this.mesh);
    }
    
    // 更新
    update(deltaTime) {
        if (!this.isActive) return;
        
        // 更新倒计时
        this.elapsedTime += deltaTime;
        
        // 检查是否爆炸
        if (this.elapsedTime >= this.timeToExplode && !this.hasExploded) {
            this.explode();
            return;
        }
        
        // 应用重力
        this.velocity.y -= this.gravity * deltaTime;
        
        // 更新位置
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // 检查地面碰撞
        if (this.position.y <= 0.2) { // 手榴弹半径
            this.position.y = 0.2;
            this.velocity.y = -this.velocity.y * this.bounceCoefficient;
            
            // 减少水平速度（模拟摩擦）
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
        }
        
        // 检查墙壁碰撞
        this.checkWallCollisions();
        
        // 更新模型位置
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            
            // 旋转手榴弹（模拟滚动）
            this.mesh.rotation.x += this.velocity.z * 0.1;
            this.mesh.rotation.z -= this.velocity.x * 0.1;
        }
    }
    
    // 检查墙壁碰撞
    checkWallCollisions() {
        const worldSize = GameConfig.world.size - 0.2; // 减去手榴弹半径
        
        // X轴边界
        if (this.position.x > worldSize) {
            this.position.x = worldSize;
            this.velocity.x = -this.velocity.x * this.bounceCoefficient;
        } else if (this.position.x < -worldSize) {
            this.position.x = -worldSize;
            this.velocity.x = -this.velocity.x * this.bounceCoefficient;
        }
        
        // Z轴边界
        if (this.position.z > worldSize) {
            this.position.z = worldSize;
            this.velocity.z = -this.velocity.z * this.bounceCoefficient;
        } else if (this.position.z < -worldSize) {
            this.position.z = -worldSize;
            this.velocity.z = -this.velocity.z * this.bounceCoefficient;
        }
    }
    
    // 爆炸
    explode() {
        this.hasExploded = true;
        
        // 创建爆炸效果
        const explosion = new ExplosionEffect(
            this.scene,
            this.position.clone(),
            this.explosionRadius
        );
        
        // 移除手榴弹模型
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        
        // 一段时间后停用手榴弹
        setTimeout(() => {
            this.isActive = false;
        }, 1000);
    }
    
    // 从场景中移除
    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}
