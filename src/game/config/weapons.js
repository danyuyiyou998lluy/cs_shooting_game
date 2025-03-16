export const weapons = {
    pistol: {
        name: "手枪",
        damage: 25,
        fireRate: 2, // 每秒射击次数
        spread: 0.02, // 散布度
        magazineSize: 12, // 弹匣容量
        reloadTime: 1.5, // 装弹时间（秒）
        model: {
            size: {
                x: 0.2,  // 增大尺寸
                y: 0.25, // 增大尺寸
                z: 0.4   // 增大尺寸
            },
            color: 0x555555,
            barrel: {
                radius: 0.03,  // 增大尺寸
                length: 0.3    // 增大尺寸
            }
        }
    },
    rifle: {
        name: "步枪",
        damage: 30,
        fireRate: 8,
        spread: 0.05,
        magazineSize: 30,
        reloadTime: 2.0,
        model: {
            size: {
                x: 0.2,  // 增大尺寸
                y: 0.25, // 增大尺寸
                z: 0.8   // 增大尺寸
            },
            color: 0x444444,
            barrel: {
                radius: 0.04,  // 增大尺寸
                length: 0.6    // 增大尺寸
            }
        }
    },
    shotgun: {
        name: "霰弹枪",
        damage: 15,
        fireRate: 1,
        spread: 0.2,
        magazineSize: 8,
        reloadTime: 2.5,
        pellets: 8, // 每次射击的弹丸数量
        model: {
            size: {
                x: 0.2,  // 增大尺寸
                y: 0.25, // 增大尺寸
                z: 0.7   // 增大尺寸
            },
            color: 0x8B4513, // 棕色
            barrel: {
                radius: 0.05,  // 增大尺寸
                length: 0.5    // 增大尺寸
            }
        }
    }
};
