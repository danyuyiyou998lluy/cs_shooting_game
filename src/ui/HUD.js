// 游戏HUD系统

class HUD {
    constructor() {
        // HUD容器
        this.container = null;
        
        // HUD元素
        this.elements = {
            health: null,
            armor: null,
            ammo: null,
            weaponName: null,
            score: null,
            kills: null,
            objectives: null,
            notifications: null,
            crosshair: null,
            hitMarker: null,
            damageIndicator: null,
            minimap: null,
            weaponWheel: null,
            gameOverScreen: null,
            pauseMenu: null
        };
        
        // 通知队列
        this.notifications = [];
        
        // 伤害指示器计时器
        this.damageIndicatorTimer = 0;
        
        // 命中标记计时器
        this.hitMarkerTimer = 0;
        
        // 初始化
        this.initialize();
    }
    
    // 初始化
    initialize() {
        // 创建HUD容器
        this.container = document.createElement('div');
        this.container.className = 'hud-container';
        document.body.appendChild(this.container);
        
        // 创建HUD元素
        this.createHealthBar();
        this.createArmorBar();
        this.createAmmoCounter();
        this.createWeaponName();
        this.createScoreDisplay();
        this.createKillCounter();
        this.createObjectivesPanel();
        this.createNotificationsPanel();
        this.createCrosshair();
        this.createHitMarker();
        this.createDamageIndicator();
        this.createMinimap();
        this.createWeaponWheel();
        this.createGameOverScreen();
        this.createPauseMenu();
        
        // 隐藏非必要元素
        this.hideElement('weaponWheel');
        this.hideElement('gameOverScreen');
        this.hideElement('pauseMenu');
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    // 创建生命值条
    createHealthBar() {
        const healthContainer = document.createElement('div');
        healthContainer.className = 'health-container hud-element';
        
        const healthLabel = document.createElement('div');
        healthLabel.className = 'hud-label';
        healthLabel.textContent = '生命值';
        
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        
        const healthFill = document.createElement('div');
        healthFill.className = 'health-fill';
        healthBar.appendChild(healthFill);
        
        const healthText = document.createElement('div');
        healthText.className = 'health-text';
        healthText.textContent = '100';
        
        healthContainer.appendChild(healthLabel);
        healthContainer.appendChild(healthBar);
        healthContainer.appendChild(healthText);
        
        this.container.appendChild(healthContainer);
        this.elements.health = {
            container: healthContainer,
            bar: healthFill,
            text: healthText
        };
    }
    
    // 创建护甲条
    createArmorBar() {
        const armorContainer = document.createElement('div');
        armorContainer.className = 'armor-container hud-element';
        
        const armorLabel = document.createElement('div');
        armorLabel.className = 'hud-label';
        armorLabel.textContent = '护甲';
        
        const armorBar = document.createElement('div');
        armorBar.className = 'armor-bar';
        
        const armorFill = document.createElement('div');
        armorFill.className = 'armor-fill';
        armorBar.appendChild(armorFill);
        
        const armorText = document.createElement('div');
        armorText.className = 'armor-text';
        armorText.textContent = '0';
        
        armorContainer.appendChild(armorLabel);
        armorContainer.appendChild(armorBar);
        armorContainer.appendChild(armorText);
        
        this.container.appendChild(armorContainer);
        this.elements.armor = {
            container: armorContainer,
            bar: armorFill,
            text: armorText
        };
    }
    
    // 创建弹药计数器
    createAmmoCounter() {
        const ammoContainer = document.createElement('div');
        ammoContainer.className = 'ammo-container hud-element';
        
        const currentAmmo = document.createElement('div');
        currentAmmo.className = 'current-ammo';
        currentAmmo.textContent = '30';
        
        const ammoSeparator = document.createElement('div');
        ammoSeparator.className = 'ammo-separator';
        ammoSeparator.textContent = '/';
        
        const maxAmmo = document.createElement('div');
        maxAmmo.className = 'max-ammo';
        maxAmmo.textContent = '90';
        
        ammoContainer.appendChild(currentAmmo);
        ammoContainer.appendChild(ammoSeparator);
        ammoContainer.appendChild(maxAmmo);
        
        this.container.appendChild(ammoContainer);
        this.elements.ammo = {
            container: ammoContainer,
            current: currentAmmo,
            max: maxAmmo
        };
    }
    
    // 创建武器名称显示
    createWeaponName() {
        const weaponNameContainer = document.createElement('div');
        weaponNameContainer.className = 'weapon-name-container hud-element';
        
        const weaponName = document.createElement('div');
        weaponName.className = 'weapon-name';
        weaponName.textContent = '手枪';
        
        weaponNameContainer.appendChild(weaponName);
        
        this.container.appendChild(weaponNameContainer);
        this.elements.weaponName = {
            container: weaponNameContainer,
            text: weaponName
        };
    }
    
    // 创建分数显示
    createScoreDisplay() {
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'score-container hud-element';
        
        const scoreLabel = document.createElement('div');
        scoreLabel.className = 'hud-label';
        scoreLabel.textContent = '分数';
        
        const scoreText = document.createElement('div');
        scoreText.className = 'score-text';
        scoreText.textContent = '0';
        
        scoreContainer.appendChild(scoreLabel);
        scoreContainer.appendChild(scoreText);
        
        this.container.appendChild(scoreContainer);
        this.elements.score = {
            container: scoreContainer,
            text: scoreText
        };
    }
    
    // 创建击杀计数器
    createKillCounter() {
        const killsContainer = document.createElement('div');
        killsContainer.className = 'kills-container hud-element';
        
        const killsLabel = document.createElement('div');
        killsLabel.className = 'hud-label';
        killsLabel.textContent = '击杀';
        
        const killsText = document.createElement('div');
        killsText.className = 'kills-text';
        killsText.textContent = '0';
        
        killsContainer.appendChild(killsLabel);
        killsContainer.appendChild(killsText);
        
        this.container.appendChild(killsContainer);
        this.elements.kills = {
            container: killsContainer,
            text: killsText
        };
    }
    
    // 创建目标面板
    createObjectivesPanel() {
        const objectivesContainer = document.createElement('div');
        objectivesContainer.className = 'objectives-container hud-element';
        
        const objectivesTitle = document.createElement('div');
        objectivesTitle.className = 'objectives-title';
        objectivesTitle.textContent = '任务目标';
        
        const objectivesList = document.createElement('div');
        objectivesList.className = 'objectives-list';
        
        objectivesContainer.appendChild(objectivesTitle);
        objectivesContainer.appendChild(objectivesList);
        
        this.container.appendChild(objectivesContainer);
        this.elements.objectives = {
            container: objectivesContainer,
            list: objectivesList
        };
    }
    
    // 创建通知面板
    createNotificationsPanel() {
        const notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        
        this.container.appendChild(notificationsContainer);
        this.elements.notifications = {
            container: notificationsContainer
        };
    }
    
    // 创建准星
    createCrosshair() {
        const crosshairContainer = document.createElement('div');
        crosshairContainer.className = 'crosshair-container';
        
        const crosshairCenter = document.createElement('div');
        crosshairCenter.className = 'crosshair-center';
        
        const crosshairTop = document.createElement('div');
        crosshairTop.className = 'crosshair-line crosshair-top';
        
        const crosshairRight = document.createElement('div');
        crosshairRight.className = 'crosshair-line crosshair-right';
        
        const crosshairBottom = document.createElement('div');
        crosshairBottom.className = 'crosshair-line crosshair-bottom';
        
        const crosshairLeft = document.createElement('div');
        crosshairLeft.className = 'crosshair-line crosshair-left';
        
        crosshairContainer.appendChild(crosshairCenter);
        crosshairContainer.appendChild(crosshairTop);
        crosshairContainer.appendChild(crosshairRight);
        crosshairContainer.appendChild(crosshairBottom);
        crosshairContainer.appendChild(crosshairLeft);
        
        this.container.appendChild(crosshairContainer);
        this.elements.crosshair = {
            container: crosshairContainer,
            center: crosshairCenter,
            lines: [crosshairTop, crosshairRight, crosshairBottom, crosshairLeft]
        };
    }
    
    // 创建命中标记
    createHitMarker() {
        const hitMarkerContainer = document.createElement('div');
        hitMarkerContainer.className = 'hit-marker-container';
        hitMarkerContainer.style.display = 'none';
        
        const hitMarkerTopRight = document.createElement('div');
        hitMarkerTopRight.className = 'hit-marker-line hit-marker-top-right';
        
        const hitMarkerTopLeft = document.createElement('div');
        hitMarkerTopLeft.className = 'hit-marker-line hit-marker-top-left';
        
        const hitMarkerBottomRight = document.createElement('div');
        hitMarkerBottomRight.className = 'hit-marker-line hit-marker-bottom-right';
        
        const hitMarkerBottomLeft = document.createElement('div');
        hitMarkerBottomLeft.className = 'hit-marker-line hit-marker-bottom-left';
        
        hitMarkerContainer.appendChild(hitMarkerTopRight);
        hitMarkerContainer.appendChild(hitMarkerTopLeft);
        hitMarkerContainer.appendChild(hitMarkerBottomRight);
        hitMarkerContainer.appendChild(hitMarkerBottomLeft);
        
        this.container.appendChild(hitMarkerContainer);
        this.elements.hitMarker = {
            container: hitMarkerContainer
        };
    }
    
    // 创建伤害指示器
    createDamageIndicator() {
        const damageIndicatorContainer = document.createElement('div');
        damageIndicatorContainer.className = 'damage-indicator-container';
        damageIndicatorContainer.style.display = 'none';
        
        this.container.appendChild(damageIndicatorContainer);
        this.elements.damageIndicator = {
            container: damageIndicatorContainer
        };
    }
    
    // 创建小地图
    createMinimap() {
        const minimapContainer = document.createElement('div');
        minimapContainer.className = 'minimap-container hud-element';
        
        const minimapTitle = document.createElement('div');
        minimapTitle.className = 'minimap-title';
        minimapTitle.textContent = '小地图';
        
        const minimapCanvas = document.createElement('canvas');
        minimapCanvas.className = 'minimap-canvas';
        minimapCanvas.width = 150;
        minimapCanvas.height = 150;
        
        minimapContainer.appendChild(minimapTitle);
        minimapContainer.appendChild(minimapCanvas);
        
        this.container.appendChild(minimapContainer);
        this.elements.minimap = {
            container: minimapContainer,
            canvas: minimapCanvas,
            context: minimapCanvas.getContext('2d')
        };
    }
    
    // 创建武器轮盘
    createWeaponWheel() {
        const weaponWheelContainer = document.createElement('div');
        weaponWheelContainer.className = 'weapon-wheel-container';
        weaponWheelContainer.style.display = 'none';
        
        const weaponWheelBackground = document.createElement('div');
        weaponWheelBackground.className = 'weapon-wheel-background';
        
        const weaponWheelItems = document.createElement('div');
        weaponWheelItems.className = 'weapon-wheel-items';
        
        // 创建武器槽位
        const weaponSlots = [];
        const slotCount = 8;
        const angleStep = (Math.PI * 2) / slotCount;
        
        for (let i = 0; i < slotCount; i++) {
            const slot = document.createElement('div');
            slot.className = 'weapon-wheel-slot';
            slot.dataset.index = i;
            
            // 计算位置
            const angle = i * angleStep - Math.PI / 2; // 从上方开始
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            slot.style.transform = `translate(${x}px, ${y}px)`;
            
            // 创建武器图标
            const weaponIcon = document.createElement('div');
            weaponIcon.className = 'weapon-icon';
            
            // 创建武器名称
            const weaponLabel = document.createElement('div');
            weaponLabel.className = 'weapon-label';
            
            slot.appendChild(weaponIcon);
            slot.appendChild(weaponLabel);
            weaponWheelItems.appendChild(slot);
            weaponSlots.push({
                container: slot,
                icon: weaponIcon,
                label: weaponLabel
            });
        }
        
        // 创建中心指示器
        const centerIndicator = document.createElement('div');
        centerIndicator.className = 'weapon-wheel-center';
        
        weaponWheelContainer.appendChild(weaponWheelBackground);
        weaponWheelContainer.appendChild(weaponWheelItems);
        weaponWheelContainer.appendChild(centerIndicator);
        
        this.container.appendChild(weaponWheelContainer);
        this.elements.weaponWheel = {
            container: weaponWheelContainer,
            slots: weaponSlots,
            center: centerIndicator
        };
    }
    
    // 创建游戏结束屏幕
    createGameOverScreen() {
        const gameOverContainer = document.createElement('div');
        gameOverContainer.className = 'game-over-container';
        gameOverContainer.style.display = 'none';
        
        const gameOverTitle = document.createElement('div');
        gameOverTitle.className = 'game-over-title';
        gameOverTitle.textContent = '游戏结束';
        
        const gameOverStats = document.createElement('div');
        gameOverStats.className = 'game-over-stats';
        
        const scoreRow = document.createElement('div');
        scoreRow.className = 'stat-row';
        scoreRow.innerHTML = '<span class="stat-label">最终分数:</span> <span class="stat-value score-value">0</span>';
        
        const killsRow = document.createElement('div');
        killsRow.className = 'stat-row';
        killsRow.innerHTML = '<span class="stat-label">总击杀:</span> <span class="stat-value kills-value">0</span>';
        
        const timeRow = document.createElement('div');
        timeRow.className = 'stat-row';
        timeRow.innerHTML = '<span class="stat-label">存活时间:</span> <span class="stat-value time-value">00:00</span>';
        
        const accuracyRow = document.createElement('div');
        accuracyRow.className = 'stat-row';
        accuracyRow.innerHTML = '<span class="stat-label">命中率:</span> <span class="stat-value accuracy-value">0%</span>';
        
        gameOverStats.appendChild(scoreRow);
        gameOverStats.appendChild(killsRow);
        gameOverStats.appendChild(timeRow);
        gameOverStats.appendChild(accuracyRow);
        
        const gameOverButtons = document.createElement('div');
        gameOverButtons.className = 'game-over-buttons';
        
        const restartButton = document.createElement('button');
        restartButton.className = 'game-button restart-button';
        restartButton.textContent = '重新开始';
        
        const mainMenuButton = document.createElement('button');
        mainMenuButton.className = 'game-button menu-button';
        mainMenuButton.textContent = '主菜单';
        
        gameOverButtons.appendChild(restartButton);
        gameOverButtons.appendChild(mainMenuButton);
        
        gameOverContainer.appendChild(gameOverTitle);
        gameOverContainer.appendChild(gameOverStats);
        gameOverContainer.appendChild(gameOverButtons);
        
        this.container.appendChild(gameOverContainer);
        this.elements.gameOverScreen = {
            container: gameOverContainer,
            title: gameOverTitle,
            stats: {
                score: scoreRow.querySelector('.score-value'),
                kills: killsRow.querySelector('.kills-value'),
                time: timeRow.querySelector('.time-value'),
                accuracy: accuracyRow.querySelector('.accuracy-value')
            },
            buttons: {
                restart: restartButton,
                mainMenu: mainMenuButton
            }
        };
    }
    
    // 创建暂停菜单
    createPauseMenu() {
        const pauseMenuContainer = document.createElement('div');
        pauseMenuContainer.className = 'pause-menu-container';
        pauseMenuContainer.style.display = 'none';
        
        const pauseMenuTitle = document.createElement('div');
        pauseMenuTitle.className = 'pause-menu-title';
        pauseMenuTitle.textContent = '游戏暂停';
        
        const pauseMenuButtons = document.createElement('div');
        pauseMenuButtons.className = 'pause-menu-buttons';
        
        const resumeButton = document.createElement('button');
        resumeButton.className = 'game-button resume-button';
        resumeButton.textContent = '继续游戏';
        
        const optionsButton = document.createElement('button');
        optionsButton.className = 'game-button options-button';
        optionsButton.textContent = '选项';
        
        const mainMenuButton = document.createElement('button');
        mainMenuButton.className = 'game-button menu-button';
        mainMenuButton.textContent = '返回主菜单';
        
        pauseMenuButtons.appendChild(resumeButton);
        pauseMenuButtons.appendChild(optionsButton);
        pauseMenuButtons.appendChild(mainMenuButton);
        
        pauseMenuContainer.appendChild(pauseMenuTitle);
        pauseMenuContainer.appendChild(pauseMenuButtons);
        
        this.container.appendChild(pauseMenuContainer);
        this.elements.pauseMenu = {
            container: pauseMenuContainer,
            buttons: {
                resume: resumeButton,
                options: optionsButton,
                mainMenu: mainMenuButton
            }
        };
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 游戏结束屏幕按钮
        if (this.elements.gameOverScreen) {
            // 重新开始按钮
            this.elements.gameOverScreen.buttons.restart.addEventListener('click', () => {
                if (window.gameStateManager) {
                    window.gameStateManager.restartGame();
                }
            });
            
            // 主菜单按钮
            this.elements.gameOverScreen.buttons.mainMenu.addEventListener('click', () => {
                if (window.gameStateManager) {
                    window.gameStateManager.returnToMainMenu();
                }
            });
        }
        
        // 暂停菜单按钮
        if (this.elements.pauseMenu) {
            // 继续游戏按钮
            this.elements.pauseMenu.buttons.resume.addEventListener('click', () => {
                if (window.gameStateManager) {
                    window.gameStateManager.resumeGame();
                }
            });
            
            // 选项按钮
            this.elements.pauseMenu.buttons.options.addEventListener('click', () => {
                if (window.gameStateManager) {
                    window.gameStateManager.showOptions();
                }
            });
            
            // 主菜单按钮
            this.elements.pauseMenu.buttons.mainMenu.addEventListener('click', () => {
                if (window.gameStateManager) {
                    window.gameStateManager.returnToMainMenu();
                }
            });
        }
    }

    // 更新HUD
    update(player, gameState, deltaTime) {
        // 更新生命值
        this.updateHealth(player.health, player.maxHealth);
        
        // 更新护甲
        this.updateArmor(player.armor, player.maxArmor);
        
        // 更新弹药
        if (window.weaponManager && window.weaponManager.currentWeapon) {
            const weapon = window.weaponManager.currentWeapon;
            this.updateAmmo(weapon.currentAmmo, weapon.reserveAmmo);
            this.updateWeaponName(weapon.config.name);
        }
        
        // 更新分数和击杀
        if (window.gameStateManager) {
            this.updateScore(window.gameStateManager.stats.score);
            this.updateKills(window.gameStateManager.stats.kills);
        }
        
        // 更新小地图
        this.updateMinimap(player);
        
        // 更新命中标记
        if (this.hitMarkerTimer > 0) {
            this.hitMarkerTimer -= deltaTime;
            
            if (this.hitMarkerTimer <= 0) {
                this.hideHitMarker();
            }
        }
        
        // 更新伤害指示器
        if (this.damageIndicatorTimer > 0) {
            this.damageIndicatorTimer -= deltaTime;
            
            if (this.damageIndicatorTimer <= 0) {
                this.hideDamageIndicator();
            }
        }
        
        // 更新通知
        this.updateNotifications(deltaTime);
    }
    
    // 更新生命值
    updateHealth(health, maxHealth) {
        if (!this.elements.health) return;
        
        // 更新生命值文本
        this.elements.health.text.textContent = Math.floor(health);
        
        // 更新生命值条
        const healthPercentage = (health / maxHealth) * 100;
        this.elements.health.bar.style.width = `${healthPercentage}%`;
        
        // 根据生命值设置颜色
        if (healthPercentage < 25) {
            this.elements.health.bar.style.backgroundColor = '#ff0000'; // 红色
        } else if (healthPercentage < 50) {
            this.elements.health.bar.style.backgroundColor = '#ff8800'; // 橙色
        } else {
            this.elements.health.bar.style.backgroundColor = '#00ff00'; // 绿色
        }
    }
    
    // 更新护甲
    updateArmor(armor, maxArmor) {
        if (!this.elements.armor) return;
        
        // 更新护甲文本
        this.elements.armor.text.textContent = Math.floor(armor);
        
        // 更新护甲条
        const armorPercentage = (armor / maxArmor) * 100;
        this.elements.armor.bar.style.width = `${armorPercentage}%`;
    }
    
    // 更新弹药
    updateAmmo(currentAmmo, reserveAmmo) {
        if (!this.elements.ammo) return;
        
        // 更新当前弹药
        this.elements.ammo.current.textContent = currentAmmo;
        
        // 更新后备弹药
        this.elements.ammo.max.textContent = reserveAmmo;
        
        // 如果弹药不足，显示红色
        if (currentAmmo === 0) {
            this.elements.ammo.current.style.color = '#ff0000';
        } else if (currentAmmo <= 5) {
            this.elements.ammo.current.style.color = '#ff8800';
        } else {
            this.elements.ammo.current.style.color = '#ffffff';
        }
    }
    
    // 更新武器名称
    updateWeaponName(name) {
        if (!this.elements.weaponName) return;
        
        this.elements.weaponName.text.textContent = name;
    }
    
    // 更新分数
    updateScore(score) {
        if (!this.elements.score) return;
        
        this.elements.score.text.textContent = score;
    }
    
    // 更新击杀数
    updateKills(kills) {
        if (!this.elements.kills) return;
        
        this.elements.kills.text.textContent = kills;
    }
    
    // 更新目标
    updateObjectives(objectives) {
        if (!this.elements.objectives) return;
        
        // 清空目标列表
        this.elements.objectives.list.innerHTML = '';
        
        // 添加新目标
        objectives.forEach(objective => {
            const objectiveItem = document.createElement('div');
            objectiveItem.className = 'objective-item';
            
            // 根据完成状态设置样式
            if (objective.completed) {
                objectiveItem.classList.add('completed');
            }
            
            // 创建目标图标
            const objectiveIcon = document.createElement('div');
            objectiveIcon.className = 'objective-icon';
            
            // 创建目标文本
            const objectiveText = document.createElement('div');
            objectiveText.className = 'objective-text';
            objectiveText.textContent = objective.text;
            
            // 创建目标进度（如果有）
            if (objective.current !== undefined && objective.target !== undefined) {
                const objectiveProgress = document.createElement('div');
                objectiveProgress.className = 'objective-progress';
                objectiveProgress.textContent = `${objective.current}/${objective.target}`;
                objectiveItem.appendChild(objectiveProgress);
            }
            
            objectiveItem.appendChild(objectiveIcon);
            objectiveItem.appendChild(objectiveText);
            
            this.elements.objectives.list.appendChild(objectiveItem);
        });
    }
    
    // 添加通知
    addNotification(text, type = 'info', duration = 3) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = text;
        
        // 添加到通知容器
        this.elements.notifications.container.appendChild(notification);
        
        // 添加到通知队列
        this.notifications.push({
            element: notification,
            duration: duration,
            timer: 0
        });
        
        // 显示通知（淡入效果）
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 播放通知音效
        if (window.soundManager) {
            window.soundManager.playSound(`notification_${type}`);
        }
    }
    
    // 更新通知
    updateNotifications(deltaTime) {
        // 更新所有通知计时器
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            
            // 增加计时器
            notification.timer += deltaTime;
            
            // 如果超过持续时间，移除通知
            if (notification.timer >= notification.duration) {
                // 淡出效果
                notification.element.classList.remove('show');
                
                // 延迟后移除元素
                setTimeout(() => {
                    if (notification.element.parentNode) {
                        notification.element.parentNode.removeChild(notification.element);
                    }
                }, 500);
                
                // 从队列中移除
                this.notifications.splice(i, 1);
            }
        }
    }
    
    // 显示命中标记
    showHitMarker(isHeadshot = false) {
        if (!this.elements.hitMarker) return;
        
        // 显示命中标记
        this.elements.hitMarker.container.style.display = 'block';
        
        // 如果是爆头，设置特殊样式
        if (isHeadshot) {
            this.elements.hitMarker.container.classList.add('headshot');
        } else {
            this.elements.hitMarker.container.classList.remove('headshot');
        }
        
        // 设置计时器
        this.hitMarkerTimer = 0.3; // 显示0.3秒
        
        // 播放命中音效
        if (window.soundManager) {
            window.soundManager.playSound(isHeadshot ? 'hitmarker_headshot' : 'hitmarker');
        }
    }
    
    // 隐藏命中标记
    hideHitMarker() {
        if (!this.elements.hitMarker) return;
        
        this.elements.hitMarker.container.style.display = 'none';
    }
    
    // 显示伤害指示器
    showDamageIndicator(direction) {
        if (!this.elements.damageIndicator) return;
        
        // 显示伤害指示器
        this.elements.damageIndicator.container.style.display = 'block';
        
        // 根据伤害方向旋转指示器
        const angle = Math.atan2(direction.x, direction.z) * (180 / Math.PI);
        this.elements.damageIndicator.container.style.transform = `rotate(${angle}deg)`;
        
        // 设置计时器
        this.damageIndicatorTimer = 0.5; // 显示0.5秒
    }
    
    // 隐藏伤害指示器
    hideDamageIndicator() {
        if (!this.elements.damageIndicator) return;
        
        this.elements.damageIndicator.container.style.display = 'none';
    }
    
    // 更新小地图
    updateMinimap(player) {
        if (!this.elements.minimap || !this.elements.minimap.context) return;
        
        const ctx = this.elements.minimap.context;
        const canvas = this.elements.minimap.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
        
        // 获取世界大小
        const worldSize = GameConfig.world.size;
        
        // 计算缩放比例
        const scale = width / (worldSize * 2);
        
        // 绘制玩家
        const playerX = (player.position.x + worldSize) * scale;
        const playerZ = (player.position.z + worldSize) * scale;
        
        // 绘制玩家方向
        const directionLength = 10;
        const dirX = Math.sin(player.rotation.y) * directionLength;
        const dirZ = Math.cos(player.rotation.y) * directionLength;
        
        // 绘制玩家点
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(playerX, playerZ, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制玩家方向
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(playerX, playerZ);
        ctx.lineTo(playerX + dirX, playerZ + dirZ);
        ctx.stroke();
        
        // 绘制敌人
        if (window.enemyManager && window.enemyManager.enemies) {
            window.enemyManager.enemies.forEach(enemy => {
                if (enemy.isAlive) {
                    const enemyX = (enemy.position.x + worldSize) * scale;
                    const enemyZ = (enemy.position.z + worldSize) * scale;
                    
                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath();
                    ctx.arc(enemyX, enemyZ, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
        
        // 绘制物品
        if (window.itemManager && window.itemManager.items) {
            window.itemManager.items.forEach(item => {
                if (item.isActive) {
                    const itemX = (item.position.x + worldSize) * scale;
                    const itemZ = (item.position.z + worldSize) * scale;
                    
                    // 根据物品类型设置颜色
                    let color;
                    switch (item.type) {
                        case 'healthPack':
                            color = '#ff0000';
                            break;
                        case 'armorPack':
                            color = '#0000ff';
                            break;
                        case 'ammoPack':
                            color = '#ffff00';
                            break;
                        case 'grenadePack':
                            color = '#00ff00';
                            break;
                        default:
                            color = '#ffffff';
                    }
                    
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.rect(itemX - 2, itemZ - 2, 4, 4);
                    ctx.fill();
                }
            });
        }
    }
    
    // 显示武器轮盘
    showWeaponWheel(weapons, currentWeaponType) {
        if (!this.elements.weaponWheel) return;
        
        // 显示武器轮盘
        this.elements.weaponWheel.container.style.display = 'block';
        
        // 更新武器槽位
        const slots = this.elements.weaponWheel.slots;
        const weaponTypes = Object.keys(weapons);
        
        // 清空所有槽位
        slots.forEach(slot => {
            slot.container.classList.remove('active');
            slot.container.classList.remove('selected');
            slot.icon.style.backgroundImage = '';
            slot.label.textContent = '';
        });
        
        // 填充可用武器
        weaponTypes.forEach((type, index) => {
            if (index < slots.length) {
                const weapon = weapons[type];
                const slot = slots[index];
                
                // 设置武器图标
                if (weapon.icon) {
                    slot.icon.style.backgroundImage = `url(${weapon.icon})`;
                }
                
                // 设置武器名称
                slot.label.textContent = weapon.name;
                
                // 标记可用
                slot.container.classList.add('active');
                
                // 如果是当前武器，标记选中
                if (type === currentWeaponType) {
                    slot.container.classList.add('selected');
                }
                
                // 存储武器类型
                slot.container.dataset.weaponType = type;
            }
        });
    }
    
    // 隐藏武器轮盘
    hideWeaponWheel() {
        if (!this.elements.weaponWheel) return;
        
        this.elements.weaponWheel.container.style.display = 'none';
    }
    
    // 获取选中的武器类型
    getSelectedWeaponType(mouseX, mouseY) {
        if (!this.elements.weaponWheel) return null;
        
        // 获取武器轮盘中心位置
        const wheelRect = this.elements.weaponWheel.container.getBoundingClientRect();
        const centerX = wheelRect.left + wheelRect.width / 2;
        const centerY = wheelRect.top + wheelRect.height / 2;
        
        // 计算鼠标相对于中心的位置
        const relX = mouseX - centerX;
        const relY = mouseY - centerY;
        
        // 计算角度（弧度）
        let angle = Math.atan2(relY, relX);
        
        // 转换为0-2π范围
        if (angle < 0) {
            angle += Math.PI * 2;
        }
        
        // 计算距离
        const distance = Math.sqrt(relX * relX + relY * relY);
        
        // 如果距离太小，没有选中任何武器
        if (distance < 30) {
            return null;
        }
        
        // 计算选中的槽位索引
        const slotCount = this.elements.weaponWheel.slots.length;
        const slotAngle = (Math.PI * 2) / slotCount;
        const slotIndex = Math.floor(((angle + slotAngle / 2) % (Math.PI * 2)) / slotAngle);
        
        // 获取选中的槽位
        const selectedSlot = this.elements.weaponWheel.slots[slotIndex];
        
        // 如果槽位不活跃，返回null
        if (!selectedSlot.container.classList.contains('active')) {
            return null;
        }
        
        // 返回武器类型
        return selectedSlot.container.dataset.weaponType;
    }
    
    // 显示游戏结束屏幕
    showGameOverScreen(stats) {
        if (!this.elements.gameOverScreen) return;
        
        // 更新统计信息
        this.elements.gameOverScreen.stats.score.textContent = stats.score;
        this.elements.gameOverScreen.stats.kills.textContent = stats.kills;
        
        // 格式化时间
        const minutes = Math.floor(stats.time / 60);
        const seconds = Math.floor(stats.time % 60);
        this.elements.gameOverScreen.stats.time.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 计算命中率
        const accuracy = stats.shots > 0 ? Math.floor((stats.hits / stats.shots) * 100) : 0;
        this.elements.gameOverScreen.stats.accuracy.textContent = `${accuracy}%`;
        
        // 显示游戏结束屏幕
        this.elements.gameOverScreen.container.style.display = 'flex';
    }
    
    // 隐藏游戏结束屏幕
    hideGameOverScreen() {
        if (!this.elements.gameOverScreen) return;
        
        this.elements.gameOverScreen.container.style.display = 'none';
    }
    
    // 显示暂停菜单
    showPauseMenu() {
        if (!this.elements.pauseMenu) return;
        
        this.elements.pauseMenu.container.style.display = 'flex';
    }
    
    // 隐藏暂停菜单
    hidePauseMenu() {
        if (!this.elements.pauseMenu) return;
        
        this.elements.pauseMenu.container.style.display = 'none';
    }
    
    // 显示元素
    showElement(elementName) {
        if (!this.elements[elementName]) return;
        
        this.elements[elementName].container.style.display = 'block';
    }
    
    // 隐藏元素
    hideElement(elementName) {
        if (!this.elements[elementName]) return;
        
        this.elements[elementName].container.style.display = 'none';
    }
    
    // 设置准星扩散
    setCrosshairSpread(spread) {
        if (!this.elements.crosshair) return;
        
        // 限制扩散范围
        const clampedSpread = Math.max(0, Math.min(50, spread));
        
        // 更新准星线条位置
        const lines = this.elements.crosshair.lines;
        const baseOffset = 5; // 基础偏移
        
        // 上
        lines[0].style.transform = `translateY(${-(baseOffset + clampedSpread)}px)`;
        
        // 右
        lines[1].style.transform = `translateX(${baseOffset + clampedSpread}px)`;
        
        // 下
        lines[2].style.transform = `translateY(${baseOffset + clampedSpread}px)`;
        
        // 左
        lines[3].style.transform = `translateX(${-(baseOffset + clampedSpread)}px)`;
    }
}
