import * as THREE from 'three';
import { weapons } from '../config/weapons.js';

class Weapon {
    constructor(type, soundManager) {
        this.type = type;
        this.config = weapons[type];
        this.soundManager = soundManager;
        
        // 武器状态
        this.ammo = this.config.magazineSize;
        this.lastShotTime = 0;
        this.isReloading = false;
        this.reloadStartTime = 0;
        
        // 创建武器模型
        this.createModel();
        
        // 调试信息
        console.log(`Weapon ${type} initialized with config:`, this.config);
    }
    
    createModel() {
        const modelConfig = this.config.model;
        
        // 创建武器主体 - 使用更明显的几何体
        const geometry = new THREE.BoxGeometry(
            modelConfig.size.x * 1.5,
            modelConfig.size.y * 1.5,
            modelConfig.size.z * 1.5
        );
        
        // 使用更明亮的材质
        const material = new THREE.MeshStandardMaterial({ 
            color: modelConfig.color,
            roughness: 0.3,
            metalness: 0.7,
            emissive: new THREE.Color(modelConfig.color).multiplyScalar(0.2) // 添加自发光
        });
        
        this.model = new THREE.Mesh(geometry, material);
        
        // 创建枪管 - 使用更明显的几何体
        const barrelGeometry = new THREE.CylinderGeometry(
            modelConfig.barrel.radius * 1.5,
            modelConfig.barrel.radius * 1.5,
            modelConfig.barrel.length * 1.5,
            8
        );
        
        // 使用更明亮的材质
        const barrelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.3,
            metalness: 0.8,
            emissive: new THREE.Color(0x111111) // 添加自发光
        });
        
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        
        // 旋转并定位枪管
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = (modelConfig.size.z * 1.5) / 2 + (modelConfig.barrel.length * 1.5) / 2;
        
        // 将枪管添加到武器模型
        this.model.add(barrel);
        
        // 调整武器整体的位置和旋转
        this.model.position.set(0, 0, 0);
        this.model.rotation.set(0, 0, 0);
        
        // 确保模型可见性
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        
        // 添加辅助几何体，帮助调试
        const boxHelper = new THREE.BoxHelper(this.model, 0xffff00);
        this.model.add(boxHelper);
        
        // 添加坐标轴辅助
        const axesHelper = new THREE.AxesHelper(0.5);
        this.model.add(axesHelper);
        
        // 调试信息
        console.log(`Weapon model created for ${this.type}:`, this.model);
        console.log(`Model geometry:`, geometry);
        console.log(`Model material:`, material);
    }
    
    canShoot() {
        if (this.isReloading) return false;
        if (this.ammo <= 0) {
            // 播放弹药耗尽音效
            if (this.soundManager) {
                this.soundManager.playEmptySound();
            }
            return false;
        }
        
        const now = performance.now() / 1000; // 转换为秒
        const timeSinceLastShot = now - this.lastShotTime;
        return timeSinceLastShot >= (1 / this.config.fireRate);
    }
    
    shoot(camera) {
        if (!this.canShoot()) return null;
        
        this.ammo--;
        this.lastShotTime = performance.now() / 1000;
        
        // 播放射击音效
        if (this.soundManager) {
            this.soundManager.playWeaponSound(this.type);
        }
        
        // 计算射击方向（包含散布）
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        
        // 添加随机散布
        const spread = this.config.spread;
        direction.x += (Math.random() - 0.5) * spread;
        direction.y += (Math.random() - 0.5) * spread;
        direction.z += (Math.random() - 0.5) * spread;
        direction.normalize();
        
        // 如果是霰弹枪，返回多个射击方向
        if (this.type === 'shotgun') {
            const directions = [];
            for (let i = 0; i < this.config.pellets; i++) {
                const pelletDir = direction.clone();
                pelletDir.x += (Math.random() - 0.5) * spread * 2;
                pelletDir.y += (Math.random() - 0.5) * spread * 2;
                pelletDir.z += (Math.random() - 0.5) * spread * 2;
                pelletDir.normalize();
                directions.push({
                    direction: pelletDir,
                    damage: this.config.damage
                });
            }
            return directions;
        }
        
        // 返回单个射击方向
        return [{
            direction: direction,
            damage: this.config.damage
        }];
    }
    
    reload() {
        if (this.isReloading || this.ammo === this.config.magazineSize) return;
        
        this.isReloading = true;
        this.reloadStartTime = performance.now() / 1000;
        
        // 播放装弹音效
        if (this.soundManager) {
            this.soundManager.playReloadSound();
        }
        
        // 设置定时器来完成装弹
        setTimeout(() => {
            this.isReloading = false;
            this.ammo = this.config.magazineSize;
        }, this.config.reloadTime * 1000);
    }
    
    update() {
        if (this.isReloading) {
            const now = performance.now() / 1000;
            const reloadProgress = (now - this.reloadStartTime) / this.config.reloadTime;
            
            // 如果装弹完成
            if (reloadProgress >= 1) {
                this.isReloading = false;
                this.ammo = this.config.magazineSize;
            }
        }
    }
}

export default Weapon;
