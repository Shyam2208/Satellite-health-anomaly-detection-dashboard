/**
 * 3D Satellite Visualization System
 * Creates immersive real-time 3D representation of satellite status
 */

class Satellite3DVisualization {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.satellite = null;
        this.subsystemComponents = {};
        this.particles = null;
        this.animationId = null;
        this.isInitialized = false;
        
        // Satellite components
        this.components = {
            body: null,
            solarPanels: [],
            antenna: null,
            radiator: null,
            battery: null,
            processor: null
        };
        
        // Status colors
        this.statusColors = {
            normal: 0x10b981,
            warning: 0xf59e0b,
            critical: 0xef4444
        };
        
        // Animation parameters
        this.rotationSpeed = 0.005;
        this.solarPanelRotation = 0;
        
        // Initialize when DOM is ready
        this.initialize();
    }
    
    initialize() {
        const container = document.getElementById('satellite3d');
        if (!container) {
            console.warn('3D container not found');
            return;
        }
        
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not available, using fallback 2D visualization');
            this.initializeFallback();
            return;
        }
        
        console.log('Initializing 3D satellite visualization...');
        
        // Setup Three.js scene
        this.setupScene(container);
        
        // Create satellite model
        this.createSatelliteModel();
        
        // Setup lighting
        this.setupLighting();
        
        // Add space environment
        this.createSpaceEnvironment();
        
        // Setup controls
        this.setupControls();
        
        // Start animation loop
        this.startAnimation();
        
        // Listen for telemetry updates
        this.setupTelemetryListener();
        
        this.isInitialized = true;
        console.log('3D satellite visualization initialized successfully');
    }
    
    initializeFallback() {
        console.log('Initializing 2D fallback satellite visualization...');
        
        // Show fallback 2D visualization
        const fallback = document.getElementById('fallback-satellite');
        if (fallback) {
            fallback.classList.remove('hidden');
        }
        
        // Setup fallback telemetry listener
        window.addEventListener('telemetryUpdate', (event) => {
            this.updateFallbackVisualization(event.detail);
        });
        
        this.isInitialized = true;
        this.isFallback = true;
        console.log('2D fallback satellite visualization ready');
    }
    
    updateFallbackVisualization(telemetryData) {
        if (!this.isFallback) return;
        
        // Update 2D satellite status indicators
        this.updateFallbackStatus('status-power', telemetryData.power.battery.status);
        this.updateFallbackStatus('status-thermal', telemetryData.thermal.status);
        this.updateFallbackStatus('status-comm', telemetryData.communication.status);
        this.updateFallbackStatus('status-solar', telemetryData.power.solar.status);
        
        // Update battery indicator color
        const batteryIndicator = document.getElementById('battery-indicator');
        if (batteryIndicator) {
            const capacity = telemetryData.power.battery.capacity;
            if (capacity > 80) {
                batteryIndicator.setAttribute('fill', '#00ff00');
            } else if (capacity > 60) {
                batteryIndicator.setAttribute('fill', '#ffff00');
            } else {
                batteryIndicator.setAttribute('fill', '#ff0000');
            }
        }
        
        // Update solar panel colors based on power generation
        const solarLeft = document.getElementById('solar-left');
        const solarRight = document.getElementById('solar-right');
        if (solarLeft && solarRight) {
            const efficiency = telemetryData.power.solar.efficiency;
            const color = efficiency > 85 ? '#0066cc' : efficiency > 70 ? '#ff8800' : '#ff0000';
            solarLeft.setAttribute('stroke', color);
            solarRight.setAttribute('stroke', color);
        }
    }
    
    updateFallbackStatus(elementId, status) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let color = '#00ff00'; // Normal - green
        if (status === 'warning') {
            color = '#ffff00'; // Warning - yellow
        } else if (status === 'critical') {
            color = '#ff0000'; // Critical - red
        }
        
        element.setAttribute('fill', color);
        
        // Add pulse effect for critical status
        if (status === 'critical') {
            element.classList.add('pulse');
        } else {
            element.classList.remove('pulse');
        }
    }
    
    setupScene(container) {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000010);
        
        // Create camera
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(5, 3, 5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        
        container.appendChild(this.renderer.domElement);
        
        // Handle resize
        window.addEventListener('resize', () => {
            const newAspect = container.clientWidth / container.clientHeight;
            this.camera.aspect = newAspect;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }
    
    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(10, 10, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 50;
        sunLight.shadow.camera.left = -10;
        sunLight.shadow.camera.right = 10;
        sunLight.shadow.camera.top = 10;
        sunLight.shadow.camera.bottom = -10;
        this.scene.add(sunLight);
        
        // Point light for Earth reflection
        const earthLight = new THREE.PointLight(0x4080ff, 0.5);
        earthLight.position.set(-8, -5, 0);
        this.scene.add(earthLight);
        
        // Add lens flare for sun effect
        this.addLensFlare(sunLight);
    }
    
    addLensFlare(light) {
        // Simplified lens flare effect using sprites
        const flareGeometry = new THREE.CircleGeometry(0.5, 16);
        const flareMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const flare = new THREE.Mesh(flareGeometry, flareMaterial);
        flare.position.copy(light.position);
        this.scene.add(flare);
    }
    
    createSpaceEnvironment() {
        // Create starfield
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 10000;
        const positions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = (Math.random() - 0.5) * 2000;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
        
        // Add Earth in background
        this.createEarth();
        
        // Add space particles effect
        this.createSpaceParticles();
    }
    
    createEarth() {
        const earthGeometry = new THREE.SphereGeometry(20, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x4080ff,
            transparent: true,
            opacity: 0.3
        });
        
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.position.set(-50, -30, -100);
        this.scene.add(earth);
        
        // Add Earth atmosphere glow
        const glowGeometry = new THREE.SphereGeometry(22, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                c: { type: 'f', value: 1.0 },
                p: { type: 'f', value: 1.4 },
                glowColor: { type: 'c', value: new THREE.Color(0x4080ff) },
                viewVector: { type: 'v3', value: this.camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(c - dot(vNormal, vNormel), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        const earthGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        earthGlow.position.copy(earth.position);
        this.scene.add(earthGlow);
    }
    
    createSpaceParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;
            
            velocities[i] = (Math.random() - 0.5) * 0.02;
            velocities[i + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }
    
    createSatelliteModel() {
        // Create satellite group
        this.satellite = new THREE.Group();
        
        // Main satellite body
        this.createSatelliteBody();
        
        // Solar panels
        this.createSolarPanels();
        
        // Communication antenna
        this.createAntenna();
        
        // Thermal radiator
        this.createRadiator();
        
        // Internal components (visible through wireframe)
        this.createInternalComponents();
        
        // Add satellite to scene
        this.scene.add(this.satellite);
        
        // Position satellite at origin
        this.satellite.position.set(0, 0, 0);
    }
    
    createSatelliteBody() {
        // Main body - rectangular prism
        const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 1);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            shininess: 100
        });
        
        this.components.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.components.body.castShadow = true;
        this.components.body.receiveShadow = true;
        this.satellite.add(this.components.body);
        
        // Add body details
        this.addBodyDetails();
    }
    
    addBodyDetails() {
        // Add surface panels
        const panelGeometry = new THREE.PlaneGeometry(0.3, 0.3);
        const panelMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        // Front panel
        const frontPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        frontPanel.position.set(0, 0, 0.51);
        this.components.body.add(frontPanel);
        
        // Add antenna mounts
        const mountGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2);
        const mountMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        
        for (let i = 0; i < 4; i++) {
            const mount = new THREE.Mesh(mountGeometry, mountMaterial);
            const angle = (i * Math.PI) / 2;
            mount.position.set(Math.cos(angle) * 0.8, 0.8, Math.sin(angle) * 0.3);
            this.components.body.add(mount);
        }
    }
    
    createSolarPanels() {
        // Create two main solar panel arrays
        for (let i = 0; i < 2; i++) {
            const panelGroup = new THREE.Group();
            
            // Panel geometry
            const panelGeometry = new THREE.BoxGeometry(3, 0.05, 1.5);
            const panelMaterial = new THREE.MeshPhongMaterial({
                color: 0x001133,
                shininess: 50
            });
            
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panelGroup.add(panel);
            
            // Add solar cell details
            this.addSolarCellDetails(panel);
            
            // Position panels on sides
            const side = i === 0 ? -1 : 1;
            panelGroup.position.set(side * 2.5, 0, 0);
            
            // Add hinge for rotation
            const hingeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
            const hingeMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const hinge = new THREE.Mesh(hingeGeometry, hingeMaterial);
            hinge.rotation.z = Math.PI / 2;
            hinge.position.set(side * 1.0, 0, 0);
            this.components.body.add(hinge);
            
            this.components.solarPanels.push(panelGroup);
            this.satellite.add(panelGroup);
        }
    }
    
    addSolarCellDetails(panel) {
        // Add individual solar cells
        const cellGeometry = new THREE.PlaneGeometry(0.2, 0.2);
        const cellMaterial = new THREE.MeshPhongMaterial({
            color: 0x002255,
            transparent: true,
            opacity: 0.9
        });
        
        for (let x = -1.4; x <= 1.4; x += 0.25) {
            for (let z = -0.7; z <= 0.7; z += 0.25) {
                const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                cell.position.set(x, 0.026, z);
                cell.rotation.x = -Math.PI / 2;
                panel.add(cell);
            }
        }
    }
    
    createAntenna() {
        const antennaGroup = new THREE.Group();
        
        // Main antenna mast
        const mastGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5);
        const mastMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.set(0, 1.25, 0);
        antennaGroup.add(mast);
        
        // Antenna dish
        const dishGeometry = new THREE.ConeGeometry(0.3, 0.1, 16);
        const dishMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            shininess: 100 
        });
        const dish = new THREE.Mesh(dishGeometry, dishMaterial);
        dish.position.set(0, 2, 0);
        dish.rotation.x = Math.PI;
        antennaGroup.add(dish);
        
        // Wire antennas
        for (let i = 0; i < 4; i++) {
            const wireGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.8);
            const wireMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const wire = new THREE.Mesh(wireGeometry, wireMaterial);
            
            const angle = (i * Math.PI) / 2;
            wire.position.set(Math.cos(angle) * 0.4, 1.6, Math.sin(angle) * 0.4);
            wire.rotation.z = angle + Math.PI / 4;
            antennaGroup.add(wire);
        }
        
        this.components.antenna = antennaGroup;
        this.satellite.add(antennaGroup);
    }
    
    createRadiator() {
        // Thermal radiator panels
        const radiatorGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.8);
        const radiatorMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        this.components.radiator = new THREE.Mesh(radiatorGeometry, radiatorMaterial);
        this.components.radiator.position.set(-1.1, 0, 0);
        this.satellite.add(this.components.radiator);
        
        // Add radiator fins
        for (let i = 0; i < 5; i++) {
            const finGeometry = new THREE.BoxGeometry(0.02, 0.2, 0.8);
            const finMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const fin = new THREE.Mesh(finGeometry, finMaterial);
            fin.position.set(-1.15, -0.4 + i * 0.2, 0);
            this.components.radiator.add(fin);
        }
    }
    
    createInternalComponents() {
        // Battery (inside body, visible as glow)
        const batteryGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6);
        const batteryMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        
        this.components.battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
        this.components.battery.position.set(-0.5, 0, 0);
        this.components.body.add(this.components.battery);
        
        // Processor (CPU with heat sink)
        const processorGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.3);
        const processorMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.4,
            wireframe: true
        });
        
        this.components.processor = new THREE.Mesh(processorGeometry, processorMaterial);
        this.components.processor.position.set(0.5, 0, 0);
        this.components.body.add(this.components.processor);
    }
    
    setupControls() {
        // OrbitControls for user interaction - check if available
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        } else if (typeof OrbitControls !== 'undefined') {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        } else {
            console.warn('OrbitControls not available, using basic controls');
            this.setupBasicControls();
            return;
        }
        if (this.controls) {
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.maxDistance = 20;
            this.controls.minDistance = 2;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 1;
        }
    }
    
    setupBasicControls() {
        // Fallback basic mouse controls
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            // Rotate camera around satellite
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 0, 0);
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        // Zoom with mouse wheel
        this.renderer.domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
        });
    }
    
    setupTelemetryListener() {
        window.addEventListener('telemetryUpdate', (event) => {
            this.updateSatelliteVisualization(event.detail);
        });
        
        window.addEventListener('anomalyDetected', (event) => {
            this.handleAnomalyVisualization(event.detail);
        });
    }
    
    updateSatelliteVisualization(telemetryData) {
        if (!this.isInitialized) return;
        
        // Use fallback if Three.js not available
        if (this.isFallback) {
            this.updateFallbackVisualization(telemetryData);
            return;
        }
        
        // Update component colors based on status
        this.updateComponentStatus('battery', telemetryData.power.battery.status);
        this.updateComponentStatus('solar', telemetryData.power.solar.status);
        this.updateComponentStatus('thermal', telemetryData.thermal.status);
        this.updateComponentStatus('communication', telemetryData.communication.status);
        
        // Animate solar panels based on power generation
        this.animateSolarPanels(telemetryData.power.solar);
        
        // Update thermal radiator visualization
        this.updateThermalVisualization(telemetryData.thermal);
        
        // Update communication antenna
        this.updateCommunicationVisualization(telemetryData.communication);
        
        // Eclipse effect
        if (telemetryData.power.eclipse) {
            this.activateEclipseMode();
        } else {
            this.deactivateEclipseMode();
        }
    }
    
    updateComponentStatus(componentType, status) {
        let component = null;
        let color = this.statusColors.normal;
        
        switch (status) {
            case 'warning':
                color = this.statusColors.warning;
                break;
            case 'critical':
                color = this.statusColors.critical;
                break;
        }
        
        switch (componentType) {
            case 'battery':
                component = this.components.battery;
                break;
            case 'solar':
                this.components.solarPanels.forEach(panel => {
                    panel.children[0].material.color.setHex(color);
                });
                break;
            case 'thermal':
                component = this.components.radiator;
                break;
            case 'communication':
                component = this.components.antenna;
                break;
        }
        
        if (component && component.material) {
            component.material.color.setHex(color);
            
            // Add pulsing effect for critical status
            if (status === 'critical') {
                this.addPulseEffect(component);
            }
        }
    }
    
    addPulseEffect(component) {
        // Add pulsing animation for critical components
        const originalOpacity = component.material.opacity;
        
        const pulse = () => {
            if (component.material.opacity <= 0.2) {
                component.material.opacity = originalOpacity;
            } else {
                component.material.opacity *= 0.95;
            }
        };
        
        // Run pulse for a few seconds
        const pulseInterval = setInterval(pulse, 50);
        setTimeout(() => clearInterval(pulseInterval), 3000);
    }
    
    animateSolarPanels(solarData) {
        // Rotate solar panels to track sun (simplified)
        this.solarPanelRotation += 0.01 * (solarData.power / 2400); // Faster rotation with more power
        
        this.components.solarPanels.forEach((panel, index) => {
            const direction = index === 0 ? 1 : -1;
            panel.rotation.y = Math.sin(this.solarPanelRotation) * 0.3 * direction;
        });
    }
    
    updateThermalVisualization(thermalData) {
        if (!this.components.radiator) return;
        
        // Change radiator color based on temperature
        let heatIntensity = Math.max(0, (thermalData.processor - 20) / 50); // 20-70°C range
        heatIntensity = Math.min(1, heatIntensity);
        
        // Interpolate between blue (cold) and red (hot)
        const r = Math.floor(255 * heatIntensity);
        const g = 0;
        const b = Math.floor(255 * (1 - heatIntensity));
        
        const thermalColor = (r << 16) | (g << 8) | b;
        this.components.radiator.material.color.setHex(thermalColor);
        
        // Add heat shimmer effect for high temperatures
        if (thermalData.processor > 60) {
            this.addHeatShimmer();
        }
    }
    
    addHeatShimmer() {
        // Create heat shimmer particles around radiator
        if (this.heatParticles) {
            this.scene.remove(this.heatParticles);
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 50;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = -1.1 + (Math.random() - 0.5) * 0.5;     // X around radiator
            positions[i + 1] = (Math.random() - 0.5) * 2;           // Y spread
            positions[i + 2] = (Math.random() - 0.5) * 1.6;         // Z spread
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff4444,
            size: 2,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.heatParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.heatParticles);
        
        // Remove after animation
        setTimeout(() => {
            if (this.heatParticles) {
                this.scene.remove(this.heatParticles);
                this.heatParticles = null;
            }
        }, 5000);
    }
    
    updateCommunicationVisualization(commData) {
        if (!this.components.antenna) return;
        
        // Signal strength visualization
        const signalStrength = Math.max(0, (commData.signalStrength + 120) / 40); // -120 to -80 dBm range
        
        // Create signal waves
        this.createSignalWaves(signalStrength);
        
        // Rotate antenna dish based on signal quality
        if (this.components.antenna.children[1]) {
            this.components.antenna.children[1].rotation.y += 0.02 * signalStrength;
        }
    }
    
    createSignalWaves(strength) {
        // Remove existing waves
        this.removeSignalWaves();
        
        if (strength < 0.3) return; // No waves for very weak signal
        
        // Create concentric signal waves
        for (let i = 1; i <= 3; i++) {
            const waveGeometry = new THREE.RingGeometry(i * 0.5, i * 0.5 + 0.1, 16);
            const waveMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3 * strength,
                side: THREE.DoubleSide
            });
            
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.position.copy(this.components.antenna.position);
            wave.position.y += 2;
            wave.rotation.x = -Math.PI / 2;
            wave.name = 'signalWave';
            
            this.scene.add(wave);
            
            // Animate wave expansion
            const startScale = 0.1;
            const endScale = 1;
            let currentScale = startScale;
            
            const animateWave = () => {
                currentScale += 0.02;
                wave.scale.setScalar(currentScale);
                wave.material.opacity = (0.3 * strength) * (1 - (currentScale - startScale) / (endScale - startScale));
                
                if (currentScale < endScale && wave.parent) {
                    requestAnimationFrame(animateWave);
                } else {
                    this.scene.remove(wave);
                }
            };
            
            setTimeout(() => animateWave(), i * 500); // Stagger wave creation
        }
    }
    
    removeSignalWaves() {
        const waves = this.scene.children.filter(child => child.name === 'signalWave');
        waves.forEach(wave => this.scene.remove(wave));
    }
    
    activateEclipseMode() {
        // Reduce lighting to simulate eclipse
        this.scene.children.forEach(child => {
            if (child instanceof THREE.DirectionalLight) {
                child.intensity = 0.2;
            }
        });
        
        // Change background to darker space
        this.scene.background = new THREE.Color(0x000005);
    }
    
    deactivateEclipseMode() {
        // Restore normal lighting
        this.scene.children.forEach(child => {
            if (child instanceof THREE.DirectionalLight) {
                child.intensity = 1.2;
            }
        });
        
        // Restore normal background
        this.scene.background = new THREE.Color(0x000010);
    }
    
    handleAnomalyVisualization(anomaly) {
        console.log('Visualizing anomaly:', anomaly);
        
        // Create alert indicators around satellite
        this.createAnomalyAlert(anomaly);
    }
    
    createAnomalyAlert(anomaly) {
        // Create pulsing alert sphere around satellite
        const alertGeometry = new THREE.SphereGeometry(3, 16, 16);
        const alertMaterial = new THREE.MeshBasicMaterial({
            color: anomaly.severity === 'critical' ? 0xff0000 : 0xff8800,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        
        const alertSphere = new THREE.Mesh(alertGeometry, alertMaterial);
        alertSphere.position.copy(this.satellite.position);
        alertSphere.name = 'anomalyAlert';
        this.scene.add(alertSphere);
        
        // Animate alert
        let pulseScale = 1;
        const pulseAlert = () => {
            pulseScale += 0.05;
            alertSphere.scale.setScalar(pulseScale);
            alertSphere.material.opacity = 0.2 / pulseScale;
            
            if (pulseScale < 3 && alertSphere.parent) {
                requestAnimationFrame(pulseAlert);
            } else {
                this.scene.remove(alertSphere);
            }
        };
        
        pulseAlert();
    }
    
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            // Update controls
            if (this.controls) {
                this.controls.update();
            }
            
            // Rotate satellite slowly
            if (this.satellite) {
                this.satellite.rotation.y += this.rotationSpeed;
            }
            
            // Animate space particles
            if (this.particles) {
                this.animateSpaceParticles();
            }
            
            // Update heat particles
            if (this.heatParticles) {
                this.animateHeatParticles();
            }
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
    
    animateSpaceParticles() {
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.geometry.attributes.velocity.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            // Reset particles that move too far
            if (Math.abs(positions[i]) > 50 || 
                Math.abs(positions[i + 1]) > 50 || 
                Math.abs(positions[i + 2]) > 50) {
                positions[i] = (Math.random() - 0.5) * 20;
                positions[i + 1] = (Math.random() - 0.5) * 20;
                positions[i + 2] = (Math.random() - 0.5) * 20;
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    animateHeatParticles() {
        if (!this.heatParticles) return;
        
        const positions = this.heatParticles.geometry.attributes.position.array;
        
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += 0.02; // Float upward
        }
        
        this.heatParticles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Public methods
    focusOnComponent(componentName) {
        const component = this.components[componentName];
        if (component && this.controls) {
            const position = new THREE.Vector3();
            component.getWorldPosition(position);
            this.controls.target.copy(position);
        }
    }
    
    resetView() {
        if (this.controls) {
            this.controls.reset();
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
    }
}

// Global 3D visualization instance
window.satellite3D = new Satellite3DVisualization();
