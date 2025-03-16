// 物品类

class Item {
    constructor(type, position) {
        // 物品类型
        this.type = type;
        
        // 物品位置
        this.position = position.clone();
        
        // 物品状态
        this.isActive = true;
        
        // 物品网格
        this.mesh = null;
        
        // 旋转速度
        this.rotationSpeed = 1;
        
        // 浮动参数
        this.floatHeight = 0.5;
        this.floatSpeed = 1.5;
        this.initialY = position.y;
        this.floatTime = Math.random() * Math.PI * 2; // 随机初始相位
        
        // 根据类型设置属性
        this.setPropertiesByType();
    }
    
    // 根据类型设置属性
    setPropertiesByType() {
        switch (this.type) {
            case 'healthPack':
                this.value = 50; // 恢复50点生命值
                this.color = 0xff0000; // 红色
                this.scale = 0.3;
                break;
                
            case 'armorPack':
                this.value = 50; // 恢复50点护甲值
                this.color = 0x0000ff; // 蓝色
                this.scale = 0.3;
                break;
                
            case 'ammoPack':
                this.value = 30; // 恢复30发弹药
                this.color = 0xffff00; // 黄色
                this.scale = 0.3;
                break;
                
            case 'grenadePack':
                this.value = 2; // 获得2个手榴弹
                this.color = 0x00ff00; // 绿色
                this.scale = 0.25;
                break;
                
            case 'intel':
                this.value = 500; // 获得500分
                this.color = 0xffffff; // 白色
                this.scale = 0.2;
                break;
                
            default:
                this.value = 0;
                this.color = 0xcccccc; // 灰色
                this.scale = 0.3;
        }
    }
    
    // 创建网格
    createMesh(scene) {
        // 根据物品类型创建不同的几何体
        let geometry;
        
        switch (this.type) {
            case 'healthPack':
                // 医疗包（十字形）
                geometry = this.createCrossGeometry();
                break;
                
            case 'armorPack':
                // 护甲包（盾牌形）
                geometry = new THREE.BoxGeometry(1, 1, 0.2);
                break;
                
            case 'ammoPack':
                // 弹药包（子弹形）
                geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
                break;
                
            case 'grenadePack':
                // 手榴弹包（球形）
                geometry = new THREE.SphereGeometry(0.5, 16, 16);
                break;
                
            case 'intel':
                // 情报（文件形）
                geometry = new THREE.BoxGeometry(0.8, 0.1, 1);
                break;
                
            default:
                // 默认（立方体）
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        // 创建材质
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            emissive: this.color,
            emissiveIntensity: 0.3,
            metalness: 0.7,
            roughness: 0.3
        });
        
        // 创建网格
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.scale.set(this.scale, this.scale, this.scale);
        
        // 添加到场景
        scene.add(this.mesh);
        
        // 添加光晕效果
        this.addGlow(scene);
    }
    
    // 创建十字形几何体（用于医疗包）
    createCrossGeometry() {
        // 创建组合几何体
        const geometry = new THREE.BufferGeometry();
        
        // 创建两个盒子几何体
        const box1 = new THREE.BoxGeometry(0.6, 0.2, 0.2);
        const box2 = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        
        // 获取顶点数据
        const box1Positions = box1.getAttribute('position').array;
        const box2Positions = box2.getAttribute('position').array;
        
        // 合并顶点
        const positions = new Float32Array(box1Positions.length + box2Positions.length);
        positions.set(box1Positions, 0);
        positions.set(box2Positions, box1Positions.length);
        
        // 设置属性
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        return geometry;
    }
    
    // 添加光晕效果
    addGlow(scene) {
        // 创建光晕几何体（略大于物品）
        const glowGeometry = new THREE.SphereGeometry(0.6 * this.scale, 16, 16);
        
        // 创建光晕材质
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        // 创建光晕网格
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glowMesh.position.copy(this.position);
        
        // 添加到场景
        scene.add(this.glowMesh);
    }
    
    // 更新
    update(deltaTime) {
        if (!this.isActive || !this.mesh) return;
        
        // 更新浮动时间
        this.floatTime += deltaTime * this.floatSpeed;
        
        // 计算新的Y坐标（浮动效果）
        const newY = this.initialY + Math.sin(this.floatTime) * this.floatHeight;
        
        // 更新位置
        this.position.y = newY;
        this.mesh.position.y = newY;
        
        if (this.glowMesh) {
            this.glowMesh.position.y = newY;
        }
        
        // 旋转物品
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;
    }
    
    // 检查与玩家的碰撞
    checkPlayerCollision(player) {
        if (!this.isActive) return false;
        
        // 计算与玩家的距离
        const distance = this.position.distanceTo(player.position);
        
        // 检查是否碰撞（考虑物品和玩家的大小）
        return distance < (0.5 * this.scale + player.radius);
    }
    
    // 收集物品
    collect() {
        this.isActive = false;
        
        // 播放收集音效
        if (window.soundManager) {
            window.soundManager.playSound('itemPickup');
        }
        
        return {
            type: this.type,
            value: this.value
        };
    }
    
    // 从场景中移除
    remove(scene) {
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        
        if (this.glowMesh) {
            scene.remove(this.glowMesh);
            this.glowMesh.geometry.dispose();
            this.glowMesh.material.dispose();
            this.glowMesh = null;
        }
    }
}
