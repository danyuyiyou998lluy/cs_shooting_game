// 游戏UI组件

// 游戏UI组件 - 显示生命值、弹药和分数
class GameUI extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        const { health, score, currentWeapon, ammo, weapons, onWeaponSwitch } = this.props;
        
        return (
            <div className="game-ui">
                {/* 生命值条 */}
                <div className="health-bar">
                    <div className="health-fill" style={{ width: `${health}%` }}></div>
                </div>
                
                {/* 弹药计数器 */}
                <div className="ammo-counter">
                    {ammo.current} / {ammo.reserve}
                </div>
                
                {/* 分数显示 */}
                <div className="score-display">
                    分数: {score}
                </div>
                
                {/* 准星 */}
                <div className="crosshair">+</div>
                
                {/* 武器选择器 */}
                <div className="weapon-selector">
                    <div 
                        className={`weapon-item ${currentWeapon === 'pistol' ? 'active' : ''}`}
                        onClick={() => onWeaponSwitch('pistol')}
                    >
                        {weapons.pistol.icon} 1
                    </div>
                    <div 
                        className={`weapon-item ${currentWeapon === 'rifle' ? 'active' : ''}`}
                        onClick={() => onWeaponSwitch('rifle')}
                    >
                        {weapons.rifle.icon} 2
                    </div>
                    <div 
                        className={`weapon-item ${currentWeapon === 'shotgun' ? 'active' : ''}`}
                        onClick={() => onWeaponSwitch('shotgun')}
                    >
                        {weapons.shotgun.icon} 3
                    </div>
                </div>
            </div>
        );
    }
}
