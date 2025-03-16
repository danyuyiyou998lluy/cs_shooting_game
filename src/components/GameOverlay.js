// 游戏叠加层组件

// 游戏叠加层组件 - 显示游戏菜单、暂停、游戏结束等状态
class GameOverlay extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        const { gameState, score, onStart, onResume, onRestart, onMenu } = this.props;
        
        // 加载屏幕
        if (gameState === GameState.LOADING) {
            return (
                <div className="loading-screen">
                    <h1 className="loading-text">加载中...</h1>
                    <div className="loading-bar-container">
                        <div className="loading-bar" style={{ width: `${this.props.loadingProgress}%` }}></div>
                    </div>
                </div>
            );
        }
        
        // 主菜单
        if (gameState === GameState.MENU) {
            return (
                <div className="game-menu">
                    <h1 className="menu-title">CS射击游戏</h1>
                    <button className="menu-button" onClick={() => onStart('easy')}>简单模式</button>
                    <button className="menu-button" onClick={() => onStart('normal')}>普通模式</button>
                    <button className="menu-button" onClick={() => onStart('hard')}>困难模式</button>
                </div>
            );
        }
        
        // 暂停菜单
        if (gameState === GameState.PAUSED) {
            return (
                <div className="game-menu">
                    <h1 className="menu-title">游戏暂停</h1>
                    <button className="menu-button" onClick={onResume}>继续游戏</button>
                    <button className="menu-button" onClick={onRestart}>重新开始</button>
                    <button className="menu-button" onClick={onMenu}>返回主菜单</button>
                </div>
            );
        }
        
        // 游戏结束
        if (gameState === GameState.GAME_OVER) {
            return (
                <div className="game-over">
                    <h1 className="game-over-title">游戏结束</h1>
                    <p className="final-score">最终得分: {score}</p>
                    <button className="menu-button" onClick={onRestart}>再来一局</button>
                    <button className="menu-button" onClick={onMenu}>返回主菜单</button>
                </div>
            );
        }
        
        // 游戏进行中，不显示叠加层
        return null;
    }
}
