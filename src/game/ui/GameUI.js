// 游戏UI类

class GameUI {
    constructor() {
        // 创建UI容器
        this.container = document.createElement('div');
        this.container.id = 'game-ui';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none'; // 不阻挡鼠标事件
        
        // 创建HUD元素
        this.createHUD();
        
        // 创建开始界面
        this.createStartScreen();
        
        // 添加到页面
        document.body.appendChild(this.container);
    }
    
    // 创建HUD（平视显示器）
    createHUD() {
        // 创建HUD容器
        this.hud = document.createElement('div');
        this.hud.id = 'hud';
        this.hud.style.position = 'absolute';
        this.hud.style.width = '100%';
        this.hud.style.padding = '20px';
        this.hud.style.boxSizing = 'border-box';
        this.hud.style.color = 'white';
        this.hud.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        this.hud.style.fontFamily = 'Arial, sans-serif';
        this.hud.style.display = 'none'; // 初始隐藏
        
        // 创建武器信息
        const weaponInfo = document.createElement('div');
        weaponInfo.style.position = 'absolute';
        weaponInfo.style.bottom = '20px';
        weaponInfo.style.right = '20px';
        weaponInfo.style.textAlign = 'right';
        
        // 武器名称
        const weaponName = document.createElement('div');
        weaponName.id = 'weapon-name';
        weaponName.style.fontSize = '24px';
        weaponName.style.fontWeight = 'bold';
        weaponName.textContent = '手枪';
        weaponInfo.appendChild(weaponName);
        
        // 弹药信息
        const ammo = document.createElement('div');
        ammo.id = 'ammo';
        ammo.style.fontSize = '20px';
        ammo.textContent = '12 / 12';
        weaponInfo.appendChild(ammo);
        
        // 装弹提示
        const reloading = document.createElement('div');
        reloading.id = 'reloading';
        reloading.style.fontSize = '18px';
        reloading.style.color = 'yellow';
        reloading.textContent = '装弹中...';
        reloading.style.display = 'none';
        weaponInfo.appendChild(reloading);
        
        // 添加武器信息到HUD
        this.hud.appendChild(weaponInfo);
        
        // 创建玩家状态
        const playerStatus = document.createElement('div');
        playerStatus.style.position = 'absolute';
        playerStatus.style.top = '20px';
        playerStatus.style.left = '20px';
        
        // 生命值
        const health = document.createElement('div');
        health.id = 'health';
        health.style.fontSize = '20px';
        health.style.marginBottom = '10px';
        health.textContent = '生命值: 100';
        playerStatus.appendChild(health);
        
        // 敌人数量
        const enemyCount = document.createElement('div');
        enemyCount.id = 'enemy-count';
        enemyCount.style.fontSize = '18px';
        enemyCount.style.marginBottom = '5px';
        enemyCount.textContent = '敌人: 0';
        playerStatus.appendChild(enemyCount);
        
        // 击杀数
        const killCount = document.createElement('div');
        killCount.id = 'kill-count';
        killCount.style.fontSize = '18px';
        killCount.textContent = '击杀: 0';
        playerStatus.appendChild(killCount);
        
        // 添加玩家状态到HUD
        this.hud.appendChild(playerStatus);
        
        // 添加HUD到容器
        this.container.appendChild(this.hud);
    }
    
    // 创建开始界面
    createStartScreen() {
        // 创建开始界面容器
        this.startScreen = document.createElement('div');
        this.startScreen.id = 'start-screen';
        this.startScreen.style.position = 'absolute';
        this.startScreen.style.top = '0';
        this.startScreen.style.left = '0';
        this.startScreen.style.width = '100%';
        this.startScreen.style.height = '100%';
        this.startScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.startScreen.style.display = 'flex';
        this.startScreen.style.flexDirection = 'column';
        this.startScreen.style.justifyContent = 'center';
        this.startScreen.style.alignItems = 'center';
        this.startScreen.style.color = 'white';
        this.startScreen.style.fontFamily = 'Arial, sans-serif';
        this.startScreen.style.pointerEvents = 'auto'; // 允许鼠标事件
        
        // 游戏标题
        const title = document.createElement('h1');
        title.textContent = 'CS风格射击游戏';
        title.style.fontSize = '48px';
        title.style.marginBottom = '30px';
        title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        this.startScreen.appendChild(title);
        
        // 游戏说明
        const instructions = document.createElement('div');
        instructions.style.fontSize = '18px';
        instructions.style.marginBottom = '40px';
        instructions.style.textAlign = 'center';
        instructions.style.maxWidth = '600px';
        instructions.style.lineHeight = '1.5';
        instructions.innerHTML = `
            <p>WASD - 移动</p>
            <p>鼠标 - 瞄准</p>
            <p>左键 - 射击</p>
            <p>R键 - 装弹</p>
            <p>1-3键 - 切换武器</p>
        `;
        this.startScreen.appendChild(instructions);
        
        // 开始按钮
        const startButton = document.createElement('button');
        startButton.id = 'start-button';
        startButton.textContent = '开始游戏';
        startButton.style.padding = '15px 30px';
        startButton.style.fontSize = '24px';
        startButton.style.backgroundColor = '#4CAF50';
        startButton.style.color = 'white';
        startButton.style.border = 'none';
        startButton.style.borderRadius = '5px';
        startButton.style.cursor = 'pointer';
        startButton.style.transition = 'background-color 0.3s';
        
        // 鼠标悬停效果
        startButton.onmouseover = () => {
            startButton.style.backgroundColor = '#45a049';
        };
        startButton.onmouseout = () => {
            startButton.style.backgroundColor = '#4CAF50';
        };
        
        this.startScreen.appendChild(startButton);
        
        // 添加开始界面到容器
        this.container.appendChild(this.startScreen);
    }
    
    // 隐藏开始界面，显示HUD
    startGame() {
        this.startScreen.style.display = 'none';
        this.hud.style.display = 'block';
    }
    
    // 显示开始界面，隐藏HUD
    showStartScreen() {
        this.startScreen.style.display = 'flex';
        this.hud.style.display = 'none';
    }
    
    // 更新武器信息
    updateWeaponInfo(name, ammo, maxAmmo, isReloading) {
        const weaponNameElement = document.getElementById('weapon-name');
        if (weaponNameElement) {
            weaponNameElement.textContent = name;
        }
        
        const ammoElement = document.getElementById('ammo');
        if (ammoElement) {
            ammoElement.textContent = `${ammo} / ${maxAmmo}`;
        }
        
        const reloadingElement = document.getElementById('reloading');
        if (reloadingElement) {
            reloadingElement.style.display = isReloading ? 'block' : 'none';
        }
    }
    
    // 更新玩家状态
    updatePlayerStatus(health, enemyCount, killCount) {
        const healthElement = document.getElementById('health');
        if (healthElement) {
            healthElement.textContent = `生命值: ${Math.max(0, Math.floor(health))}`;
            
            // 生命值低时变红
            if (health < 30) {
                healthElement.style.color = 'red';
            } else {
                healthElement.style.color = 'white';
            }
        }
        
        const enemyCountElement = document.getElementById('enemy-count');
        if (enemyCountElement) {
            enemyCountElement.textContent = `敌人: ${enemyCount}`;
        }
        
        const killCountElement = document.getElementById('kill-count');
        if (killCountElement) {
            killCountElement.textContent = `击杀: ${killCount}`;
        }
    }
}

export default GameUI;
