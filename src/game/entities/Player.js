// 玩家类

class Player {
    constructor(scene, camera) {
        // 保存场景和相机引用
        this.scene = scene;
        this.camera = camera;
        
        // 玩家属性
        this.position = new THREE.Vector3(0, 1.7, 0); // 初始位置
        this.velocity = new THREE.Vector3(0, 0, 0);   // 速度向量
        this.rotation = new THREE.Euler(0, 0, 0);     // 旋转角度
        this.moveSpeed = 5;                           // 移动速度
        this.jumpForce = 10;                          // 跳跃力度
        this.gravity = 20;                            // 重力
        this.isOnGround = true;                       // 是否在地面上
        
        // 武器
        this.weapon = null;
        
        // 控制器
        this.controls = new Controls(this.camera);
        
        // 初始化
        this.init();
    }
    
    // 初始化
    init() {
        // 设置相机位置
        this.camera.position.copy(this.position);
        
        // 监听鼠标移动
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // 监听鼠标点击
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // 监听键盘按键
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    
    // 更新
    update(deltaTime) {
        // 更新控制器
        this.controls.update();
        
        // 处理移动
        this.handleMovement(deltaTime);
        
        // 处理重力
        this.handleGravity(deltaTime);
        
        // 更新相机位置
        this.camera.position.copy(this.position);
        
        // 更新武器
        if (this.weapon) {
            this.weapon.update(deltaTime, this.camera);
        }
    }
    
    // 处理移动
    handleMovement(deltaTime) {
        // 获取移动方向
        const moveDirection = this.controls.getMoveDirection();
        
        // 计算移动向量
        const moveVector = new THREE.Vector3();
        
        // 前后移动
        moveVector.z = moveDirection.forward - moveDirection.backward;
        
        // 左右移动
        moveVector.x = moveDirection.right - moveDirection.left;
        
        // 归一化移动向量
        if (moveVector.length() > 0) {
            moveVector.normalize();
        }
        
        // 应用相机旋转
        moveVector.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));
        
        // 计算速度
        this.velocity.x = moveVector.x * this.moveSpeed;
        this.velocity.z = moveVector.z * this.moveSpeed;
        
        // 更新位置
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // 边界检查
        this.checkBoundaries();
    }
    
    // 处理重力
    handleGravity(deltaTime) {
        // 如果在地面上且按下跳跃键
        if (this.isOnGround && this.controls.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isOnGround = false;
        }
        
        // 应用重力
        this.velocity.y -= this.gravity * deltaTime;
        
        // 更新位置
        this.position.y += this.velocity.y * deltaTime;
        
        // 地面检查
        if (this.position.y <= 1.7) {
            this.position.y = 1.7;
            this.velocity.y = 0;
            this.isOnGround = true;
        }
    }
    
    // 边界检查
    checkBoundaries() {
        const worldSize = GameConfig.world.size - 1; // 留一点边距
        
        // X轴边界
        if (this.position.x > worldSize) {
            this.position.x = worldSize;
        } else if (this.position.x < -worldSize) {
            this.position.x = -worldSize;
        }
        
        // Z轴边界
        if (this.position.z > worldSize) {
            this.position.z = worldSize;
        } else if (this.position.z < -worldSize) {
            this.position.z = -worldSize;
        }
    }
    
    // 设置武器
    setWeapon(weapon) {
        this.weapon = weapon;
    }
    
    // 鼠标移动事件处理
    onMouseMove(event) {
        this.controls.handleMouseMove(event);
    }
    
    // 鼠标按下事件处理
    onMouseDown(event) {
        // 左键射击
        if (event.button === 0 && this.weapon) {
            this.weapon.startFiring();
        }
        
        // 右键瞄准
        if (event.button === 2) {
            this.weapon.startAiming();
        }
    }
    
    // 鼠标释放事件处理
    onMouseUp(event) {
        // 左键停止射击
        if (event.button === 0 && this.weapon) {
            this.weapon.stopFiring();
        }
        
        // 右键停止瞄准
        if (event.button === 2) {
            this.weapon.stopAiming();
        }
    }
    
    // 键盘按下事件处理
    onKeyDown(event) {
        this.controls.handleKeyDown(event);
        
        // R键重新装弹
        if (event.key === 'r' && this.weapon) {
            this.weapon.reload();
        }
        
        // G键投掷手榴弹
        if (event.key === 'g') {
            this.throwGrenade();
        }
    }
    
    // 键盘释放事件处理
    onKeyUp(event) {
        this.controls.handleKeyUp(event);
    }
    
    // 投掷手榴弹
    throwGrenade() {
        // 创建手榴弹
        const grenade = new Grenade(
            this.scene,
            this.position.clone(),
            this.camera.getWorldDirection(new THREE.Vector3())
        );
        
        // 添加到手榴弹管理器
        if (window.grenadeManager) {
            window.grenadeManager.addGrenade(grenade);
        }
    }
}
