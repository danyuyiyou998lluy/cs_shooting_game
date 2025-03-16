// 游戏状态枚举
const GameState = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// 游戏状态管理器类
class GameStateManager {
    constructor() {
        // 当前游戏状态
        this.currentState = GameState.LOADING;
        
        // 游戏难度
        this.difficulty = 'normal';
        
        // 游戏模式
        this.gameMode = 'survival';
        
        // 游戏统计
        this.stats = {
            score: 0,
            kills: 0,
            headshots: 0,
            accuracy: 0,
            shotsFired: 0,
            shotsHit: 0,
            timePlayed: 0
        };
        
        // 游戏计时器
        this.gameTimer = 0;
        
        // 波次信息（生存模式）
        this.waveInfo = {
            currentWave: 0,
            enemiesRemaining: 0,
            nextWaveTime: 0
        };
        
        // 任务信息（任务模式）
        this.missionInfo = {
            objectives: [],
            timeRemaining: 0
        };
        
        // 时间挑战信息
        this.challengeInfo = {
            timeRemaining: 0,
            targetScore: 0
        };
        
        // 事件监听器
        this.eventListeners = {};
        
        // 将实例保存到全局，以便其他类可以访问
        window.gameStateManager = this;
        
        // 导出GameState到全局
        window.GameState = GameState;
    }
    
    // 设置游戏状态
    setState(state) {
        const previousState = this.currentState;
        this.currentState = state;
        
        // 触发状态变更事件
        this.triggerEvent('stateChanged', { 
            previousState, 
            currentState: state 
        });
        
        // 根据状态执行特定操作
        switch (state) {
            case GameState.PLAYING:
                // 如果从菜单或游戏结束状态进入游戏
                if (previousState === GameState.MENU || previousState === GameState.GAME_OVER) {
                    this.startGame();
                }
                // 如果从暂停状态恢复
                else if (previousState === GameState.PAUSED) {
                    this.resumeGame();
                }
                break;
                
            case GameState.PAUSED:
                this.pauseGame();
                break;
                
            case GameState.GAME_OVER:
                this.endGame();
                break;
        }
    }
    
    // 获取当前状态
    getState() {
        return this.currentState;
    }
    
    // 设置游戏难度
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        // 触发难度变更事件
        this.triggerEvent('difficultyChanged', { difficulty });
    }
    
    // 设置游戏模式
    setGameMode(mode) {
        this.gameMode = mode;
        
        // 触发模式变更事件
        this.triggerEvent('gameModeChanged', { mode });
    }
    
    // 开始游戏
    startGame() {
        // 重置游戏统计
        this.resetStats();
        
        // 重置游戏计时器
        this.gameTimer = 0;
        
        // 根据游戏模式初始化
        switch (this.gameMode) {
            case 'survival':
                this.initSurvivalMode();
                break;
                
            case 'mission':
                this.initMissionMode();
                break;
                
            case 'timeChallenge':
                this.initTimeChallengeMode();
                break;
        }
        
        // 触发游戏开始事件
        this.triggerEvent('gameStarted', { 
            difficulty: this.difficulty,
            gameMode: this.gameMode
        });
    }
    
    // 暂停游戏
    pauseGame() {
        // 触发游戏暂停事件
        this.triggerEvent('gamePaused');
    }
    
    // 恢复游戏
    resumeGame() {
        // 触发游戏恢复事件
        this.triggerEvent('gameResumed');
    }
    
    // 结束游戏
    endGame() {
        // 触发游戏结束事件
        this.triggerEvent('gameEnded', { stats: this.stats });
    }
    
    // 重置游戏统计
    resetStats() {
        this.stats = {
            score: 0,
            kills: 0,
            headshots: 0,
            accuracy: 0,
            shotsFired: 0,
            shotsHit: 0,
            timePlayed: 0
        };
    }
    
    // 初始化生存模式
    initSurvivalMode() {
        const config = GameConfig.gameModes.survival;
        
        this.waveInfo = {
            currentWave: 1,
            enemiesRemaining: config.initialEnemyCount,
            nextWaveTime: 0
        };
        
        // 触发波次开始事件
        this.triggerEvent('waveStarted', { 
            wave: this.waveInfo.currentWave,
            enemyCount: this.waveInfo.enemiesRemaining
        });
    }
    
    // 初始化任务模式
    initMissionMode() {
        const config = GameConfig.gameModes.mission;
        
        this.missionInfo = {
            objectives: [...config.objectives], // 复制目标数组
            timeRemaining: config.timeLimit
        };
        
        // 触发任务开始事件
        this.triggerEvent('missionStarted', { 
            objectives: this.missionInfo.objectives,
            timeLimit: this.missionInfo.timeRemaining
        });
    }
    
    // 初始化时间挑战模式
    initTimeChallengeMode() {
        const config = GameConfig.gameModes.timeChallenge;
        
        this.challengeInfo = {
            timeRemaining: config.duration,
            targetScore: config.targetScore
        };
        
        // 触发挑战开始事件
        this.triggerEvent('challengeStarted', { 
            duration: this.challengeInfo.timeRemaining,
            targetScore: this.challengeInfo.targetScore
        });
    }
    
    // 更新游戏状态
    update(deltaTime) {
        // 只有在游戏进行中才更新
        if (this.currentState !== GameState.PLAYING) {
            return;
        }
        
        // 更新游戏计时器
        this.gameTimer += deltaTime;
        this.stats.timePlayed = this.gameTimer;
        
        // 根据游戏模式更新
        switch (this.gameMode) {
            case 'survival':
                this.updateSurvivalMode(deltaTime);
                break;
                
            case 'mission':
                this.updateMissionMode(deltaTime);
                break;
                
            case 'timeChallenge':
                this.updateTimeChallengeMode(deltaTime);
                break;
        }
    }
    
    // 更新生存模式
    updateSurvivalMode(deltaTime) {
        // 检查是否所有敌人都被消灭
        if (this.waveInfo.enemiesRemaining <= 0) {
            // 更新下一波次时间
            this.waveInfo.nextWaveTime += deltaTime;
            
            // 检查是否到达下一波次
            if (this.waveInfo.nextWaveTime >= GameConfig.gameModes.survival.waveInterval) {
                this.startNextWave();
            }
        }
    }
    
    // 更新任务模式
    updateMissionMode(deltaTime) {
        // 更新剩余时间
        this.missionInfo.timeRemaining -= deltaTime;
        
        // 检查是否时间用尽
        if (this.missionInfo.timeRemaining <= 0) {
            // 检查是否完成所有目标
            const allCompleted = this.missionInfo.objectives.every(obj => obj.completed);
            
            if (allCompleted) {
                // 任务成功
                this.triggerEvent('missionCompleted');
            } else {
                // 任务失败
                this.triggerEvent('missionFailed');
                this.setState(GameState.GAME_OVER);
            }
        }
    }
    
    // 更新时间挑战模式
    updateTimeChallengeMode(deltaTime) {
        // 更新剩余时间
        this.challengeInfo.timeRemaining -= deltaTime;
        
        // 检查是否时间用尽
        if (this.challengeInfo.timeRemaining <= 0) {
            // 检查是否达到目标分数
            if (this.stats.score >= this.challengeInfo.targetScore) {
                // 挑战成功
                this.triggerEvent('challengeCompleted');
            } else {
                // 挑战失败
                this.triggerEvent('challengeFailed');
            }
            
            // 游戏结束
            this.setState(GameState.GAME_OVER);
        }
    }
    
    // 开始下一波次
    startNextWave() {
        // 增加波次
        this.waveInfo.currentWave++;
        
        // 计算敌人数量
        const config = GameConfig.gameModes.survival;
        const enemyCount = config.initialEnemyCount + (this.waveInfo.currentWave - 1) * config.enemyIncreasePerWave;
        
        // 更新波次信息
        this.waveInfo.enemiesRemaining = enemyCount;
        this.waveInfo.nextWaveTime = 0;
        
        // 触发波次开始事件
        this.triggerEvent('waveStarted', { 
            wave: this.waveInfo.currentWave,
            enemyCount: this.waveInfo.enemiesRemaining
        });
        
        // 检查是否需要生成医疗包
        if (this.waveInfo.currentWave % config.healthPackFrequency === 0) {
            this.triggerEvent('spawnHealthPack');
        }
        
        // 检查是否达到最大波次
        if (config.maxWaves && this.waveInfo.currentWave >= config.maxWaves) {
            // 触发最终波次事件
            this.triggerEvent('finalWave');
        }
    }
    
    // 敌人被击杀
    enemyKilled(enemyType, isHeadshot) {
        // 更新统计
        this.stats.kills++;
        
        if (isHeadshot) {
            this.stats.headshots++;
        }
        
        // 根据敌人类型增加分数
        const scoreValue = GameConfig.enemies[enemyType].scoreValue;
        this.addScore(scoreValue * (isHeadshot ? 2 : 1));
        
        // 更新生存模式敌人数量
        if (this.gameMode === 'survival') {
            this.waveInfo.enemiesRemaining--;
            
            // 检查是否清除所有敌人
            if (this.waveInfo.enemiesRemaining <= 0) {
                // 触发波次完成事件
                this.triggerEvent('waveCompleted', { 
                    wave: this.waveInfo.currentWave
                });
            }
        }
        
        // 更新任务模式目标
        if (this.gameMode === 'mission') {
            this.updateMissionObjective('kill', enemyType);
        }
    }
    
    // 更新任务目标
    updateMissionObjective(type, target, count = 1) {
        // 查找匹配的目标
        const objective = this.missionInfo.objectives.find(obj => 
            obj.type === type && obj.target === target && !obj.completed
        );
        
        if (objective) {
            // 如果没有当前进度，初始化为0
            if (objective.progress === undefined) {
                objective.progress = 0;
            }
            
            // 更新进度
            objective.progress += count;
            
            // 检查是否完成
            if (objective.progress >= objective.count) {
                objective.completed = true;
                
                // 触发目标完成事件
                this.triggerEvent('objectiveCompleted', { objective });
                
                // 检查是否所有目标都完成
                const allCompleted = this.missionInfo.objectives.every(obj => obj.completed);
                
                if (allCompleted) {
                    // 触发任务完成事件
                    this.triggerEvent('missionCompleted');
                    
                    // 游戏胜利
                    this.triggerEvent('gameWon');
                    
                    // 延迟设置游戏结束状态
                    setTimeout(() => {
                        this.setState(GameState.GAME_OVER);
                    }, 3000);
                }
            }
        }
    }
    
    // 添加分数
    addScore(points) {
        this.stats.score += points;
        
        // 触发分数变更事件
        this.triggerEvent('scoreChanged', { 
            score: this.stats.score,
            added: points
        });
        
        // 检查时间挑战模式是否达到目标
        if (this.gameMode === 'timeChallenge' && 
            this.stats.score >= this.challengeInfo.targetScore) {
            // 触发挑战完成事件
            this.triggerEvent('challengeCompleted');
            
            // 游戏胜利
            this.triggerEvent('gameWon');
            
            // 延迟设置游戏结束状态
            setTimeout(() => {
                this.setState(GameState.GAME_OVER);
            }, 3000);
        }
    }
    
    // 记录射击
    recordShot(hit) {
        this.stats.shotsFired++;
        
        if (hit) {
            this.stats.shotsHit++;
        }
        
        // 更新命中率
        this.stats.accuracy = this.stats.shotsFired > 0 
            ? this.stats.shotsHit / this.stats.shotsFired 
            : 0;
    }
    
    // 添加事件监听器
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        
        this.eventListeners[event].push(callback);
    }
    
    // 移除事件监听器
    removeEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            return;
        }
        
        this.eventListeners[event] = this.eventListeners[event]
            .filter(cb => cb !== callback);
    }
    
    // 触发事件
    triggerEvent(event, data) {
        if (!this.eventListeners[event]) {
            return;
        }
        
        for (const callback of this.eventListeners[event]) {
            callback(data);
        }
    }
}
