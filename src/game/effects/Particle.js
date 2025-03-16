import * as THREE from 'three';

class Particle {
    constructor(options = {}) {
        // 基本属性
        this.position = options.position || new THREE.Vector3();
        this.velocity = options.velocity || new THREE.Vector3();
        this.acceleration = options.acceleration || new THREE.Vector3();
        
        // 生命周期
        this.life = options.life || 1.0;
        this.maxLife = this.life;
        
        // 大小
        this.size = options.size || 1.0;
        this.startSize = this.size;
        this.endSize = options.endSize || this.size;
        
        // 颜色
        this.color = options.color || new THREE.Color(1, 1, 1);
        this.startColor = this.color.clone();
        this.endColor = options.endColor ? new THREE.Color(options.endColor) : this.color.clone();
        
        // 透明度
        this.opacity = options.opacity || 1.0;
        this.startOpacity = this.opacity;
        this.endOpacity = options.endOpacity || 0;
        
        // 旋转
        this.rotation = options.rotation || 0;
        this.rotationSpeed = options.rotationSpeed || 0;
        
        // 阻力
        this.drag = options.drag || 0;
        
        // 重力
        this.gravity = options.gravity || new THREE.Vector3(0, -9.8, 0);
        
        // 是否活跃
        this.active = true;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // 更新生命周期
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.active = false;
            return;
        }
        
        // 计算生命周期进度
        const progress = 1 - (this.life / this.maxLife);
        
        // 应用重力
        this.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));
        
        // 应用加速度
        this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
        
        // 应用阻力
        if (this.drag > 0) {
            this.velocity.multiplyScalar(1 - this.drag * deltaTime);
        }
        
        // 更新位置
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // 更新旋转
        this.rotation += this.rotationSpeed * deltaTime;
        
        // 更新大小
        this.size = THREE.MathUtils.lerp(this.startSize, this.endSize, progress);
        
        // 更新颜色
        this.color.copy(this.startColor).lerp(this.endColor, progress);
        
        // 更新透明度
        this.opacity = THREE.MathUtils.lerp(this.startOpacity, this.endOpacity, progress);
    }
    
    reset(options = {}) {
        // 重置所有属性
        Object.assign(this, new Particle(options));
        this.active = true;
    }
}

export default Particle;
