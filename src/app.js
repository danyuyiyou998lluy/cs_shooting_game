// 游戏主应用入口

// 游戏状态枚举
const GameState = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// 游戏配置
const GameConfig = {
    // 游戏难度设置
    difficulty: {
        easy: {
            enemySpeed: 0.03,
            enemySpawnRate: 3000,
            enemyHealth: 100,
            playerHealth: 150
        },
        normal: {
            enemySpeed: 0.05,
            enemySpawnRate: 2000,
            enemyHealth: 100,
            playerHealth: 100
        },
        hard: {
            enemySpeed: 0.07,
            enemySpawnRate: 1500,
            enemyHealth: 150,
            playerHealth: 80
        }
    },
    // 默认难度
    currentDifficulty: 'normal',
    
    // 武器设置
    weapons: {
        pistol: {
            name: '手枪',
            damage: 25,
            fireRate: 400,
            reloadTime: 1000,
            magazineSize: 12,
            maxAmmo: 60,
            automatic: false,
            recoil: 0.01,
            icon: '🔫'
        },
        rifle: {
            name: '步枪',
            damage: 20,
            fireRate: 100,
            reloadTime: 2000,
            magazineSize: 30,
            maxAmmo: 120,
            automatic: true,
            recoil: 0.02,
            icon: '🔫'
        },
        shotgun: {
            name: '霰弹枪',
            damage: 15,
            fireRate: 800,
            reloadTime: 2500,
            magazineSize: 8,
            maxAmmo: 32,
            automatic: false,
            recoil: 0.04,
            pellets: 8,
            spreadAngle: 0.2,
            icon: '🔫'
        }
    },
    
    // 游戏世界设置
    world: {
        size: 100,
        groundColor: 0x333333,
        skyColor: 0x87CEEB,
        fogColor: 0xCCCCCC,
        fogNear: 10,
        fogFar: 80
    }
};

// 游戏应用组件
class GameApp extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            gameState: GameState.LOADING,
            score: 0,
            loadingProgress: 0,
            playerHealth: 100,
            currentWeapon: 'rifle',
            ammo: {
                pistol: {
                    current: 12,
                    reserve: 60
                },
                rifle: {
                    current: 30,
                    reserve: 120
                },
                shotgun: {
                    current: 8,
                    reserve: 32
                }
            }
        };
        
        // 引用
        this.gameContainer = React.createRef();
        this.world = null;
        this.player = null;
        this.enemyManager = null;
        this.bulletManager = null;
        this.grenadeManager = null;
        this.soundManager = null;
        
        // 绑定方法
        this.startGame = this.startGame.bind(this);
        this.pauseGame = this.pauseGame.bind(this);
        this.resumeGame = this.resumeGame.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.updateScore = this.updateScore.bind(this);
        this.updatePlayerHealth = this.updatePlayerHealth.bind(this);
        this.updateAmmo = this.updateAmmo.bind(this);
        this.switchWeapon = this.switchWeapon.bind(this);
        this.simulateLoading = this.simulateLoading.bind(this);
    }
    
    componentDidMount() {
        // 模拟加载过程
        this.simulateLoading();
        
        // 初始化声音管理器
        this.soundManager = new SoundManager();
        
        // 监听键盘事件
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    componentWillUnmount() {
        // 移除事件监听
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        
        // 停止游戏循环
        if (this.world) {
            this.world.stop();
        }
    }
    
    // 模拟游戏资源加载
    simulateLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.setState({ gameState: GameState.MENU });
                }, 500);
            }
            this.setState({ loadingProgress: progress });
        }, 300);
    }
    
    // 开始游戏
    startGame(difficulty = 'normal') {
        // 设置难度
        GameConfig.currentDifficulty = difficulty;
        
        // 重置游戏状态
        this.setState({
            gameState: GameState.PLAYING,
            score: 0,
            playerHealth: GameConfig.difficulty[difficulty].playerHealth,
            currentWeapon: 'rifle',
            ammo: {
                pistol: {
                    current: 12,
                    reserve: 60
                },
                rifle: {
                    current: 30,
                    reserve: 120
                },
                shotgun: {
                    current: 8,
                    reserve: 32
                }
            }
        });
        
        // 初始化游戏世界
        this.initGame();
    }
    
    // 初始化游戏
    initGame() {
        // 创建游戏世界
        this.world = new World(this.gameContainer.current);
        
        // 创建玩家
        this.player = new Player(this.world.scene, this.world.camera);
        
        // 创建敌人管理器
        this.enemyManager = new EnemyManager(
            this.world.scene,
            GameConfig.difficulty[GameConfig.currentDifficulty].enemySpawnRate,
            GameConfig.difficulty[GameConfig.currentDifficulty].enemySpeed,
            GameConfig.difficulty[GameConfig.currentDifficulty].enemyHealth
        );
        
        // 创建子弹管理器
        this.bulletManager = new BulletManager(this.world.scene);
        
        // 创建手榴弹管理器
        this.grenadeManager = new GrenadeManager(this.world.scene);
        
        // 设置玩家武器
        this.player.setWeapon(new Weapon(
            GameConfig.weapons[this.state.currentWeapon],
            this.bulletManager,
            this.soundManager
        ));
        
        // 启动游戏循环
        this.world.start(this.gameLoop.bind(this));
        
        // 锁定鼠标指针
        this.world.lockPointer();
    }
    
    // 游戏主循环
    gameLoop(deltaTime) {
        if (this.state.gameState !== GameState.PLAYING) return;
        
        // 更新玩家
        this.player.update(deltaTime);
        
        // 更新敌人
        this.enemyManager.update(deltaTime, this.player.position);
        
        // 更新子弹
        this.bulletManager.update(deltaTime);
        
        // 更新手榴弹
        this.grenadeManager.update(deltaTime);
        
        // 检测碰撞
        this.detectCollisions();
    }
    
    // 碰撞检测
    detectCollisions() {
        // 子弹与敌人碰撞
        const bulletHits = this.bulletManager.checkCollisions(this.enemyManager.enemies);
        
        // 处理击中
        bulletHits.forEach(hit => {
            // 播放击中音效
            this.soundManager.playSound('hit');
            
            // 减少敌人生命值
            const killed = hit.enemy.takeDamage(hit.bullet.damage);
            
            if (killed) {
                // 更新分数
                this.updateScore(100);
                
                // 播放击杀音效
                this.soundManager.playSound('kill');
                
                // 显示击杀通知
                this.showKillNotification();
            }
        });
        
        // 手榴弹爆炸检测
        const grenadeExplosions = this.grenadeManager.checkExplosions();
        
        // 处理爆炸
        grenadeExplosions.forEach(explosion => {
            // 播放爆炸音效
            this.soundManager.playSound('explosion');
            
            // 对范围内的敌人造成伤害
            const killedEnemies = this.enemyManager.damageInRadius(
                explosion.position,
                explosion.radius,
                explosion.damage
            );
            
            // 更新分数
            this.updateScore(killedEnemies * 150);
            
            // 如果有击杀，播放击杀音效
            if (killedEnemies > 0) {
                this.soundManager.playSound('kill');
                this.showKillNotification();
            }
        });
        
        // 敌人与玩家碰撞
        const playerHit = this.enemyManager.checkPlayerCollision(this.player.position, 1);
        
        if (playerHit) {
            // 玩家受到伤害
            this.updatePlayerHealth(-10);
            
            // 显示伤害指示器
            this.showDamageIndicator();
        }
    }
    
    // 暂停游戏
    pauseGame() {
        if (this.state.gameState === GameState.PLAYING) {
            this.setState({ gameState: GameState.PAUSED });
            this.world.unlockPointer();
        }
    }
    
    // 恢复游戏
    resumeGame() {
        if (this.state.gameState === GameState.PAUSED) {
            this.setState({ gameState: GameState.PLAYING });
            this.world.lockPointer();
        }
    }
    
    // 重新开始游戏
    restartGame() {
        // 清理当前游戏
        if (this.world) {
            this.world.stop();
            this.world.dispose();
        }
        
        // 开始新游戏
        this.startGame(GameConfig.currentDifficulty);
    }
    
    // 游戏结束
    gameOver() {
        this.setState({ gameState: GameState.GAME_OVER });
        this.world.unlockPointer();
    }
    
    // 更新分数
    updateScore(points) {
        this.setState(prevState => ({
            score: prevState.score + points
        }));
    }
    
    // 更新玩家生命值
    updatePlayerHealth(change) {
        this.setState(prevState => {
            const newHealth = Math.max(0, prevState.playerHealth + change);
            
            // 检查玩家是否死亡
            if (newHealth <= 0 && prevState.gameState === GameState.PLAYING) {
                setTimeout(() => this.gameOver(), 500);
            }
            
            return { playerHealth: newHealth };
        });
    }
    
    // 更新弹药
    updateAmmo(weapon, magazineChange, reserveChange) {
        this.setState(prevState => {
            const ammo = { ...prevState.ammo };
            
            if (magazineChange !== undefined) {
                ammo[weapon].current = Math.max(0, ammo[weapon].current + magazineChange);
            }
            
            if (reserveChange !== undefined) {
                ammo[weapon].reserve = Math.max(0, ammo[weapon].reserve + reserveChange);
            }
            
            return { ammo };
        });
    }
    
    // 切换武器
    switchWeapon(weapon) {
        if (this.state.currentWeapon !== weapon && GameConfig.weapons[weapon]) {
            this.setState({ currentWeapon: weapon });
            
            // 更新玩家武器
            if (this.player) {
                this.player.setWeapon(new Weapon(
                    GameConfig.weapons[weapon],
                    this.bulletManager,
                    this.soundManager
                ));
            }
        }
    }
    
    // 处理键盘事件
    handleKeyDown(event) {
        // 暂停/恢复游戏 (ESC键)
        if (event.key === 'Escape') {
            if (this.state.gameState === GameState.PLAYING) {
                this.pauseGame();
            } else if (this.state.gameState === GameState.PAUSED) {
                this.resumeGame();
            }
        }
        
        // 切换武器 (数字键)
        if (this.state.gameState === GameState.PLAYING) {
            if (event.key === '1') {
                this.switchWeapon('pistol');
            } else if (event.key === '2') {
                this.switchWeapon('rifle');
            } else if (event.key === '3') {
                this.switchWeapon('shotgun');
            }
        }
    }
    
    // 显示伤害指示器
    showDamageIndicator() {
        const damageIndicator = document.querySelector('.damage-indicator');
        if (damageIndicator) {
            damageIndicator.classList.add('active');
            setTimeout(() => {
                damageIndicator.classList.remove('active');
            }, 200);
        }
    }
    
    // 显示击杀通知
    showKillNotification() {
        const killNotification = document.querySelector('.kill-notification');
        if (killNotification) {
            killNotification.textContent = '击杀 +100';
            killNotification.classList.add('active');
            
            setTimeout(() => {
                killNotification.classList.remove('active');
            }, 2000);
        }
    }
    
    render() {
        const { gameState, score, loadingProgress, playerHealth, currentWeapon, ammo } = this.state;
        
        return (
            <div ref={this.gameContainer} className="game-container">
                {/* 游戏UI */}
                {gameState === GameState.PLAYING && (
                    <GameUI 
                        health={playerHealth}
                        score={score}
                        currentWeapon={currentWeapon}
                        ammo={ammo[currentWeapon]}
                        weapons={GameConfig.weapons}
                        onWeaponSwitch={this.switchWeapon}
                    />
                )}
                
                {/* 加载屏幕 */}
                {gameState === GameState.LOADING && (
                    <div className="loading-screen">
                        <h1 className="loading-text">加载中...</h1>
                        <div className="loading-bar-container">
                            <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
                        </div>
                    </div>
                )}
                
                {/* 主菜单 */}
                {gameState === GameState.MENU && (
                    <div className="game-menu">
                        <h1 className="menu-title">CS射击游戏</h1>
                        <button className="menu-button" onClick={() => this.startGame('easy')}>简单模式</button>
                        <button className="menu-button" onClick={() => this.startGame('normal')}>普通模式</button>
                        <button className="menu-button" onClick={() => this.startGame('hard')}>困难模式</button>
                    </div>
                )}
                
                {/* 暂停菜单 */}
                {gameState === GameState.PAUSED && (
                    <div className="game-menu">
                        <h1 className="menu-title">游戏暂停</h1>
                        <button className="menu-button" onClick={this.resumeGame}>继续游戏</button>
                        <button className="menu-button" onClick={this.restartGame}>重新开始</button>
                        <button className="menu-button" onClick={() => this.setState({ gameState: GameState.MENU })}>返回主菜单</button>
                    </div>
                )}
                
                {/* 游戏结束 */}
                {gameState === GameState.GAME_OVER && (
                    <div className="game-over">
                        <h1 className="game-over-title">游戏结束</h1>
                        <p className="final-score">最终得分: {score}</p>
                        <button className="menu-button" onClick={this.restartGame}>再来一局</button>
                        <button className="menu-button" onClick={() => this.setState({ gameState: GameState.MENU })}>返回主菜单</button>
                    </div>
                )}
                
                {/* 伤害指示器 */}
                <div className="damage-indicator"></div>
                
                {/* 击杀通知 */}
                <div className="kill-notification"></div>
            </div>
        );
    }
}

// 渲染游戏应用
ReactDOM.render(<GameApp />, document.getElementById('root'));
