// 爆炸效果类

class ExplosionEffect {
    constructor(scene, position, radius) {
        // 保存场景引用
        this.scene = scene;
        
        // 爆炸属性
        this.position = position.clone();
        this.radius = radius;
        this.duration = 1; // 爆炸持续时间（秒）
        this.elapsedTime = 0;
        this.isActive = true;
        
        // 创建爆炸效果
        this.createEffect();
    }
    
    // 创建爆炸效果
    createEffect() {
        // 创建爆炸光球
        const explosionGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff5500,
            transparent: true,
            opacity: 1
        });
        
        this.explosionMesh = new THREE.Mesh(explosionGeometry, explosionMaterial);
        this.explosionMesh.position.copy(this.position);
        this.scene.add(this.explosionMesh);
        
        // 创建爆炸粒子
        this.createParticles();
    }
    
    // 创建爆炸粒子
    createParticles() {
        // 粒子数量
        const particleCount = 50;
        
        // 粒子几何体
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        // 初始化粒子位置和速度
        for (let i = 0; i < particleCount; i++) {
            // 随机方向
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = Math.random() * 0.5;
            
            // 计算位置
            const x = this.position.x + r * Math.sin(phi) * Math.cos(theta);
            const y = this.position.y + r * Math.sin(phi) * Math.sin(theta);
            const z = this.position.z + r * Math.cos(phi);
            
            // 设置位置
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            // 计算速度（从爆炸中心向外）
            const vx = (x - this.position.x) * 5;
            const vy = (y - this.position.y) * 5;
            const vz = (z - this.position.z) * 5;
            
            velocities.push(new THREE.Vector3(vx, vy, vz));
        }
        
        // 设置粒子位置
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // 粒子材质
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xff9500,
            size: 0.2,
            transparent: true,
            opacity: 1
        });
        
        // 创建粒子系统
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
        
        // 保存粒子速度
        this.particleVelocities = velocities;
    }
    
    // 更新
    update(deltaTime) {
        if (!this.isActive) return;
        
        // 更新时间
        this.elapsedTime += deltaTime;
        
        // 检查是否结束
        if (this.elapsedTime >= this.duration) {
            this.remove();
            return;
        }
        
        // 计算当前阶段
        const progress = this.elapsedTime / this.duration;
        
        // 更新爆炸光球
        if (this.explosionMesh) {
            // 扩大光球
            const size = this.radius * progress;
            this.explosionMesh.scale.set(size, size, size);
            
            // 降低不透明度
            this.explosionMesh.material.opacity = 1 - progress;
        }
        
        // 更新粒子
        if (this.particles) {
            // 更新粒子位置
            const positions = this.particles.geometry.attributes.position.array;
            
            for (let i = 0; i < this.particleVelocities.length; i++) {
                // 获取速度
                const velocity = this.particleVelocities[i];
                
                // 更新位置
                positions[i * 3] += velocity.x * deltaTime;
                positions[i * 3 + 1] += velocity.y * deltaTime;
                positions[i * 3 + 2] += velocity.z * deltaTime;
                
                // 减小速度（模拟空气阻力）
                velocity.multiplyScalar(0.95);
            }
            
            // 更新粒子位置
            this.particles.geometry.attributes.position.needsUpdate = true;
            
            // 降低不透明度
            this.particles.material.opacity = 1 - progress;
        }
    }
    
    // 移除效果
    remove() {
        this.isActive = false;
        
        // 移除爆炸光球
        if (this.explosionMesh) {
            this.scene.remove(this.explosionMesh);
            this.explosionMesh.geometry.dispose();
            this.explosionMesh.material.dispose();
            this.explosionMesh = null;
        }
        
        // 移除粒子
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.particles = null;
        }
    }
}
