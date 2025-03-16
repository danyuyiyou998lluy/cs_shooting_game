import * as THREE from 'three';
import ParticleSystem from './ParticleSystem';

class EffectManager {
    constructor(scene) {
        this.scene = scene;
        
        // 创建粒子系统
        this.particleSystem = new ParticleSystem(scene, {
            maxParticles: 5000 // 最大粒子数量
        });
        
        // 创建临时向量，用于复用
        this._tempVector = new THREE.Vector3();
        this._tempNormal = new THREE.Vector3();
        
        // 保存活跃的效果
        this.activeEffects = new Set();
    }
    
    // 更新所有效果
    update(deltaTime) {
        // 更新粒子系统
        this.particleSystem.update(deltaTime);
    }
    
    // 创建爆炸效果
    createExplosion(position, radius = 1, intensity = 1) {
        this.particleSystem.createExplosion(position, {
            count: Math.floor(50 * intensity),
            spread: radius,
            velocity: new THREE.Vector3(0, 2 * intensity, 0),
            size: 0.5 * intensity,
            life: 1 * intensity
        });
        
        // 添加额外的烟雾效果
        this.particleSystem.createSmoke(position, {
            count: Math.floor(30 * intensity),
            spread: radius * 0.8,
            velocity: new THREE.Vector3(0, 1.5 * intensity, 0),
            size: radius * 0.8,
            life: 2 * intensity
        });
    }
    
    // 创建枪口火焰效果
    createMuzzleFlash(position, direction) {
        this._tempVector.copy(direction).normalize();
        
        this.particleSystem.createMuzzleFlash(position, this._tempVector);
        
        // 添加额外的烟雾效果
        this.particleSystem.createSmoke(position, {
            count: 5,
            spread: 0.1,
            velocity: this._tempVector.clone().multiplyScalar(2),
            size: 0.2,
            life: 0.3
        });
    }
    
    // 创建击中效果
    createHitEffect(position, normal, type = 'default') {
        this._tempNormal.copy(normal).normalize();
        
        switch (type) {
            case 'metal':
                // 金属击中效果
                this.particleSystem.emit({
                    position: position,
                    count: 20,
                    spread: 0.5,
                    velocity: this._tempNormal.clone().multiplyScalar(5),
                    color: new THREE.Color(1, 0.8, 0.2),
                    endColor: new THREE.Color(1, 0.5, 0),
                    size: 0.1,
                    endSize: 0.05,
                    life: 0.3,
                    opacity: 1,
                    endOpacity: 0
                });
                break;
                
            case 'wood':
                // 木材击中效果
                this.particleSystem.emit({
                    position: position,
                    count: 30,
                    spread: 0.7,
                    velocity: this._tempNormal.clone().multiplyScalar(3),
                    color: new THREE.Color(0.6, 0.3, 0),
                    endColor: new THREE.Color(0.4, 0.2, 0),
                    size: 0.15,
                    endSize: 0.05,
                    life: 0.5,
                    opacity: 1,
                    endOpacity: 0
                });
                break;
                
            case 'flesh':
                // 血液效果
                this.particleSystem.createBloodSplatter(position, this._tempNormal);
                break;
                
            default:
                // 默认击中效果
                this.particleSystem.emit({
                    position: position,
                    count: 15,
                    spread: 0.3,
                    velocity: this._tempNormal.clone().multiplyScalar(4),
                    color: new THREE.Color(0.8, 0.8, 0.8),
                    endColor: new THREE.Color(0.5, 0.5, 0.5),
                    size: 0.1,
                    endSize: 0.05,
                    life: 0.4,
                    opacity: 1,
                    endOpacity: 0
                });
                break;
        }
    }
    
    // 创建脚步效果
    createFootstepEffect(position, type = 'default') {
        switch (type) {
            case 'dirt':
                // 泥土脚步效果
                this.particleSystem.createFootstepDust(position, {
                    color: new THREE.Color(0.4, 0.3, 0.2),
                    endColor: new THREE.Color(0.3, 0.2, 0.1)
                });
                break;
                
            case 'water':
                // 水花效果
                this.particleSystem.emit({
                    position: position,
                    count: 15,
                    spread: 0.2,
                    velocity: new THREE.Vector3(0, 2, 0),
                    color: new THREE.Color(0.7, 0.7, 1),
                    endColor: new THREE.Color(0.5, 0.5, 0.8),
                    size: 0.1,
                    endSize: 0.05,
                    life: 0.4,
                    opacity: 0.7,
                    endOpacity: 0
                });
                break;
                
            default:
                // 默认脚步效果
                this.particleSystem.createFootstepDust(position);
                break;
        }
    }
    
    // 创建子弹轨迹效果
    createBulletTrail(start, end) {
        this.particleSystem.createBulletTrail(start, end);
    }
    
    // 创建受伤效果
    createDamageEffect(position, intensity = 1) {
        // 血液喷溅
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            this._tempNormal.set(
                Math.cos(angle),
                Math.random() * 0.5 + 0.5,
                Math.sin(angle)
            ).normalize();
            
            this.particleSystem.createBloodSplatter(position, this._tempNormal, {
                count: Math.floor(20 * intensity),
                spread: 0.8 * intensity
            });
        }
    }
    
    // 创建治疗效果
    createHealEffect(position) {
        this.particleSystem.emit({
            position: position,
            count: 20,
            spread: 0.5,
            velocity: new THREE.Vector3(0, 2, 0),
            color: new THREE.Color(0, 1, 0),
            endColor: new THREE.Color(0.5, 1, 0.5),
            size: 0.2,
            endSize: 0.1,
            life: 1,
            opacity: 0.7,
            endOpacity: 0
        });
    }
    
    // 创建护甲效果
    createArmorEffect(position) {
        this.particleSystem.emit({
            position: position,
            count: 20,
            spread: 0.5,
            velocity: new THREE.Vector3(0, 2, 0),
            color: new THREE.Color(0, 0.7, 1),
            endColor: new THREE.Color(0, 0.5, 0.8),
            size: 0.2,
            endSize: 0.1,
            life: 1,
            opacity: 0.7,
            endOpacity: 0
        });
    }
    
    // 创建道具拾取效果
    createItemPickupEffect(position) {
        this.particleSystem.emit({
            position: position,
            count: 15,
            spread: 0.3,
            velocity: new THREE.Vector3(0, 3, 0),
            color: new THREE.Color(1, 1, 0),
            endColor: new THREE.Color(1, 0.8, 0),
            size: 0.2,
            endSize: 0.1,
            life: 0.5,
            opacity: 1,
            endOpacity: 0
        });
    }
    
    // 创建环境效果（如雨、雪等）
    createEnvironmentEffect(type, area) {
        switch (type) {
            case 'rain':
                // 创建雨滴效果
                setInterval(() => {
                    for (let i = 0; i < 10; i++) {
                        const x = (Math.random() - 0.5) * area.x;
                        const z = (Math.random() - 0.5) * area.z;
                        const position = new THREE.Vector3(x, area.y, z);
                        
                        this.particleSystem.emit({
                            position: position,
                            count: 1,
                            velocity: new THREE.Vector3(0, -10, 0),
                            color: new THREE.Color(0.7, 0.7, 1),
                            size: 0.1,
                            life: 1,
                            opacity: 0.5,
                            endOpacity: 0
                        });
                    }
                }, 100);
                break;
                
            case 'snow':
                // 创建雪花效果
                setInterval(() => {
                    for (let i = 0; i < 5; i++) {
                        const x = (Math.random() - 0.5) * area.x;
                        const z = (Math.random() - 0.5) * area.z;
                        const position = new THREE.Vector3(x, area.y, z);
                        
                        this.particleSystem.emit({
                            position: position,
                            count: 1,
                            velocity: new THREE.Vector3(
                                Math.random() - 0.5,
                                -2,
                                Math.random() - 0.5
                            ),
                            color: new THREE.Color(1, 1, 1),
                            size: 0.2,
                            life: 3,
                            opacity: 0.7,
                            endOpacity: 0,
                            rotationSpeed: Math.PI / 4
                        });
                    }
                }, 200);
                break;
        }
    }
    
    // 清理所有效果
    clearEffects() {
        this.activeEffects.clear();
    }
    
    // 销毁效果管理器
    dispose() {
        this.clearEffects();
        this.particleSystem.dispose();
    }
}

export default EffectManager;
