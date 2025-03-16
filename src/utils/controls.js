// 控制系统类

class Controls {
    constructor(camera) {
        // 保存相机引用
        this.camera = camera;
        
        // 移动状态
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        // 跳跃状态
        this.isJumping = false;
        
        // 鼠标灵敏度
        this.mouseSensitivity = 0.002;
        
        // 相机旋转限制
        this.minPolarAngle = 0.1; // 向上看的限制
        this.maxPolarAngle = Math.PI - 0.1; // 向下看的限制
        
        // 当前相机旋转
        this.rotationX = 0; // 水平旋转
        this.rotationY = 0; // 垂直旋转
        
        // 鼠标锁定状态
        this.isLocked = false;
        
        // 监听指针锁定事件
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    }
    
    // 处理鼠标移动
    handleMouseMove(event) {
        // 检查是否锁定指针
        if (!this.isLocked) return;
        
        // 获取鼠标移动距离
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        
        // 更新相机旋转
        this.rotationX -= movementX * this.mouseSensitivity;
        this.rotationY -= movementY * this.mouseSensitivity;
        
        // 限制垂直旋转
        this.rotationY = Math.max(
            Math.PI / 2 - this.maxPolarAngle,
            Math.min(Math.PI / 2 - this.minPolarAngle, this.rotationY)
        );
        
        // 应用旋转
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.rotationX;
        this.camera.rotation.x = this.rotationY;
    }
    
    // 处理键盘按下
    handleKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
                this.moveState.forward = true;
                break;
            case 's':
                this.moveState.backward = true;
                break;
            case 'a':
                this.moveState.left = true;
                break;
            case 'd':
                this.moveState.right = true;
                break;
            case ' ': // 空格键
                this.isJumping = true;
                break;
        }
    }
    
    // 处理键盘释放
    handleKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
                this.moveState.forward = false;
                break;
            case 's':
                this.moveState.backward = false;
                break;
            case 'a':
                this.moveState.left = false;
                break;
            case 'd':
                this.moveState.right = false;
                break;
            case ' ': // 空格键
                this.isJumping = false;
                break;
        }
    }
    
    // 获取移动方向
    getMoveDirection() {
        return {
            forward: this.moveState.forward ? 1 : 0,
            backward: this.moveState.backward ? 1 : 0,
            left: this.moveState.left ? 1 : 0,
            right: this.moveState.right ? 1 : 0
        };
    }
    
    // 指针锁定状态变化
    onPointerLockChange() {
        this.isLocked = document.pointerLockElement !== null;
    }
    
    // 更新控制器
    update() {
        // 可以在这里添加额外的更新逻辑
    }
}
