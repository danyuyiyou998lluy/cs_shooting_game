import * as THREE from 'three';
import Particle from './Particle';

class ParticleSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        
        // 粒子池
        this.maxParticles = options.maxParticles || 1000;
        this.particles = [];
        this.particlePool = [];
        
        // 创建几何体
        this.geometry = new THREE.BufferGeometry();
        
        // 创建材质
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: options.texture || null }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 customColor;
                attribute float opacity;
                attribute float rotation;
                
                varying vec3 vColor;
                varying float vOpacity;
                varying float vRotation;
                
                void main() {
                    vColor = customColor;
                    vOpacity = opacity;
                    vRotation = rotation;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (300.0 / length(mvPosition.xyz));
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                
                varying vec3 vColor;
                varying float vOpacity;
                varying float vRotation;
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    vec2 uv = gl_PointCoord - center;
                    float c = cos(vRotation);
                    float s = sin(vRotation);
                    mat2 rotationMatrix = mat2(c, -s, s, c);
                    uv = rotationMatrix * uv;
                    uv += center;
                    
                    vec4 color = vec4(vColor, vOpacity) * texture2D(pointTexture, uv);
                    if (color.a < 0.1) discard;
                    gl_FragColor = color;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });
        
        // 创建点云系统
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        
        // 创建缓冲区属性
        this.positions = new Float32Array(this.maxParticles * 3);
        this.colors = new Float32Array(this.maxParticles * 3);
        this.sizes = new Float32Array(this.maxParticles);
        this.opacities = new Float32Array(this.maxParticles);
        this.rotations = new Float32Array(this.maxParticles);
        
        // 设置缓冲区属性
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('customColor', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        this.geometry.setAttribute('opacity', new THREE.BufferAttribute(this.opacities, 1));
        this.geometry.setAttribute('rotation', new THREE.BufferAttribute(this.rotations, 1));
        
        // 设置默认纹理
        if (!options.texture) {
            this.setDefaultTexture();
        }
    }
    
    // 设置默认粒子纹理
    setDefaultTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.material.uniforms.pointTexture.value = texture;
    }
    
    // 创建粒子
    createParticle(options = {}) {
        let particle;
        
        // 从粒子池中获取或创建新粒子
        if (this.particlePool.length > 0) {
            particle = this.particlePool.pop();
            particle.reset(options);
        } else if (this.particles.length < this.maxParticles) {
            particle = new Particle(options);
            this.particles.push(particle);
        } else {
            return null;
        }
        
        return particle;
    }
    
    // 发射粒子
    emit(options = {}) {
        const {
            count = 1,
            position = new THREE.Vector3(),
            velocity,
            spread = 0,
            ...particleOptions
        } = options;
        
        for (let i = 0; i < count; i++) {
            // 计算发射方向
            let finalVelocity;
            if (velocity) {
                finalVelocity = velocity.clone();
                if (spread > 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * spread;
                    finalVelocity.x += Math.cos(angle) * radius;
                    finalVelocity.y += Math.sin(angle) * radius;
                }
            }
            
            // 创建粒子
            this.createParticle({
                position: position.clone(),
                velocity: finalVelocity,
                ...particleOptions
            });
        }
    }
    
    // 更新粒子系统
    update(deltaTime) {
        let activeCount = 0;
        
        // 更新所有粒子
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            if (particle.active) {
                // 更新粒子
                particle.update(deltaTime);
                
                // 更新缓冲区数据
                const i3 = activeCount * 3;
                
                this.positions[i3] = particle.position.x;
                this.positions[i3 + 1] = particle.position.y;
                this.positions[i3 + 2] = particle.position.z;
                
                this.colors[i3] = particle.color.r;
                this.colors[i3 + 1] = particle.color.g;
                this.colors[i3 + 2] = particle.color.b;
                
                this.sizes[activeCount] = particle.size;
                this.opacities[activeCount] = particle.opacity;
                this.rotations[activeCount] = particle.rotation;
                
                activeCount++;
            } else {
                // 将非活跃粒子放入粒子池
                this.particlePool.push(particle);
            }
        }
        
        // 更新几何体
        this.geometry.setDrawRange(0, activeCount);
        
        // 标记缓冲区需要更新
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.customColor.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.opacity.needsUpdate = true;
        this.geometry.attributes.rotation.needsUpdate = true;
    }
    
    // 创建爆炸效果
    createExplosion(position, options = {}) {
        const defaultOptions = {
            count: 50,
            spread: 2,
            velocity: new THREE.Vector3(0, 2, 0),
            color: new THREE.Color(1, 0.5, 0),
            endColor: new THREE.Color(1, 0, 0),
            size: 0.5,
            endSize: 0.1,
            life: 1,
            opacity: 1,
            endOpacity: 0
        };
        
        this.emit({
            ...defaultOptions,
            ...options,
            position
        });
    }
    
    // 创建枪口火焰效果
    createMuzzleFlash(position, direction, options = {}) {
        const defaultOptions = {
            count: 20,
            spread: 0.2,
            velocity: direction.clone().multiplyScalar(10),
            color: new THREE.Color(1, 0.8, 0),
            endColor: new THREE.Color(1, 0.3, 0),
            size: 0.3,
            endSize: 0.1,
            life: 0.1,
            opacity: 1,
            endOpacity: 0
        };
        
        this.emit({
            ...defaultOptions,
            ...options,
            position
        });
    }
    
    // 创建血液喷溅效果
    createBloodSplatter(position, normal, options = {}) {
        const defaultOptions = {
            count: 30,
            spread: 1,
            velocity: normal.clone().multiplyScalar(5),
            color: new THREE.Color(0.8, 0, 0),
            endColor: new THREE.Color(0.4, 0, 0),
            size: 0.2,
            endSize: 0.05,
            life: 0.5,
            opacity: 1,
            endOpacity: 0,
            gravity: new THREE.Vector3(0, -15, 0)
        };
        
        this.emit({
            ...defaultOptions,
            ...options,
            position
        });
    }
    
    // 创建脚步灰尘效果
    createFootstepDust(position, options = {}) {
        const defaultOptions = {
            count: 10,
            spread: 0.3,
            velocity: new THREE.Vector3(0, 1, 0),
            color: new THREE.Color(0.5, 0.5, 0.5),
            endColor: new THREE.Color(0.3, 0.3, 0.3),
            size: 0.2,
            endSize: 0.4,
            life: 0.5,
            opacity: 0.5,
            endOpacity: 0
        };
        
        this.emit({
            ...defaultOptions,
            ...options,
            position
        });
    }
    
    // 创建子弹轨迹效果
    createBulletTrail(start, end, options = {}) {
        const direction = end.clone().sub(start);
        const distance = direction.length();
        direction.normalize();
        
        const defaultOptions = {
            count: Math.ceil(distance * 5),
            spread: 0.05,
            velocity: direction.clone().multiplyScalar(distance * 2),
            color: new THREE.Color(1, 0.8, 0),
            endColor: new THREE.Color(1, 0.5, 0),
            size: 0.1,
            endSize: 0.05,
            life: 0.2,
            opacity: 0.5,
            endOpacity: 0
        };
        
        this.emit({
            ...defaultOptions,
            ...options,
            position: start
        });
    }
    
    // 创建烟雾效果
    createSmoke(position, options = {}) {
        const defaultOptions = {
            count: 20,
            spread: 0.5,
            velocity: new THREE.Vector3(0, 2, 0),
            color: new THREE.Color(0.7, 0.7, 0.7),
            endColor: new THREE.Color(0.4, 0.4, 0.4),
            size: 1,
            endSize: 2,
            life: 2,
            opacity: 0.5,
            endOpacity: 0,
            rotationSpeed: Math.PI / 4
        };
        
        this.emit({
            ...defaultOptions,
            ...options,
            position
        });
    }
    
    // 销毁粒子系统
    dispose() {
        this.scene.remove(this.points);
        this.geometry.dispose();
        this.material.dispose();
        if (this.material.uniforms.pointTexture.value) {
            this.material.uniforms.pointTexture.value.dispose();
        }
    }
}

export default ParticleSystem;
