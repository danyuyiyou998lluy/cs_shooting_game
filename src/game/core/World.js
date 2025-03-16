// 游戏世界类

class World {
    constructor(container) {
        // 保存容器引用
        this.container = container;
        
        // 创建场景
        this.scene = new THREE.Scene();
        
        // 设置雾效
        this.scene.fog = new THREE.Fog(
            GameConfig.world.fogColor,
            GameConfig.world.fogNear,
            GameConfig.world.fogFar
        );
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,                                             // 视野角度
            window.innerWidth / window.innerHeight,         // 宽高比
            0.1,                                            // 近裁剪面
            1000                                            // 远裁剪面
        );
        this.camera.position.set(0, 1.7, 0);                // 设置相机高度为人眼高度
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(GameConfig.world.skyColor);
        this.renderer.shadowMap.enabled = true;
        
        // 将渲染器的DOM元素添加到容器中
        this.container.appendChild(this.renderer.domElement);
        
        // 创建光源
        this.setupLights();
        
        // 创建地面
        this.createGround();
        
        // 创建天空盒
        this.createSkybox();
        
        // 创建环境物体
        this.createEnvironment();
        
        // 设置窗口大小变化监听
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // 游戏循环
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.animationFrameId = null;
        this.gameLoopCallback = null;
    }
    
    // 设置光源
    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // 定向光（模拟太阳光）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 200, 100);
        directionalLight.castShadow = true;
        
        // 设置阴影属性
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
    }
    
    // 创建地面
    createGround() {
        // 地面几何体
        const groundGeometry = new THREE.PlaneGeometry(
            GameConfig.world.size * 2,
            GameConfig.world.size * 2
        );
        
        // 地面材质
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: GameConfig.world.groundColor,
            roughness: 1.0,
            metalness: 0.0
        });
        
        // 创建地面网格
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // 旋转为水平
        ground.position.y = 0;
        ground.receiveShadow = true;
        
        this.scene.add(ground);
    }
    
    // 创建天空盒
    createSkybox() {
        // 简单的天空盒实现
        const skyGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: GameConfig.world.skyColor,
            side: THREE.BackSide // 从内部渲染
        });
        
        const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(skybox);
    }
    
    // 创建环境物体
    createEnvironment() {
        // 创建一些障碍物和掩体
        this.createObstacles();
        
        // 创建边界墙
        this.createBoundaryWalls();
    }
    
    // 创建障碍物
    createObstacles() {
        // 创建箱子作为掩体
        const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
        const boxMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // 在场景中随机放置箱子
        for (let i = 0; i < 20; i++) {
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            
            // 随机位置
            const x = (Math.random() - 0.5) * GameConfig.world.size * 1.8;
            const z = (Math.random() - 0.5) * GameConfig.world.size * 1.8;
            
            box.position.set(x, 1, z);
            box.castShadow = true;
            box.receiveShadow = true;
            
            this.scene.add(box);
        }
        
        // 创建一些障碍墙
        const wallGeometry = new THREE.BoxGeometry(10, 4, 1);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x999999,
            roughness: 1.0,
            metalness: 0.0
        });
        
        // 放置几面墙
        for (let i = 0; i < 10; i++) {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            
            // 随机位置
            const x = (Math.random() - 0.5) * GameConfig.world.size * 1.5;
            const z = (Math.random() - 0.5) * GameConfig.world.size * 1.5;
            
            // 随机旋转
            const rotation = Math.random() * Math.PI;
            
            wall.position.set(x, 2, z);
            wall.rotation.y = rotation;
            wall.castShadow = true;
            wall.receiveShadow = true;
            
            this.scene.add(wall);
        }
    }
    
    // 创建边界墙
    createBoundaryWalls() {
        const wallSize = GameConfig.world.size;
        const wallHeight = 10;
        const wallThickness = 2;
        
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 1.0,
            metalness: 0.0
        });
        
        // 北墙
        const northWallGeometry = new THREE.BoxGeometry(wallSize * 2, wallHeight, wallThickness);
        const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
        northWall.position.set(0, wallHeight / 2, -wallSize);
        northWall.castShadow = true;
        northWall.receiveShadow = true;
        this.scene.add(northWall);
        
        // 南墙
        const southWall = northWall.clone();
        southWall.position.z = wallSize;
        this.scene.add(southWall);
        
        // 东墙
        const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallSize * 2);
        const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
        eastWall.position.set(wallSize, wallHeight / 2, 0);
        eastWall.castShadow = true;
        eastWall.receiveShadow = true;
        this.scene.add(eastWall);
        
        // 西墙
        const westWall = eastWall.clone();
        westWall.position.x = -wallSize;
        this.scene.add(westWall);
    }
    
    // 窗口大小变化处理
    onWindowResize() {
        // 更新相机宽高比
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // 更新渲染器大小
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // 开始游戏循环
    start(gameLoopCallback) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameLoopCallback = gameLoopCallback;
        this.clock.start();
        
        // 开始动画循环
        this.animate();
    }
    
    // 停止游戏循环
    stop() {
        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    // 动画循环
    animate() {
        if (!this.isRunning) return;
        
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        // 获取时间增量
        const deltaTime = this.clock.getDelta();
        
        // 调用游戏循环回调
        if (this.gameLoopCallback) {
            this.gameLoopCallback(deltaTime);
        }
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }
    
    // 锁定鼠标指针
    lockPointer() {
        const canvas = this.renderer.domElement;
        
        // 锁定鼠标指针
        canvas.requestPointerLock = canvas.requestPointerLock ||
                                   canvas.mozRequestPointerLock ||
                                   canvas.webkitRequestPointerLock;
        
        canvas.requestPointerLock();
    }
    
    // 解锁鼠标指针
    unlockPointer() {
        document.exitPointerLock = document.exitPointerLock ||
                                   document.mozExitPointerLock ||
                                   document.webkitExitPointerLock;
        
        document.exitPointerLock();
    }
    
    // 清理资源
    dispose() {
        // 停止游戏循环
        this.stop();
        
        // 移除窗口大小变化监听
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        
        // 移除渲染器DOM元素
        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
        
        // 清理场景
        this.scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}
