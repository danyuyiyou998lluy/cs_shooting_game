// 游戏配置

const GameConfig = {
    // 世界设置
    world: {
        size: 50, // 世界大小
        gravity: 9.8, // 重力加速度
        groundFriction: 0.8 // 地面摩擦系数
    },
    
    // 玩家设置
    player: {
        health: 100, // 初始生命值
        armor: 0, // 初始护甲值
        maxArmor: 100, // 最大护甲值
        speed: 10, // 移动速度
        jumpForce: 15, // 跳跃力度
        height: 1.8, // 玩家高度
        radius: 0.5, // 玩家碰撞半径
        respawnTime: 3, // 重生时间（秒）
        damageMultiplier: 1.0 // 伤害倍数
    },
    
    // 武器设置
    weapons: {
        // 手枪
        pistol: {
            name: "手枪",
            damage: 25,
            fireRate: 0.5, // 每秒射击次数
            reloadTime: 1.5, // 装弹时间（秒）
            magazineSize: 12, // 弹匣容量
            maxAmmo: 48, // 最大备用弹药
            recoil: 0.02, // 后坐力
            accuracy: 0.95, // 精准度
            range: 30, // 有效射程
            bulletSpeed: 50, // 子弹速度
            automatic: false // 是否全自动
        },
        
        // 步枪
        rifle: {
            name: "步枪",
            damage: 30,
            fireRate: 8, // 每秒射击次数
            reloadTime: 2.5, // 装弹时间（秒）
            magazineSize: 30, // 弹匣容量
            maxAmmo: 90, // 最大备用弹药
            recoil: 0.05, // 后坐力
            accuracy: 0.9, // 精准度
            range: 50, // 有效射程
            bulletSpeed: 70, // 子弹速度
            automatic: true // 是否全自动
        },
        
        // 狙击枪
        sniper: {
            name: "狙击枪",
            damage: 100,
            fireRate: 1, // 每秒射击次数
            reloadTime: 3.5, // 装弹时间（秒）
            magazineSize: 5, // 弹匣容量
            maxAmmo: 20, // 最大备用弹药
            recoil: 0.1, // 后坐力
            accuracy: 0.99, // 精准度
            range: 100, // 有效射程
            bulletSpeed: 100, // 子弹速度
            automatic: false, // 是否全自动
            scopeZoom: 4 // 瞄准镜放大倍数
        },
        
        // 霰弹枪
        shotgun: {
            name: "霰弹枪",
            damage: 20, // 每颗弹丸伤害
            pellets: 8, // 弹丸数量
            fireRate: 1, // 每秒射击次数
            reloadTime: 0.5, // 单发装弹时间（秒）
            magazineSize: 8, // 弹匣容量
            maxAmmo: 32, // 最大备用弹药
            recoil: 0.15, // 后坐力
            accuracy: 0.7, // 精准度
            range: 15, // 有效射程
            bulletSpeed: 40, // 子弹速度
            automatic: false, // 是否全自动
            spreadAngle: 0.1 // 散布角度
        }
    },
    
    // 手榴弹设置
    grenades: {
        fragGrenade: {
            damage: 100, // 最大伤害
            radius: 8, // 爆炸半径
            throwForce: 15, // 投掷力度
            fuseTime: 3, // 引信时间（秒）
            maxCount: 3 // 最大携带数量
        },
        
        smokeGrenade: {
            radius: 10, // 烟雾半径
            duration: 10, // 持续时间（秒）
            throwForce: 15, // 投掷力度
            fuseTime: 1, // 引信时间（秒）
            maxCount: 2 // 最大携带数量
        },
        
        flashbang: {
            radius: 15, // 闪光半径
            duration: 5, // 致盲持续时间（秒）
            throwForce: 15, // 投掷力度
            fuseTime: 1.5, // 引信时间（秒）
            maxCount: 2 // 最大携带数量
        }
    },
    
    // 敌人设置
    enemies: {
        // 普通敌人
        regular: {
            health: 100,
            damage: 10,
            fireRate: 1,
            speed: 5,
            accuracy: 0.7,
            detectionRange: 30,
            attackRange: 20,
            scoreValue: 100
        },
        
        // 重装敌人
        heavy: {
            health: 200,
            damage: 20,
            fireRate: 0.5,
            speed: 3,
            accuracy: 0.6,
            detectionRange: 25,
            attackRange: 15,
            scoreValue: 200
        },
        
        // 狙击手敌人
        sniper: {
            health: 80,
            damage: 50,
            fireRate: 0.3,
            speed: 4,
            accuracy: 0.9,
            detectionRange: 50,
            attackRange: 40,
            scoreValue: 150
        }
    },
    
    // 游戏模式设置
    gameModes: {
        // 生存模式
        survival: {
            initialEnemyCount: 5,
            enemyIncreasePerWave: 2,
            waveInterval: 30, // 波次间隔（秒）
            maxWaves: 10,
            healthPackFrequency: 3 // 每X波次生成一次医疗包
        },
        
        // 任务模式
        mission: {
            timeLimit: 300, // 时间限制（秒）
            objectives: [
                { type: 'kill', target: 'regular', count: 10 },
                { type: 'kill', target: 'heavy', count: 5 },
                { type: 'kill', target: 'sniper', count: 3 },
                { type: 'collect', item: 'intel', count: 3 }
            ]
        },
        
        // 时间挑战
        timeChallenge: {
            duration: 180, // 持续时间（秒）
            targetScore: 2000 // 目标分数
        }
    },
    
    // 难度设置
    difficulty: {
        easy: {
            enemyHealthMultiplier: 0.8,
            enemyDamageMultiplier: 0.7,
            enemySpeedMultiplier: 0.8,
            enemyAccuracyMultiplier: 0.7,
            playerDamageMultiplier: 1.2
        },
        
        normal: {
            enemyHealthMultiplier: 1.0,
            enemyDamageMultiplier: 1.0,
            enemySpeedMultiplier: 1.0,
            enemyAccuracyMultiplier: 1.0,
            playerDamageMultiplier: 1.0
        },
        
        hard: {
            enemyHealthMultiplier: 1.2,
            enemyDamageMultiplier: 1.3,
            enemySpeedMultiplier: 1.2,
            enemyAccuracyMultiplier: 1.3,
            playerDamageMultiplier: 0.8
        }
    },
    
    // 音效设置
    sound: {
        masterVolume: 1.0,
        musicVolume: 0.7,
        sfxVolume: 1.0,
        voiceVolume: 0.8
    },
    
    // 图形设置
    graphics: {
        shadowQuality: 'high', // high, medium, low, off
        textureQuality: 'high', // high, medium, low
        effectsQuality: 'high', // high, medium, low
        drawDistance: 100,
        fov: 75 // 视场角
    }
};

// 导出配置
window.GameConfig = GameConfig;
