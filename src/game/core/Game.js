import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import WeaponManager from '../managers/WeaponManager.js';
import EnemyManager from '../managers/EnemyManager.js';
import SoundManager from '../managers/SoundManager.js';
import GameUI from '../ui/GameUI.js';

class Game {
    constructor() {
        // 初始化场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // 天空蓝
        
        // 初始化相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.y = 1.7; // 玩家身高
        
        // 初始化渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // 添加环境光和平行光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // 初始化控制器
        this.controls = new PointerLockControls(this.camera, document.body);
        
        // 添加十字准星
        this.createCrosshair();
        
        // 初始化武器管理器
        this.weaponManager = new WeaponManager(this.scene, this.camera);
        
        // 初始化敌人管理器
        this.enemyManager = new EnemyManager(this.scene, 2000, 2, 100);
        
        // 初始化音效管理器
        this.soundManager = new SoundManager();
        
        // 初始化游戏UI
        this.gameUI = new GameUI();
        
        // 玩家状态
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        // 玩家属性
        this.playerVelocity = new THREE.Vector3();
        this.playerSpeed = 5;
        this.playerHealth = 100;
        this.isPlayerDead = false;
        
        // 游戏状态
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // 创建基本场景
        this.createScene();
        
        // 绑定事件
        this.bindEvents();
        
        // 开始游戏循环
        this.lastTime = performance.now();
        this.animate();
        
        // 调试信息
        console.log('Game initialized');
        console.log('Camera:', this.camera);
        console.log('Scene:', this.scene);
        console.log('WeaponManager:', this.weaponManager);
        console.log('EnemyManager:', this.enemyManager);
    }
    
    createCrosshair() {
        // 创建十字准星
        const crosshairSize = 0.015;
        const crosshairColor = 0xffffff;
        
        // 创建水平线
        const horizontalGeometry = new THREE.PlaneGeometry(crosshairSize * 2, crosshairSize / 3);
        const horizontalMaterial = new THREE.MeshBasicMaterial({ color: crosshairColor });
        const horizontalLine = new THREE.Mesh(horizontalGeometry, horizontalMaterial);
        
        // 创建垂直线
        const verticalGeometry = new THREE.PlaneGeometry(crosshairSize / 3, crosshairSize * 2);
        const verticalMaterial = new THREE.MeshBasicMaterial({ color: crosshairColor });
        const verticalLine = new THREE.Mesh(verticalGeometry, verticalMaterial);
        
        // 创建十字准星容器
        this.crosshair = new THREE.Object3D();
        this.crosshair.add(horizontalLine);
        this.crosshair.add(verticalLine);
        
        // 将十字准星添加到相机
        this.crosshair.position.set(0, 0, -0.5);
        this.camera.add(this.crosshair);
    }
    
    createScene() {
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        // 添加方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // 创建地面
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // 添加一些简单的障碍物
        this.createObstacle(0, 1, -5, 2, 2, 2);
        this.createObstacle(-5, 1, 0, 2, 2, 2);
        this.createObstacle(5, 1, 0, 2, 2, 2);
    }
    
    createObstacle(x, y, z, width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.7,
            metalness: 0.3
        });
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.set(x, y, z);
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        this.scene.add(obstacle);
    }
    
    bindEvents() {
        // 键盘按下事件
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveState.forward = true;
                    break;
                case 'KeyS':
                    this.moveState.backward = true;
                    break;
                case 'KeyA':
                    this.moveState.left = true;
                    break;
                case 'KeyD':
                    this.moveState.right = true;
                    break;
                case 'KeyR':
                    // 装弹
                    if (this.controls.isLocked && !this.gamePaused && !this.gameOver) {
                        this.weaponManager.reload();
                    }
                    break;
                case 'Digit1':
                    // 切换到手枪
                    if (this.controls.isLocked && !this.gamePaused && !this.gameOver) {
                        this.weaponManager.selectWeapon('pistol');
                        this.updateUI();
                    }
                    break;
                case 'Digit2':
                    // 切换到步枪
                    if (this.controls.isLocked && !this.gamePaused && !this.gameOver) {
                        this.weaponManager.selectWeapon('rifle');
                        this.updateUI();
                    }
                    break;
                case 'Digit3':
                    // 切换到霰弹枪
                    if (this.controls.isLocked && !this.gamePaused && !this.gameOver) {
                        this.weaponManager.selectWeapon('shotgun');
                        this.updateUI();
                    }
                    break;
                case 'Escape':
                    // 暂停游戏
                    if (this.gameStarted && !this.gameOver) {
                        this.togglePause();
                    }
                    break;
            }
        });
        
        // 键盘抬起事件
        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveState.forward = false;
                    break;
                case 'KeyS':
                    this.moveState.backward = false;
                    break;
                case 'KeyA':
                    this.moveState.left = false;
                    break;
                case 'KeyD':
                    this.moveState.right = false;
                    break;
            }
        });
        
        // 鼠标点击事件 - 射击
        document.addEventListener('click', () => {
            if (!this.controls.isLocked || this.gamePaused || this.gameOver) return;
            
            // 尝试射击
            const shots = this.weaponManager.shoot();
            
            if (shots) {
                // 检查射击是否命中敌人
                shots.forEach(shot => {
                    // 获取射击方向和伤害
                    const rayOrigin = this.camera.position.clone();
                    const rayDirection = shot.direction;
                    const damage = shot.damage;
                    
                    // 检查射击是否命中敌人
                    const hitResult = this.enemyManager.checkShot(rayOrigin, rayDirection, 100, damage);
                    
                    // 如果命中，播放命中音效
                    if (hitResult.hit) {
                        this.soundManager.playHitSound();
                        
                        // 如果击杀，更新UI
                        if (hitResult.killed) {
                            this.updateUI();
                        }
                    }
                });
            }
        });
        
        // 窗口大小改变事件
        window.addEventListener('resize', () => {
            // 更新相机宽高比
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            
            // 更新渲染器大小
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // 点击开始按钮事件
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        // 点击锁定鼠标事件
        this.renderer.domElement.addEventListener('click', () => {
            // 如果游戏已经开始且没有锁定鼠标，则锁定
            if (this.gameStarted && !this.controls.isLocked && !this.gameOver) {
                this.controls.lock();
            }
        });
        
        // 锁定鼠标事件
        this.controls.addEventListener('lock', () => {
            if (this.gameStarted) {
                // 恢复游戏
                this.gamePaused = false;
            }
        });
        
        // 解锁鼠标事件
        this.controls.addEventListener('unlock', () => {
            if (this.gameStarted && !this.gameOver) {
                // 暂停游戏
                this.gamePaused = true;
            }
        });
    }
    
    // 开始游戏
    startGame() {
        // 设置游戏状态
        this.gameStarted = true;
        
        // 显示HUD，隐藏开始界面
        this.gameUI.startGame();
        
        // 锁定鼠标
        this.controls.lock();
        
        // 更新UI
        this.updateUI();
    }
    
    // 暂停/恢复游戏
    togglePause() {
        if (this.gamePaused) {
            // 恢复游戏
            this.gamePaused = false;
            this.controls.lock();
        } else {
            // 暂停游戏
            this.gamePaused = true;
            this.controls.unlock();
        }
    }
    
    update(deltaTime) {
        // 如果游戏结束，不更新
        if (this.gameOver) return;
        
        // 更新武器
        this.weaponManager.update(deltaTime);
        
        // 更新敌人
        this.enemyManager.update(deltaTime, this.camera.position);
        
        // 检查敌人碰撞
        if (this.enemyManager.checkPlayerCollision(this.camera.position, 1)) {
            // 玩家受到伤害
            this.playerHealth -= 10 * deltaTime;
            
            // 播放受伤音效
            this.soundManager.playSound('playerHit');
            
            // 检查玩家是否死亡
            if (this.playerHealth <= 0 && !this.isPlayerDead) {
                this.playerDie();
            }
            
            // 更新UI
            this.updateUI();
        }
        
        // 更新玩家移动
        this.updatePlayerMovement(deltaTime);
        
        // 更新UI
        this.updateUI();
    }
    
    updatePlayerMovement(deltaTime) {
        // 如果玩家死亡，不更新移动
        if (this.isPlayerDead) return;
        
        // 计算移动速度
        const speed = this.playerSpeed * deltaTime;
        
        // 获取相机的方向向量
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        
        // 计算相机的前进方向（忽略y轴）
        const forward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
        
        // 计算相机的右方向（叉乘得到垂直于前进方向和y轴的向量）
        const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
        
        // 重置速度
        this.playerVelocity.set(0, 0, 0);
        
        // 根据按键状态和相机方向计算移动向量
        if (this.moveState.forward) {
            this.playerVelocity.add(forward.multiplyScalar(speed));
        }
        if (this.moveState.backward) {
            this.playerVelocity.add(forward.clone().multiplyScalar(-speed));
        }
        if (this.moveState.right) {
            this.playerVelocity.add(right.multiplyScalar(speed));
        }
        if (this.moveState.left) {
            this.playerVelocity.add(right.clone().multiplyScalar(-speed));
        }
        
        // 更新相机位置
        this.camera.position.add(this.playerVelocity);
        
        // 确保相机不会低于地面
        if (this.camera.position.y < 1.7) {
            this.camera.position.y = 1.7;
        }
        
        // 确保相机不会超出边界
        const boundary = 50;
        this.camera.position.x = Math.max(-boundary, Math.min(boundary, this.camera.position.x));
        this.camera.position.z = Math.max(-boundary, Math.min(boundary, this.camera.position.z));
    }
    
    playerDie() {
        this.isPlayerDead = true;
        
        // 播放死亡音效
        this.soundManager.playSound('playerDeath');
        
        // 显示游戏结束界面
        this.showGameOverScreen();
        
        // 锁定控制
        this.controls.unlock();
        
        // 设置游戏结束状态
        this.gameOver = true;
    }
    
    showGameOverScreen() {
        // 创建游戏结束界面
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'game-over';
        gameOverDiv.style.position = 'absolute';
        gameOverDiv.style.top = '50%';
        gameOverDiv.style.left = '50%';
        gameOverDiv.style.transform = 'translate(-50%, -50%)';
        gameOverDiv.style.color = 'white';
        gameOverDiv.style.fontSize = '32px';
        gameOverDiv.style.textAlign = 'center';
        gameOverDiv.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        
        // 添加游戏结束文本
        const gameOverText = document.createElement('h1');
        gameOverText.textContent = 'GAME OVER';
        gameOverDiv.appendChild(gameOverText);
        
        // 添加击杀数
        const killCountText = document.createElement('p');
        killCountText.textContent = `击杀数: ${this.enemyManager.getKillCount()}`;
        gameOverDiv.appendChild(killCountText);
        
        // 添加重新开始按钮
        const restartButton = document.createElement('button');
        restartButton.textContent = '重新开始';
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '18px';
        restartButton.style.marginTop = '20px';
        restartButton.style.cursor = 'pointer';
        restartButton.onclick = () => this.restartGame();
        gameOverDiv.appendChild(restartButton);
        
        // 添加到页面
        document.body.appendChild(gameOverDiv);
    }
    
    restartGame() {
        // 移除游戏结束界面
        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            document.body.removeChild(gameOverDiv);
        }
        
        // 重置玩家状态
        this.playerHealth = 100;
        this.isPlayerDead = false;
        
        // 重置游戏状态
        this.gameOver = false;
        
        // 清除所有敌人
        this.enemyManager.clearAllEnemies();
        
        // 重新选择武器
        this.weaponManager.selectWeapon('pistol');
        
        // 重置位置
        this.camera.position.set(0, 1.7, 0);
        
        // 更新UI
        this.updateUI();
        
        // 锁定控制
        this.controls.lock();
    }
    
    updateUI() {
        // 如果游戏还没开始，不更新UI
        if (!this.gameStarted) return;
        
        // 获取武器信息
        const weaponInfo = this.weaponManager.getCurrentWeaponInfo();
        if (weaponInfo) {
            // 更新武器UI
            this.gameUI.updateWeaponInfo(
                weaponInfo.name,
                weaponInfo.ammo,
                weaponInfo.maxAmmo,
                weaponInfo.isReloading
            );
        }
        
        // 更新玩家状态UI
        this.gameUI.updatePlayerStatus(
            this.playerHealth,
            this.enemyManager.getEnemyCount(),
            this.enemyManager.getKillCount()
        );
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 计算时间增量
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // 更新游戏状态
        if (this.controls.isLocked && !this.gamePaused && !this.gameOver) {
            this.update(deltaTime);
        }
        
        // 确保武器模型可见
        if (this.weaponManager.currentWeapon) {
            this.weaponManager.currentWeapon.model.visible = true;
            
            // 调试信息 - 每秒打印一次
            if (Math.floor(currentTime / 1000) % 5 === 0) {
                console.log('Current weapon visible:', this.weaponManager.currentWeapon.model.visible);
                console.log('Weapon container visible:', this.weaponManager.weaponContainer.visible);
                console.log('Weapon container children:', this.weaponManager.weaponContainer.children);
            }
        }
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }
}

export default Game;
