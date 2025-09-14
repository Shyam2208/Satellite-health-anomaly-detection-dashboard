/**
 * Satellite Telemetry Simulation System
 * Generates realistic satellite subsystem data with configurable parameters
 */

class TelemetrySimulator {
    constructor() {
        this.startTime = Date.now();
        this.isRunning = false;
        this.updateInterval = null;
        this.dataHistory = {
            power: [],
            thermal: [],
            communication: [],
            attitude: [],
            anomalies: []
        };
        
        // Satellite subsystem parameters
        this.subsystems = {
            battery: {
                voltage: { base: 24.0, range: 2.0, degradation: 0.001 },
                current: { base: -2.5, range: 1.0, noise: 0.1 },
                temperature: { base: 20, range: 15, threshold: 45 },
                capacity: { base: 100, degradation: 0.0001 }
            },
            solar: {
                power: { base: 2400, range: 400, efficiency: 0.98 },
                voltage: { base: 32.0, range: 3.0 },
                current: { base: 75, range: 15 },
                temperature: { base: -10, range: 40, threshold: 85 }
            },
            thermal: {
                processor: { base: 35, range: 10, threshold: 70 },
                battery: { base: 20, range: 15, threshold: 45 },
                solar: { base: -10, range: 40, threshold: 85 },
                radiator: { base: -50, range: 20 }
            },
            communication: {
                signalStrength: { base: -85, range: 15, threshold: -110 },
                dataRate: { base: 256, range: 64 },
                errorRate: { base: 0.001, range: 0.005, threshold: 0.1 },
                antennaTemp: { base: 25, range: 5 }
            },
            attitude: {
                roll: { base: 0, range: 2, drift: 0.01 },
                pitch: { base: 0, range: 2, drift: 0.01 },
                yaw: { base: 0, range: 2, drift: 0.01 },
                angularVelocity: { base: 0.001, range: 0.002 }
            }
        };
        
        // Failure simulation states
        this.simulatedFailures = {
            battery: false,
            solar: false,
            thermal: false,
            communication: false
        };
        
        // Mission phase affects telemetry
        this.missionPhase = 'nominal'; // nominal, eclipse, maneuver, safe_mode
        
        this.initializeHistory();
    }
    
    initializeHistory() {
        // Initialize with some historical data for smooth chart rendering
        const now = Date.now();
        for (let i = 60; i > 0; i--) {
            const timestamp = now - (i * 1000);
            this.generateTelemetryPoint(timestamp, true);
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateInterval = setInterval(() => {
            this.generateTelemetryPoint();
            this.broadcastUpdate();
        }, 1000); // Update every second
        
        console.log('Telemetry simulation started');
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.updateInterval);
        console.log('Telemetry simulation stopped');
    }
    
    generateTelemetryPoint(timestamp = Date.now(), isHistorical = false) {
        const missionTime = (timestamp - this.startTime) / 1000; // seconds
        
        // Generate power system telemetry
        const powerData = this.generatePowerTelemetry(missionTime);
        
        // Generate thermal system telemetry
        const thermalData = this.generateThermalTelemetry(missionTime);
        
        // Generate communication telemetry
        const commData = this.generateCommunicationTelemetry(missionTime);
        
        // Generate attitude telemetry
        const attitudeData = this.generateAttitudeTelemetry(missionTime);
        
        // Store in history (keep last 300 points = 5 minutes)
        const telemetryPoint = {
            timestamp,
            missionTime,
            power: powerData,
            thermal: thermalData,
            communication: commData,
            attitude: attitudeData
        };
        
        this.dataHistory.power.push(telemetryPoint);
        this.dataHistory.thermal.push(telemetryPoint);
        this.dataHistory.communication.push(telemetryPoint);
        
        // Keep only recent data
        if (this.dataHistory.power.length > 300) {
            this.dataHistory.power.shift();
            this.dataHistory.thermal.shift();
            this.dataHistory.communication.shift();
        }
        
        return telemetryPoint;
    }
    
    generatePowerTelemetry(missionTime) {
        const battery = this.subsystems.battery;
        const solar = this.subsystems.solar;
        
        // Eclipse simulation (every 90 minutes = 5400 seconds)
        const orbitPosition = (missionTime % 5400) / 5400;
        const inEclipse = orbitPosition > 0.6 && orbitPosition < 0.9;
        
        // Battery telemetry
        let batteryVoltage = battery.voltage.base + 
            Math.sin(missionTime * 0.001) * battery.voltage.range * 0.3 +
            (Math.random() - 0.5) * 0.1;
            
        let batteryCurrent = battery.current.base + 
            (inEclipse ? -3.0 : 1.0) + // Discharge in eclipse, charge in sun
            (Math.random() - 0.5) * battery.current.noise;
            
        let batteryTemp = battery.temperature.base + 
            Math.sin(missionTime * 0.0005) * 5 +
            (Math.random() - 0.5) * 2;
            
        let batteryCapacity = Math.max(50, battery.capacity.base - 
            missionTime * battery.capacity.degradation);
        
        // Solar panel telemetry
        let solarPower = solar.power.base * solar.power.efficiency;
        if (inEclipse) {
            solarPower *= 0.1; // Minimal power in eclipse
        } else {
            solarPower *= (0.8 + Math.random() * 0.4); // Varying solar conditions
        }
        
        let solarVoltage = solar.voltage.base + 
            (solarPower / solar.power.base - 0.5) * solar.voltage.range;
            
        let solarCurrent = solarPower / solarVoltage;
        
        let solarTemp = solar.temperature.base + 
            (inEclipse ? -30 : 30) + // Cooler in eclipse
            Math.sin(missionTime * 0.0008) * 10 +
            (Math.random() - 0.5) * 5;
        
        // Apply failure simulations
        if (this.simulatedFailures.battery) {
            batteryTemp += 25; // Overheating
            batteryVoltage *= 0.85; // Voltage drop
            batteryCurrent *= 1.5; // Higher discharge
        }
        
        if (this.simulatedFailures.solar) {
            solarPower *= 0.3; // Severe degradation
            solarTemp += 20; // Overheating
        }
        
        return {
            battery: {
                voltage: Number(batteryVoltage.toFixed(2)),
                current: Number(batteryCurrent.toFixed(2)),
                temperature: Number(batteryTemp.toFixed(1)),
                capacity: Number(batteryCapacity.toFixed(1)),
                status: this.getBatteryStatus(batteryVoltage, batteryTemp, batteryCapacity)
            },
            solar: {
                power: Number(solarPower.toFixed(1)),
                voltage: Number(solarVoltage.toFixed(2)),
                current: Number(solarCurrent.toFixed(2)),
                temperature: Number(solarTemp.toFixed(1)),
                efficiency: Number((solarPower / solar.power.base * 100).toFixed(1)),
                status: this.getSolarStatus(solarPower, solarTemp)
            },
            eclipse: inEclipse
        };
    }
    
    generateThermalTelemetry(missionTime) {
        const thermal = this.subsystems.thermal;
        
        // Base temperatures with orbital and operational variations
        let processorTemp = thermal.processor.base + 
            Math.sin(missionTime * 0.001) * 5 +
            (Math.random() - 0.5) * thermal.processor.range * 0.1;
            
        let batteryTemp = thermal.battery.base + 
            Math.sin(missionTime * 0.0008) * 3 +
            (Math.random() - 0.5) * 2;
            
        let solarTemp = thermal.solar.base + 
            Math.sin(missionTime * 0.0005) * thermal.solar.range * 0.3 +
            (Math.random() - 0.5) * 5;
            
        let radiatorTemp = thermal.radiator.base + 
            Math.sin(missionTime * 0.0003) * 10 +
            (Math.random() - 0.5) * 3;
        
        // Apply thermal failure simulation
        if (this.simulatedFailures.thermal) {
            processorTemp += 20; // Thermal runaway
            batteryTemp += 15;
        }
        
        return {
            processor: Number(processorTemp.toFixed(1)),
            battery: Number(batteryTemp.toFixed(1)),
            solar: Number(solarTemp.toFixed(1)),
            radiator: Number(radiatorTemp.toFixed(1)),
            status: this.getThermalStatus(processorTemp, batteryTemp, solarTemp)
        };
    }
    
    generateCommunicationTelemetry(missionTime) {
        const comm = this.subsystems.communication;
        
        // Signal strength varies with orbital position and atmospheric conditions
        let signalStrength = comm.signalStrength.base + 
            Math.sin(missionTime * 0.0012) * comm.signalStrength.range * 0.5 +
            (Math.random() - 0.5) * 3;
            
        let dataRate = comm.dataRate.base + 
            Math.sin(missionTime * 0.0015) * comm.dataRate.range * 0.3 +
            (Math.random() - 0.5) * 10;
            
        let errorRate = comm.errorRate.base + 
            Math.max(0, Math.sin(missionTime * 0.002) * comm.errorRate.range * 0.5 +
            (Math.random() - 0.5) * comm.errorRate.range * 0.2);
            
        let antennaTemp = comm.antennaTemp.base + 
            (Math.random() - 0.5) * comm.antennaTemp.range;
        
        // Apply communication failure simulation
        if (this.simulatedFailures.communication) {
            signalStrength -= 20; // Severe signal degradation
            dataRate *= 0.1; // Drastically reduced data rate
            errorRate *= 10; // High error rate
        }
        
        return {
            signalStrength: Number(signalStrength.toFixed(1)),
            dataRate: Number(dataRate.toFixed(0)),
            errorRate: Number(errorRate.toFixed(4)),
            antennaTemperature: Number(antennaTemp.toFixed(1)),
            status: this.getCommunicationStatus(signalStrength, errorRate)
        };
    }
    
    generateAttitudeTelemetry(missionTime) {
        const attitude = this.subsystems.attitude;
        
        // Attitude with slow drift and control corrections
        let roll = Math.sin(missionTime * 0.0001) * attitude.roll.range +
            (Math.random() - 0.5) * attitude.roll.drift;
            
        let pitch = Math.cos(missionTime * 0.0001) * attitude.pitch.range +
            (Math.random() - 0.5) * attitude.pitch.drift;
            
        let yaw = Math.sin(missionTime * 0.00005) * attitude.yaw.range +
            (Math.random() - 0.5) * attitude.yaw.drift;
            
        let angularVelocity = attitude.angularVelocity.base + 
            (Math.random() - 0.5) * attitude.angularVelocity.range;
        
        return {
            roll: Number(roll.toFixed(3)),
            pitch: Number(pitch.toFixed(3)),
            yaw: Number(yaw.toFixed(3)),
            angularVelocity: Number(angularVelocity.toFixed(6))
        };
    }
    
    // Status determination methods
    getBatteryStatus(voltage, temperature, capacity) {
        if (temperature > this.subsystems.battery.temperature.threshold || 
            voltage < 20 || capacity < 60) {
            return 'critical';
        }
        if (temperature > 35 || voltage < 22 || capacity < 80) {
            return 'warning';
        }
        return 'normal';
    }
    
    getSolarStatus(power, temperature) {
        if (power < this.subsystems.solar.power.base * 0.3 || 
            temperature > this.subsystems.solar.temperature.threshold) {
            return 'critical';
        }
        if (power < this.subsystems.solar.power.base * 0.7 || temperature > 60) {
            return 'warning';
        }
        return 'normal';
    }
    
    getThermalStatus(processor, battery, solar) {
        if (processor > this.subsystems.thermal.processor.threshold ||
            battery > this.subsystems.thermal.battery.threshold ||
            solar > this.subsystems.thermal.solar.threshold) {
            return 'critical';
        }
        if (processor > 50 || battery > 35 || solar > 60) {
            return 'warning';
        }
        return 'normal';
    }
    
    getCommunicationStatus(signalStrength, errorRate) {
        if (signalStrength < this.subsystems.communication.signalStrength.threshold ||
            errorRate > this.subsystems.communication.errorRate.threshold) {
            return 'critical';
        }
        if (signalStrength < -100 || errorRate > 0.05) {
            return 'warning';
        }
        return 'normal';
    }
    
    // Failure simulation methods
    simulateFailure(subsystem) {
        this.simulatedFailures[subsystem] = true;
        console.log(`Simulated failure in ${subsystem} subsystem`);
        
        // Auto-clear failure after some time for demo purposes
        setTimeout(() => {
            this.clearFailure(subsystem);
        }, 30000); // Clear after 30 seconds
    }
    
    clearFailure(subsystem) {
        this.simulatedFailures[subsystem] = false;
        console.log(`Cleared failure in ${subsystem} subsystem`);
    }
    
    // Data access methods
    getLatestTelemetry() {
        if (this.dataHistory.power.length === 0) return null;
        return this.dataHistory.power[this.dataHistory.power.length - 1];
    }
    
    getHistoricalData(subsystem, minutes = 5) {
        const history = this.dataHistory[subsystem] || this.dataHistory.power;
        const pointsNeeded = minutes * 60; // 1 point per second
        return history.slice(-pointsNeeded);
    }
    
    // Event broadcasting
    broadcastUpdate() {
        const latest = this.getLatestTelemetry();
        if (latest) {
            // Dispatch custom event for other modules to listen
            window.dispatchEvent(new CustomEvent('telemetryUpdate', {
                detail: latest
            }));
        }
    }
    
    // Mission phase control
    setMissionPhase(phase) {
        this.missionPhase = phase;
        console.log(`Mission phase changed to: ${phase}`);
    }
}

// Global telemetry simulator instance
window.telemetrySimulator = new TelemetrySimulator();