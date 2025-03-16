import Game from './game/core/Game.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 创建开始游戏按钮
    const startButton = document.createElement('button');
    startButton.textContent = '开始游戏';
    startButton.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 15px 30px;
        font-size: 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    `;
    
    // 添加悬停效果
    startButton.addEventListener('mouseover', () => {
        startButton.style.backgroundColor = '#45a049';
    });
    
    startButton.addEventListener('mouseout', () => {
        startButton.style.backgroundColor = '#4CAF50';
    });
    
    // 添加点击事件
    startButton.addEventListener('click', () => {
        // 移除按钮
        startButton.remove();
        
        // 添加游戏说明
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 5px;
            text-align: center;
            font-family: Arial, sans-serif;
        `;
        
        instructions.innerHTML = `
            <h2>游戏控制说明</h2>
            <p>WASD - 移动</p>
            <p>鼠标 - 视角控制</p>
            <p>左键 - 射击</p>
            <p>1/2/3 - 切换武器</p>
            <p>R - 装弹</p>
            <p>ESC - 退出鼠标锁定</p>
            <br>
            <p>点击屏幕开始游戏</p>
        `;
        
        document.body.appendChild(instructions);
        
        // 点击任意位置开始游戏
        const startGame = () => {
            instructions.remove();
            new Game();
        };
        
        document.addEventListener('click', startGame, { once: true });
    });
    
    document.body.appendChild(startButton);
});
