import * as THREE from 'three';
import Weapon from '../entities/Weapon.js';
import { weapons } from '../config/weapons.js';
import SoundManager from './SoundManager.js';

class WeaponManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // 初始化音效管理器
        this.soundManager = new SoundManager();
        
        // 武器列表
        this.weapons = {};
        
        // 当前武器
        this.currentWeapon = null;
        
        // 武器容器（附加到相机）
        this.weaponContainer = new THREE.Object3D();
        this.camera.add(this.weaponContainer);
        
        // 调整武器容器的位置和旋转 - 修改位置使武器更加明显
        this.weaponContainer.position.set(0.3, -0.3, -0.7); // 右下方，更靠前
        this.weaponContainer.scale.set(2, 2, 2); // 放大武器容器
        this.weaponContainer.rotation.set(0, Math.PI / 12, 0); // 稍微倾斜
        
        // 添加灯光以确保武器可见
        const weaponLight = new THREE.PointLight(0xffffff, 1, 10);
        weaponLight.position.set(0, 0.5, -1);
        this.camera.add(weaponLight);
        
        // 初始化武器
        this.initWeapons();
        
        // 调试信息
        console.log('WeaponManager initialized');
        console.log('Weapons container:', this.weaponContainer);
        console.log('Weapons:', this.weapons);
    }
    
    initWeapons() {
        // 创建所有武器
        Object.keys(weapons).forEach(type => {
            const weapon = new Weapon(type, this.soundManager);
            this.weapons[type] = weapon;
            this.weaponContainer.add(weapon.model);
            weapon.model.visible = false;
            
            // 调试信息
            console.log(`Weapon ${type} created:`, weapon);
            console.log(`Weapon ${type} model:`, weapon.model);
            console.log(`Weapon ${type} parent:`, weapon.model.parent);
        });
        
        // 默认选择手枪
        this.selectWeapon('pistol');
        
        // 强制更新矩阵
        this.weaponContainer.updateMatrixWorld(true);
    }
    
    // 选择武器
    selectWeapon(type) {
        // 检查武器是否存在
        if (!this.weapons[type]) {
            console.error(`武器类型 ${type} 不存在`);
            return;
        }
        
        // 如果已经选择了该武器，则忽略
        if (this.currentWeapon === this.weapons[type]) {
            return;
        }
        
        // 隐藏当前武器
        if (this.currentWeapon) {
            this.currentWeapon.model.visible = false;
        }
        
        // 更新当前武器
        this.currentWeapon = this.weapons[type];
        this.currentWeapon.model.visible = true;
        
        // 调试信息
        console.log(`Selected weapon: ${type}`);
        console.log('Current weapon model:', this.currentWeapon.model);
        console.log('Model visible:', this.currentWeapon.model.visible);
        console.log('Model position:', this.currentWeapon.model.position);
        console.log('Model world position:', new THREE.Vector3().setFromMatrixPosition(this.currentWeapon.model.matrixWorld));
        
        // 播放武器切换音效
        this.soundManager.playReloadSound();
    }
    
    // 射击
    shoot() {
        // 如果没有当前武器，则不能射击
        if (!this.currentWeapon) {
            return null;
        }
        
        // 尝试射击
        return this.currentWeapon.shoot(this.camera);
    }
    
    // 装弹
    reload() {
        // 如果没有当前武器，则不能装弹
        if (!this.currentWeapon) {
            return false;
        }
        
        // 尝试装弹
        return this.currentWeapon.reload();
    }
    
    // 更新
    update(deltaTime) {
        // 更新当前武器
        if (this.currentWeapon) {
            this.currentWeapon.update(deltaTime);
        }
    }
    
    // 获取当前武器信息（用于HUD显示）
    getCurrentWeaponInfo() {
        if (!this.currentWeapon) return null;
        
        return {
            name: this.currentWeapon.config.name,
            ammo: this.currentWeapon.ammo,
            maxAmmo: this.currentWeapon.config.magazineSize,
            isReloading: this.currentWeapon.isReloading
        };
    }
}

export default WeaponManager;
