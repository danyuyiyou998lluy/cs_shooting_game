// 敌人AI行为系统

// 敌人状态枚举
const EnemyState = {
    IDLE: 'idle',         // 闲置状态
    PATROL: 'patrol',     // 巡逻状态
    CHASE: 'chase',       // 追击状态
    ATTACK: 'attack',     // 攻击状态
    SEARCH: 'search',     // 搜索状态
    RETREAT: 'retreat',   // 撤退状态
    TAKE_COVER: 'takeCover' // 寻找掩体状态
};

// 敌人AI类
class EnemyAI {
    constructor(enemy, world) {
        // 敌人和世界引用
        this.enemy = enemy;
        this.world = world;
        
        // 当前状态
        this.currentState = EnemyState.IDLE;
        
        // 目标（通常是玩家）
        this.target = null;
        
        // 上次看到目标的位置
        this.lastSeenTargetPosition = null;
        
        // 上次看到目标的时间
        this.lastSeenTargetTime = 0;
        
        // 记忆持续时间（秒）
        this.memoryDuration = 5;
        
        // 巡逻路径
        this.patrolPath = [];
        this.currentPatrolIndex = 0;
        this.patrolWaitTime = 0;
        
        // 搜索参数
        this.searchTime = 0;
        this.maxSearchTime = 10;
        this.searchPoints = [];
        this.currentSearchIndex = 0;
        
        // 攻击计时器
        this.attackTimer = 0;
        this.attackInterval = 1 / enemy.config.fireRate;
        
        // 决策计时器
        this.decisionTimer = 0;
        this.decisionInterval = 0.5; // 每0.5秒做一次决策
        
        // 掩体位置
        this.coverPosition = null;
        
        // 初始化
        this.initialize();
    }
    
    // 初始化
    initialize() {
        // 生成随机巡逻路径
        this.generatePatrolPath();
    }
    
    // 生成随机巡逻路径
    generatePatrolPath() {
        // 清空路径
        this.patrolPath = [];
        
        // 获取敌人初始位置
        const startPosition = this.enemy.position.clone();
        
        // 添加初始位置
        this.patrolPath.push(startPosition);
        
        // 生成3-5个随机路径点
        const pointCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < pointCount; i++) {
            // 在初始位置附近生成随机点
            const radius = 5 + Math.random() * 10;
            const angle = Math.random() * Math.PI * 2;
            
            const x = startPosition.x + Math.cos(angle) * radius;
            const z = startPosition.z + Math.sin(angle) * radius;
            
            // 确保在世界范围内
            const worldSize = GameConfig.world.size - 2;
            const clampedX = Math.max(-worldSize, Math.min(worldSize, x));
            const clampedZ = Math.max(-worldSize, Math.min(worldSize, z));
            
            // 添加到路径
            this.patrolPath.push(new THREE.Vector3(clampedX, 0, clampedZ));
        }
    }
    
    // 设置目标
    setTarget(target) {
        this.target = target;
    }
    
    // 更新AI
    update(deltaTime) {
        // 如果敌人不活动，则不更新
        if (!this.enemy.isAlive) return;
        
        // 更新决策计时器
        this.decisionTimer += deltaTime;
        
        // 每隔一段时间做决策
        if (this.decisionTimer >= this.decisionInterval) {
            this.makeDecision();
            this.decisionTimer = 0;
        }
        
        // 根据当前状态执行行为
        switch (this.currentState) {
            case EnemyState.IDLE:
                this.performIdleBehavior(deltaTime);
                break;
                
            case EnemyState.PATROL:
                this.performPatrolBehavior(deltaTime);
                break;
                
            case EnemyState.CHASE:
                this.performChaseBehavior(deltaTime);
                break;
                
            case EnemyState.ATTACK:
                this.performAttackBehavior(deltaTime);
                break;
                
            case EnemyState.SEARCH:
                this.performSearchBehavior(deltaTime);
                break;
                
            case EnemyState.RETREAT:
                this.performRetreatBehavior(deltaTime);
                break;
                
            case EnemyState.TAKE_COVER:
                this.performTakeCoverBehavior(deltaTime);
                break;
        }
    }
    
    // 做决策
    makeDecision() {
        // 检查是否有目标
        if (!this.target) {
            // 没有目标，进入巡逻状态
            this.changeState(EnemyState.PATROL);
            return;
        }
        
        // 检查是否可以看到目标
        const canSeeTarget = this.canSeeTarget();
        
        if (canSeeTarget) {
            // 更新上次看到目标的位置和时间
            this.lastSeenTargetPosition = this.target.position.clone();
            this.lastSeenTargetTime = performance.now() / 1000;
            
            // 计算与目标的距离
            const distanceToTarget = this.enemy.position.distanceTo(this.target.position);
            
            // 根据距离决定行为
            if (distanceToTarget <= this.enemy.config.attackRange) {
                // 在攻击范围内，进入攻击状态
                this.changeState(EnemyState.ATTACK);
            } else if (distanceToTarget <= this.enemy.config.detectionRange) {
                // 在检测范围内但超出攻击范围，进入追击状态
                this.changeState(EnemyState.CHASE);
            }
        } else {
            // 看不到目标
            
            // 检查是否记得目标位置
            const currentTime = performance.now() / 1000;
            const timeSinceLastSeen = currentTime - this.lastSeenTargetTime;
            
            if (this.lastSeenTargetPosition && timeSinceLastSeen < this.memoryDuration) {
                // 还记得目标位置，进入搜索状态
                if (this.currentState !== EnemyState.SEARCH) {
                    this.changeState(EnemyState.SEARCH);
                }
            } else {
                // 忘记目标位置或从未见过目标
                
                // 如果当前是搜索状态且搜索时间未到，继续搜索
                if (this.currentState === EnemyState.SEARCH && this.searchTime < this.maxSearchTime) {
                    return;
                }
                
                // 否则，进入巡逻状态
                this.changeState(EnemyState.PATROL);
            }
        }
        
        // 检查生命值，决定是否撤退
        const healthPercentage = this.enemy.health / this.enemy.config.health;
        
        if (healthPercentage < 0.3) {
            // 生命值低，有一定概率撤退或寻找掩体
            const retreatChance = 1 - healthPercentage; // 生命值越低，撤退概率越高
            
            if (Math.random() < retreatChance) {
                if (Math.random() < 0.5) {
                    this.changeState(EnemyState.RETREAT);
                } else {
                    this.changeState(EnemyState.TAKE_COVER);
                }
            }
        }
    }
    
    // 改变状态
    changeState(newState) {
        // 如果状态没有变化，则不执行
        if (this.currentState === newState) return;
        
        // 退出当前状态
        this.exitState(this.currentState);
        
        // 更新状态
        this.currentState = newState;
        
        // 进入新状态
        this.enterState(newState);
    }
    
    // 进入状态
    enterState(state) {
        switch (state) {
            case EnemyState.IDLE:
                // 进入闲置状态
                break;
                
            case EnemyState.PATROL:
                // 进入巡逻状态
                this.currentPatrolIndex = 0;
                this.patrolWaitTime = 0;
                break;
                
            case EnemyState.CHASE:
                // 进入追击状态
                break;
                
            case EnemyState.ATTACK:
                // 进入攻击状态
                this.attackTimer = 0;
                break;
                
            case EnemyState.SEARCH:
                // 进入搜索状态
                this.searchTime = 0;
                this.generateSearchPoints();
                this.currentSearchIndex = 0;
                break;
                
            case EnemyState.RETREAT:
                // 进入撤退状态
                this.findRetreatPosition();
                break;
                
            case EnemyState.TAKE_COVER:
                // 进入寻找掩体状态
                this.findCoverPosition();
                break;
        }
    }
    
    // 退出状态
    exitState(state) {
        switch (state) {
            case EnemyState.SEARCH:
                // 清空搜索点
                this.searchPoints = [];
                break;
        }
    }
    
    // 执行闲置行为
    performIdleBehavior(deltaTime) {
        // 简单的闲置行为，随机旋转
        this.enemy.rotation.y += (Math.random() * 2 - 1) * 0.01;
    }
    
    // 执行巡逻行为
    performPatrolBehavior(deltaTime) {
        // 如果没有路径点，生成路径
        if (this.patrolPath.length === 0) {
            this.generatePatrolPath();
            return;
        }
        
        // 获取当前目标点
        const targetPoint = this.patrolPath[this.currentPatrolIndex];
        
        // 计算到目标点的距离
        const distanceToTarget = this.enemy.position.distanceTo(targetPoint);
        
        // 如果到达目标点
        if (distanceToTarget < 0.5) {
            // 增加等待时间
            this.patrolWaitTime += deltaTime;
            
            // 如果等待时间足够
            if (this.patrolWaitTime > 2) {
                // 重置等待时间
                this.patrolWaitTime = 0;
                
                // 移动到下一个路径点
                this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length;
            }
        } else {
            // 移动到目标点
            this.moveTowards(targetPoint, this.enemy.config.speed * 0.5, deltaTime);
        }
    }
    
    // 执行追击行为
    performChaseBehavior(deltaTime) {
        // 如果没有目标，返回巡逻状态
        if (!this.target) {
            this.changeState(EnemyState.PATROL);
            return;
        }
        
        // 移动到目标位置
        this.moveTowards(this.target.position, this.enemy.config.speed, deltaTime);
    }
    
    // 执行攻击行为
    performAttackBehavior(deltaTime) {
        // 如果没有目标，返回巡逻状态
        if (!this.target) {
            this.changeState(EnemyState.PATROL);
            return;
        }
        
        // 面向目标
        this.faceTarget();
        
        // 更新攻击计时器
        this.attackTimer += deltaTime;
        
        // 检查是否可以攻击
        if (this.attackTimer >= this.attackInterval) {
            // 重置计时器
            this.attackTimer = 0;
            
            // 执行攻击
            this.enemy.attack();
        }
    }
    
    // 执行搜索行为
    performSearchBehavior(deltaTime) {
        // 更新搜索时间
        this.searchTime += deltaTime;
        
        // 检查是否超过最大搜索时间
        if (this.searchTime >= this.maxSearchTime) {
            // 搜索结束，返回巡逻状态
            this.changeState(EnemyState.PATROL);
            return;
        }
        
        // 如果没有搜索点，生成搜索点
        if (this.searchPoints.length === 0) {
            this.generateSearchPoints();
            return;
        }
        
        // 获取当前搜索点
        const searchPoint = this.searchPoints[this.currentSearchIndex];
        
        // 计算到搜索点的距离
        const distanceToPoint = this.enemy.position.distanceTo(searchPoint);
        
        // 如果到达搜索点
        if (distanceToPoint < 0.5) {
            // 移动到下一个搜索点
            this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchPoints.length;
        } else {
            // 移动到搜索点
            this.moveTowards(searchPoint, this.enemy.config.speed * 0.7, deltaTime);
        }
    }
    
    // 执行撤退行为
    performRetreatBehavior(deltaTime) {
        // 如果没有目标，返回巡逻状态
        if (!this.target) {
            this.changeState(EnemyState.PATROL);
            return;
        }
        
        // 计算撤退方向（远离目标）
        const retreatDirection = new THREE.Vector3()
            .subVectors(this.enemy.position, this.target.position)
            .normalize();
        
        // 计算撤退目标位置
        const retreatDistance = 10;
        const retreatPosition = new THREE.Vector3()
            .addVectors(this.enemy.position, retreatDirection.multiplyScalar(retreatDistance));
        
        // 确保在世界范围内
        const worldSize = GameConfig.world.size - 2;
        retreatPosition.x = Math.max(-worldSize, Math.min(worldSize, retreatPosition.x));
        retreatPosition.z = Math.max(-worldSize, Math.min(worldSize, retreatPosition.z));
        
        // 移动到撤退位置
        this.moveTowards(retreatPosition, this.enemy.config.speed * 1.2, deltaTime);
        
        // 检查是否撤退足够远
        const distanceToTarget = this.enemy.position.distanceTo(this.target.position);
        
        if (distanceToTarget > this.enemy.config.detectionRange * 0.8) {
            // 撤退足够远，返回巡逻状态
            this.changeState(EnemyState.PATROL);
        }
    }
    
    // 执行寻找掩体行为
    performTakeCoverBehavior(deltaTime) {
        // 如果没有掩体位置，寻找掩体
        if (!this.coverPosition) {
            this.findCoverPosition();
            
            // 如果仍然没有找到掩体，返回撤退状态
            if (!this.coverPosition) {
                this.changeState(EnemyState.RETREAT);
                return;
            }
        }
        
        // 移动到掩体位置
        this.moveTowards(this.coverPosition, this.enemy.config.speed, deltaTime);
        
        // 检查是否到达掩体
        const distanceToCover = this.enemy.position.distanceTo(this.coverPosition);
        
        if (distanceToCover < 0.5) {
            // 到达掩体，面向目标
            if (this.target) {
                this.faceTarget();
            }
            
            // 检查生命值是否恢复
            const healthPercentage = this.enemy.health / this.enemy.config.health;
            
            if (healthPercentage > 0.5 || Math.random() < 0.01) {
                // 生命值恢复或随机决定离开掩体
                this.coverPosition = null;
                
                // 如果可以看到目标，进入攻击状态
                if (this.canSeeTarget()) {
                    this.changeState(EnemyState.ATTACK);
                } else {
                    this.changeState(EnemyState.PATROL);
                }
            }
        }
    }
    
    // 移动到指定位置
    moveTowards(targetPosition, speed, deltaTime) {
        // 计算方向
        const direction = new THREE.Vector3()
            .subVectors(targetPosition, this.enemy.position)
            .normalize();
        
        // 计算移动距离
        const moveDistance = speed * deltaTime;
        
        // 更新位置
        this.enemy.position.x += direction.x * moveDistance;
        this.enemy.position.z += direction.z * moveDistance;
        
        // 面向移动方向
        const targetRotation = Math.atan2(direction.x, direction.z);
        
        // 平滑旋转
        const rotationSpeed = 5 * deltaTime;
        const angleDiff = normalizeAngle(targetRotation - this.enemy.rotation.y);
        
        this.enemy.rotation.y += angleDiff * rotationSpeed;
    }
    
    // 面向目标
    faceTarget() {
        if (!this.target) return;
        
        // 计算方向
        const direction = new THREE.Vector3()
            .subVectors(this.target.position, this.enemy.position)
            .normalize();
        
        // 计算目标旋转
        const targetRotation = Math.atan2(direction.x, direction.z);
        
        // 设置旋转
        this.enemy.rotation.y = targetRotation;
    }
    
    // 检查是否可以看到目标
    canSeeTarget() {
        if (!this.target) return false;
        
        // 计算与目标的距离
        const distanceToTarget = this.enemy.position.distanceTo(this.target.position);
        
        // 检查是否在检测范围内
        if (distanceToTarget > this.enemy.config.detectionRange) {
            return false;
        }
        
        // 计算方向
        const direction = new THREE.Vector3()
            .subVectors(this.target.position, this.enemy.position)
            .normalize();
        
        // 计算敌人的前方向量
        const forward = new THREE.Vector3(0, 0, 1)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.enemy.rotation.y);
        
        // 计算夹角余弦值
        const dotProduct = forward.dot(direction);
        
        // 检查是否在视野范围内（约120度视野）
        const inFieldOfView = dotProduct > 0.5;
        
        if (!inFieldOfView) {
            return false;
        }
        
        // 射线检测，检查是否有障碍物遮挡
        const raycaster = new THREE.Raycaster(
            this.enemy.position.clone(),
            direction,
            0,
            distanceToTarget
        );
        
        // 获取场景中的所有障碍物
        const obstacles = this.world.getObstacles();
        
        // 检查射线是否与障碍物相交
        const intersects = raycaster.intersectObjects(obstacles);
        
        // 如果没有相交，则可以看到目标
        return intersects.length === 0;
    }
    
    // 生成搜索点
    generateSearchPoints() {
        // 清空搜索点
        this.searchPoints = [];
        
        // 如果没有上次看到目标的位置，使用敌人当前位置
        const center = this.lastSeenTargetPosition || this.enemy.position.clone();
        
        // 生成5-8个搜索点
        const pointCount = 5 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < pointCount; i++) {
            // 在中心点附近生成随机点
            const radius = 3 + Math.random() * 7;
            const angle = Math.random() * Math.PI * 2;
            
            const x = center.x + Math.cos(angle) * radius;
            const z = center.z + Math.sin(angle) * radius;
            
            // 确保在世界范围内
            const worldSize = GameConfig.world.size - 2;
            const clampedX = Math.max(-worldSize, Math.min(worldSize, x));
            const clampedZ = Math.max(-worldSize, Math.min(worldSize, z));
            
            // 添加到搜索点
            this.searchPoints.push(new THREE.Vector3(clampedX, 0, clampedZ));
        }
    }
    
    // 寻找撤退位置
    findRetreatPosition() {
        // 如果没有目标，使用随机方向
        if (!this.target) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 10;
            
            const x = this.enemy.position.x + Math.cos(angle) * distance;
            const z = this.enemy.position.z + Math.sin(angle) * distance;
            
            // 确保在世界范围内
            const worldSize = GameConfig.world.size - 2;
            const clampedX = Math.max(-worldSize, Math.min(worldSize, x));
            const clampedZ = Math.max(-worldSize, Math.min(worldSize, z));
            
            return new THREE.Vector3(clampedX, 0, clampedZ);
        }
        
        // 计算远离目标的方向
        const direction = new THREE.Vector3()
            .subVectors(this.enemy.position, this.target.position)
            .normalize();
        
        // 计算撤退距离
        const distance = 10 + Math.random() * 5;
        
        // 计算撤退位置
        const retreatPosition = new THREE.Vector3()
            .addVectors(this.enemy.position, direction.multiplyScalar(distance));
        
        // 确保在世界范围内
        const worldSize = GameConfig.world.size - 2;
        retreatPosition.x = Math.max(-worldSize, Math.min(worldSize, retreatPosition.x));
        retreatPosition.z = Math.max(-worldSize, Math.min(worldSize, retreatPosition.z));
        
        return retreatPosition;
    }
    
    // 寻找掩体位置
    findCoverPosition() {
        // 获取场景中的所有障碍物
        const obstacles = this.world.getObstacles();
        
        // 如果没有障碍物或没有目标，返回null
        if (obstacles.length === 0 || !this.target) {
            this.coverPosition = null;
            return;
        }
        
        // 计算与目标的方向
        const directionFromTarget = new THREE.Vector3()
            .subVectors(this.enemy.position, this.target.position)
            .normalize();
        
        // 最佳掩体位置和分数
        let bestCoverPosition = null;
        let bestCoverScore = -Infinity;
        
        // 检查每个障碍物
        for (const obstacle of obstacles) {
            // 获取障碍物的位置
            const obstaclePosition = obstacle.position.clone();
            
            // 计算障碍物与目标的方向
            const obstacleToTargetDirection = new THREE.Vector3()
                .subVectors(this.target.position, obstaclePosition)
                .normalize();
            
            // 计算障碍物的掩护方向（远离目标）
            const coverDirection = obstacleToTargetDirection.clone().negate();
            
            // 计算掩体位置（障碍物的另一侧）
            const coverDistance = obstacle.scale.x + 1; // 障碍物大小 + 额外距离
            const coverPosition = new THREE.Vector3()
                .addVectors(obstaclePosition, coverDirection.multiplyScalar(coverDistance));
            
            // 确保在世界范围内
            const worldSize = GameConfig.world.size - 2;
            coverPosition.x = Math.max(-worldSize, Math.min(worldSize, coverPosition.x));
            coverPosition.z = Math.max(-worldSize, Math.min(worldSize, coverPosition.z));
            
            // 计算掩体分数
            // 分数基于：1. 与敌人的距离（越近越好）
            //          2. 掩体效果（障碍物与目标的对齐程度）
            const distanceToEnemy = coverPosition.distanceTo(this.enemy.position);
            const coverEffect = Math.abs(coverDirection.dot(directionFromTarget)); // 1表示完美对齐
            
            // 综合分数（距离越近越好，掩体效果越好越好）
            const coverScore = coverEffect * 10 - distanceToEnemy;
            
            // 更新最佳掩体
            if (coverScore > bestCoverScore) {
                bestCoverScore = coverScore;
                bestCoverPosition = coverPosition;
            }
        }
        
        // 设置掩体位置
        this.coverPosition = bestCoverPosition;
    }
}

// 辅助函数：规范化角度到[-PI, PI]范围
function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}
