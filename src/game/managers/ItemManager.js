// 物品管理器类

class ItemManager {
    constructor(scene, world) {
        // 保存场景和世界引用
        this.scene = scene;
        this.world = world;
        
        // 物品列表
        this.items = [];
        
        // 物品生成概率
        this.spawnChances = {
            healthPack: 0.4,
            armorPack: 0.3,
            ammoPack: 0.5,
            grenadePack: 0.2
        };
        
        // 物品生成间隔（秒）
        this.spawnInterval = 30;
        this.timeSinceLastSpawn = 0;
        
        // 最大物品数量
        this.maxItems = 10;
        
        // 将实例保存到全局，以便其他类可以访问
        window.itemManager = this;
        
        // 监听游戏状态事件
        if (window.gameStateManager) {
            // 监听波次完成事件
            window.gameStateManager.addEventListener('waveCompleted', () => {
                this.spawnRandomItems(2); // 每波次结束生成2个随机物品
            });
            
            // 监听生成医疗包事件
            window.gameStateManager.addEventListener('spawnHealthPack', () => {
                this.spawnItem('healthPack', this.getRandomPosition());
            });
        }
    }
    
    // 生成物品
    spawnItem(type, position) {
        // 检查是否达到最大物品数量
        if (this.items.length >= this.maxItems) {
            // 移除最旧的物品
            const oldestItem = this.items.shift();
            oldestItem.remove(this.scene);
        }
        
        // 创建物品
        const item = new Item(type, position);
        
        // 创建物品网格
        item.createMesh(this.scene);
        
        // 添加到物品列表
        this.items.push(item);
        
        return item;
    }
    
    // 生成随机物品
    spawnRandomItems(count = 1) {
        for (let i = 0; i < count; i++) {
            // 随机选择物品类型
            const type = this.getRandomItemType();
            
            // 随机位置
            const position = this.getRandomPosition();
            
            // 生成物品
            this.spawnItem(type, position);
        }
    }
    
    // 获取随机物品类型
    getRandomItemType() {
        // 根据概率选择物品类型
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const [type, chance] of Object.entries(this.spawnChances)) {
            cumulativeProbability += chance;
            
            if (rand <= cumulativeProbability) {
                return type;
            }
        }
        
        // 默认返回弹药包
        return 'ammoPack';
    }
    
    // 获取随机位置
    getRandomPosition() {
        // 获取世界大小
        const worldSize = GameConfig.world.size;
        
        // 随机X和Z坐标（在世界范围内）
        const x = (Math.random() * 2 - 1) * (worldSize - 2);
        const z = (Math.random() * 2 - 1) * (worldSize - 2);
        
        // Y坐标固定在地面上方
        const y = 0.5;
        
        return new THREE.Vector3(x, y, z);
    }
    
    // 更新
    update(deltaTime) {
        // 更新所有物品
        this.items.forEach(item => {
            item.update(deltaTime);
        });
        
        // 更新生成计时器
        this.timeSinceLastSpawn += deltaTime;
        
        // 检查是否到达生成间隔
        if (this.timeSinceLastSpawn >= this.spawnInterval) {
            // 重置计时器
            this.timeSinceLastSpawn = 0;
            
            // 生成随机物品
            this.spawnRandomItems();
        }
    }
    
    // 检查与玩家的碰撞
    checkPlayerCollisions(player) {
        const collectedItems = [];
        
        // 检查所有物品
        this.items.forEach(item => {
            if (item.checkPlayerCollision(player)) {
                // 收集物品
                const itemInfo = item.collect();
                collectedItems.push(itemInfo);
                
                // 应用物品效果
                this.applyItemEffect(player, itemInfo);
            }
        });
        
        // 移除已收集的物品
        const inactiveItems = this.items.filter(item => !item.isActive);
        inactiveItems.forEach(item => {
            item.remove(this.scene);
        });
        
        // 更新物品列表
        this.items = this.items.filter(item => item.isActive);
        
        return collectedItems;
    }
    
    // 应用物品效果
    applyItemEffect(player, itemInfo) {
        switch (itemInfo.type) {
            case 'healthPack':
                // 恢复生命值
                player.heal(itemInfo.value);
                break;
                
            case 'armorPack':
                // 恢复护甲值
                player.addArmor(itemInfo.value);
                break;
                
            case 'ammoPack':
                // 为当前武器添加弹药
                if (window.weaponManager && window.weaponManager.currentWeaponType) {
                    window.weaponManager.addAmmo(
                        window.weaponManager.currentWeaponType,
                        itemInfo.value
                    );
                }
                break;
                
            case 'grenadePack':
                // 添加手榴弹
                player.addGrenades(itemInfo.value);
                break;
                
            case 'intel':
                // 增加分数
                if (window.gameStateManager) {
                    window.gameStateManager.addScore(itemInfo.value);
                }
                
                // 更新任务目标
                if (window.gameStateManager && 
                    window.gameStateManager.gameMode === 'mission') {
                    window.gameStateManager.updateMissionObjective('collect', 'intel');
                }
                break;
        }
    }
    
    // 生成特定位置的物品
    spawnItemAt(type, x, y, z) {
        const position = new THREE.Vector3(x, y, z);
        return this.spawnItem(type, position);
    }
    
    // 清理所有物品
    clear() {
        // 移除所有物品
        this.items.forEach(item => {
            item.remove(this.scene);
        });
        
        // 清空物品列表
        this.items = [];
    }
}
