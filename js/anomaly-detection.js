/**
 * Advanced Anomaly Detection System
 * Implements both threshold-based and ML-based anomaly detection
 */

class AnomalyDetector {
    constructor() {
        this.thresholds = {
            battery: {
                voltage: { min: 20, max: 28, critical_min: 18, critical_max: 30 },
                current: { min: -8, max: 5, critical_min: -12, critical_max: 8 },
                temperature: { max: 45, critical_max: 55 },
                capacity: { min: 60, critical_min: 40 }
            },
            solar: {
                power: { min: 1200, critical_min: 800 },
                temperature: { max: 85, critical_max: 100 }
            },
            thermal: {
                processor: { max: 70, critical_max: 85 },
                battery: { max: 45, critical_max: 55 },
                solar: { max: 85, critical_max: 100 }
            },
            communication: {
                signalStrength: { min: -110, critical_min: -120 },
                errorRate: { max: 0.1, critical_max: 0.2 }
            }
        };
        
        this.anomalies = [];
        this.anomalyHistory = [];
        this.isolationForest = new IsolationForest();
        this.lstmDetector = new LSTMTimeSeriesDetector();
        
        // Statistical models for each parameter
        this.statisticalModels = {
            battery_voltage: new StatisticalModel(),
            battery_current: new StatisticalModel(),
            battery_temperature: new StatisticalModel(),
            solar_power: new StatisticalModel(),
            processor_temp: new StatisticalModel(),
            signal_strength: new StatisticalModel()
        };
        
        this.isTraining = false;
        this.trainingComplete = false;
        this.detectionEnabled = true;
        
        // Listen for telemetry updates
        window.addEventListener('telemetryUpdate', (event) => {
            if (this.detectionEnabled) {
                this.processTelemetry(event.detail);
            }
        });
    }
    
    processTelemetry(telemetryData) {
        const anomalies = [];
        
        // Threshold-based detection
        const thresholdAnomalies = this.detectThresholdAnomalies(telemetryData);
        anomalies.push(...thresholdAnomalies);
        
        // Statistical anomaly detection
        const statisticalAnomalies = this.detectStatisticalAnomalies(telemetryData);
        anomalies.push(...statisticalAnomalies);
        
        // ML-based detection (if trained)
        if (this.trainingComplete) {
            const mlAnomalies = this.detectMLAnomalies(telemetryData);
            anomalies.push(...mlAnomalies);
        }
        
        // Time series pattern detection
        const patternAnomalies = this.detectPatternAnomalies(telemetryData);
        anomalies.push(...patternAnomalies);
        
        // Process and broadcast anomalies
        if (anomalies.length > 0) {
            this.processDetectedAnomalies(anomalies, telemetryData.timestamp);
        }
        
        // Update models with new data
        this.updateModels(telemetryData);
    }
    
    detectThresholdAnomalies(data) {
        const anomalies = [];
        
        // Battery anomalies
        const battery = data.power.battery;
        if (battery.voltage < this.thresholds.battery.voltage.critical_min ||
            battery.voltage > this.thresholds.battery.voltage.critical_max) {
            anomalies.push({
                type: 'threshold',
                severity: 'critical',
                subsystem: 'battery',
                parameter: 'voltage',
                value: battery.voltage,
                threshold: battery.voltage < this.thresholds.battery.voltage.critical_min ? 
                    this.thresholds.battery.voltage.critical_min : 
                    this.thresholds.battery.voltage.critical_max,
                message: `Battery voltage ${battery.voltage}V is outside critical limits`,
                recommendation: 'Activate emergency power management protocol'
            });
        } else if (battery.voltage < this.thresholds.battery.voltage.min ||
                   battery.voltage > this.thresholds.battery.voltage.max) {
            anomalies.push({
                type: 'threshold',
                severity: 'warning',
                subsystem: 'battery',
                parameter: 'voltage',
                value: battery.voltage,
                threshold: battery.voltage < this.thresholds.battery.voltage.min ? 
                    this.thresholds.battery.voltage.min : 
                    this.thresholds.battery.voltage.max,
                message: `Battery voltage ${battery.voltage}V is outside normal range`,
                recommendation: 'Monitor battery health closely'
            });
        }
        
        if (battery.temperature > this.thresholds.battery.temperature.critical_max) {
            anomalies.push({
                type: 'threshold',
                severity: 'critical',
                subsystem: 'battery',
                parameter: 'temperature',
                value: battery.temperature,
                threshold: this.thresholds.battery.temperature.critical_max,
                message: `Battery temperature ${battery.temperature}°C exceeds critical limit`,
                recommendation: 'Activate thermal management system immediately'
            });
        } else if (battery.temperature > this.thresholds.battery.temperature.max) {
            anomalies.push({
                type: 'threshold',
                severity: 'warning',
                subsystem: 'battery',
                parameter: 'temperature',
                value: battery.temperature,
                threshold: this.thresholds.battery.temperature.max,
                message: `Battery temperature ${battery.temperature}°C is elevated`,
                recommendation: 'Increase thermal monitoring frequency'
            });
        }
        
        // Solar panel anomalies
        const solar = data.power.solar;
        if (!data.power.eclipse && solar.power < this.thresholds.solar.power.critical_min) {
            anomalies.push({
                type: 'threshold',
                severity: 'critical',
                subsystem: 'solar',
                parameter: 'power',
                value: solar.power,
                threshold: this.thresholds.solar.power.critical_min,
                message: `Solar power ${solar.power}W critically low outside eclipse`,
                recommendation: 'Check solar panel alignment and condition'
            });
        } else if (!data.power.eclipse && solar.power < this.thresholds.solar.power.min) {
            anomalies.push({
                type: 'threshold',
                severity: 'warning',
                subsystem: 'solar',
                parameter: 'power',
                value: solar.power,
                threshold: this.thresholds.solar.power.min,
                message: `Solar power ${solar.power}W below expected range`,
                recommendation: 'Verify solar panel orientation'
            });
        }
        
        // Thermal anomalies
        const thermal = data.thermal;
        if (thermal.processor > this.thresholds.thermal.processor.critical_max) {
            anomalies.push({
                type: 'threshold',
                severity: 'critical',
                subsystem: 'thermal',
                parameter: 'processor',
                value: thermal.processor,
                threshold: this.thresholds.thermal.processor.critical_max,
                message: `Processor temperature ${thermal.processor}°C exceeds critical limit`,
                recommendation: 'Reduce computational load immediately'
            });
        }
        
        // Communication anomalies
        const comm = data.communication;
        if (comm.signalStrength < this.thresholds.communication.signalStrength.critical_min) {
            anomalies.push({
                type: 'threshold',
                severity: 'critical',
                subsystem: 'communication',
                parameter: 'signalStrength',
                value: comm.signalStrength,
                threshold: this.thresholds.communication.signalStrength.critical_min,
                message: `Signal strength ${comm.signalStrength}dBm critically weak`,
                recommendation: 'Switch to backup antenna or adjust orientation'
            });
        }
        
        return anomalies;
    }
    
    detectStatisticalAnomalies(data) {
        const anomalies = [];
        const parameters = {
            battery_voltage: data.power.battery.voltage,
            battery_current: data.power.battery.current,
            battery_temperature: data.power.battery.temperature,
            solar_power: data.power.solar.power,
            processor_temp: data.thermal.processor,
            signal_strength: data.communication.signalStrength
        };
        
        for (const [param, value] of Object.entries(parameters)) {
            const model = this.statisticalModels[param];
            if (model.hasEnoughData()) {
                const anomalyScore = model.calculateAnomalyScore(value);
                
                if (anomalyScore > 0.95) { // 95% confidence
                    anomalies.push({
                        type: 'statistical',
                        severity: anomalyScore > 0.99 ? 'critical' : 'warning',
                        subsystem: param.split('_')[0],
                        parameter: param.split('_').slice(1).join('_'),
                        value: value,
                        score: anomalyScore,
                        message: `Statistical anomaly detected in ${param.replace('_', ' ')}`,
                        recommendation: 'Investigate deviation from normal patterns',
                        explanation: `Value deviates from expected pattern (confidence: ${(anomalyScore * 100).toFixed(1)}%)`
                    });
                }
            }
        }
        
        return anomalies;
    }
    
    detectMLAnomalies(data) {
        const anomalies = [];
        
        // Prepare feature vector for isolation forest
        const features = [
            data.power.battery.voltage,
            data.power.battery.current,
            data.power.battery.temperature,
            data.power.solar.power,
            data.thermal.processor,
            data.thermal.battery,
            data.communication.signalStrength,
            data.communication.errorRate
        ];
        
        const isolationScore = this.isolationForest.predict(features);
        if (isolationScore > 0.7) { // Anomaly threshold
            anomalies.push({
                type: 'ml_isolation',
                severity: isolationScore > 0.9 ? 'critical' : 'warning',
                subsystem: 'system',
                parameter: 'multivariate',
                score: isolationScore,
                message: 'Multivariate anomaly detected by isolation forest',
                recommendation: 'Review all subsystem parameters for correlations',
                explanation: `ML model detected unusual pattern across multiple parameters (score: ${(isolationScore * 100).toFixed(1)}%)`
            });
        }
        
        // LSTM time series anomaly detection
        const lstmScore = this.lstmDetector.detectAnomaly(data);
        if (lstmScore > 0.8) {
            anomalies.push({
                type: 'ml_lstm',
                severity: lstmScore > 0.95 ? 'critical' : 'warning',
                subsystem: 'system',
                parameter: 'temporal',
                score: lstmScore,
                message: 'Temporal pattern anomaly detected',
                recommendation: 'Analyze recent operational changes',
                explanation: `Time series model detected deviation from expected temporal patterns (score: ${(lstmScore * 100).toFixed(1)}%)`
            });
        }
        
        return anomalies;
    }
    
    detectPatternAnomalies(data) {
        const anomalies = [];
        
        // Detect rapid changes in key parameters
        const history = window.telemetrySimulator.getHistoricalData('power', 0.5); // Last 30 seconds
        if (history.length < 10) return anomalies;
        
        const recent = history.slice(-5);
        const previous = history.slice(-10, -5);
        
        // Battery voltage rapid change
        const recentBatteryVoltage = recent.map(d => d.power.battery.voltage);
        const previousBatteryVoltage = previous.map(d => d.power.battery.voltage);
        const voltageChange = Math.abs(this.average(recentBatteryVoltage) - this.average(previousBatteryVoltage));
        
        if (voltageChange > 1.0) { // Rapid voltage change
            anomalies.push({
                type: 'pattern',
                severity: voltageChange > 2.0 ? 'critical' : 'warning',
                subsystem: 'battery',
                parameter: 'voltage_rate',
                value: voltageChange,
                message: `Rapid battery voltage change detected: ${voltageChange.toFixed(2)}V/5s`,
                recommendation: 'Check for load switching or battery fault',
                explanation: 'Abnormal rate of change in battery voltage'
            });
        }
        
        // Solar power oscillation detection
        const solarPowers = recent.map(d => d.power.solar.power);
        const solarVariance = this.variance(solarPowers);
        if (solarVariance > 100000 && !data.power.eclipse) { // High variance outside eclipse
            anomalies.push({
                type: 'pattern',
                severity: 'warning',
                subsystem: 'solar',
                parameter: 'power_stability',
                value: Math.sqrt(solarVariance),
                message: 'Solar power instability detected',
                recommendation: 'Check solar panel connections and tracking system',
                explanation: 'Unusual fluctuations in solar power generation'
            });
        }
        
        return anomalies;
    }
    
    processDetectedAnomalies(anomalies, timestamp) {
        for (const anomaly of anomalies) {
            // Add metadata
            anomaly.id = this.generateAnomalyId();
            anomaly.timestamp = timestamp;
            anomaly.acknowledged = false;
            
            // Check if this is a duplicate or similar recent anomaly
            if (!this.isDuplicateAnomaly(anomaly)) {
                this.anomalies.push(anomaly);
                this.anomalyHistory.push(anomaly);
                
                // Broadcast anomaly event
                window.dispatchEvent(new CustomEvent('anomalyDetected', {
                    detail: anomaly
                }));
            }
        }
        
        // Clean up old active anomalies (auto-acknowledge after 5 minutes)
        this.cleanupOldAnomalies();
        
        // Keep history manageable
        if (this.anomalyHistory.length > 1000) {
            this.anomalyHistory = this.anomalyHistory.slice(-500);
        }
    }
    
    isDuplicateAnomaly(newAnomaly) {
        const recentAnomalies = this.anomalies.filter(a => 
            (Date.now() - a.timestamp) < 30000 // Last 30 seconds
        );
        
        return recentAnomalies.some(existing => 
            existing.subsystem === newAnomaly.subsystem &&
            existing.parameter === newAnomaly.parameter &&
            existing.type === newAnomaly.type &&
            existing.severity === newAnomaly.severity
        );
    }
    
    cleanupOldAnomalies() {
        const now = Date.now();
        this.anomalies = this.anomalies.filter(anomaly => {
            // Auto-acknowledge anomalies older than 5 minutes
            if ((now - anomaly.timestamp) > 300000) {
                if (!anomaly.acknowledged) {
                    anomaly.acknowledged = true;
                    anomaly.acknowledgedAt = now;
                    anomaly.acknowledgedBy = 'auto-cleanup';
                }
                return false; // Remove from active anomalies
            }
            return true;
        });
    }
    
    updateModels(data) {
        // Update statistical models with new data points
        this.statisticalModels.battery_voltage.addDataPoint(data.power.battery.voltage);
        this.statisticalModels.battery_current.addDataPoint(data.power.battery.current);
        this.statisticalModels.battery_temperature.addDataPoint(data.power.battery.temperature);
        this.statisticalModels.solar_power.addDataPoint(data.power.solar.power);
        this.statisticalModels.processor_temp.addDataPoint(data.thermal.processor);
        this.statisticalModels.signal_strength.addDataPoint(data.communication.signalStrength);
        
        // Update ML models
        this.isolationForest.addTrainingData([
            data.power.battery.voltage,
            data.power.battery.current,
            data.power.battery.temperature,
            data.power.solar.power,
            data.thermal.processor,
            data.thermal.battery,
            data.communication.signalStrength,
            data.communication.errorRate
        ]);
        
        this.lstmDetector.addSequencePoint(data);
    }
    
    // Utility methods
    average(arr) {
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }
    
    variance(arr) {
        const avg = this.average(arr);
        return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
    }
    
    generateAnomalyId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Public API methods
    getActiveAnomalies() {
        return this.anomalies.filter(a => !a.acknowledged);
    }
    
    getAnomalyHistory(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        return this.anomalyHistory.filter(a => a.timestamp > cutoff);
    }
    
    acknowledgeAnomaly(anomalyId, acknowledgedBy = 'operator') {
        const anomaly = this.anomalies.find(a => a.id === anomalyId);
        if (anomaly) {
            anomaly.acknowledged = true;
            anomaly.acknowledgedAt = Date.now();
            anomaly.acknowledgedBy = acknowledgedBy;
            
            // Remove from active list
            this.anomalies = this.anomalies.filter(a => a.id !== anomalyId);
            return true;
        }
        return false;
    }
    
    trainMLModels() {
        if (this.isTraining) return false;
        
        this.isTraining = true;
        console.log('Training ML models...');
        
        // Simulate ML training process
        setTimeout(() => {
            this.isolationForest.train();
            this.lstmDetector.train();
            this.trainingComplete = true;
            this.isTraining = false;
            console.log('ML model training completed');
            
            window.dispatchEvent(new CustomEvent('mlTrainingComplete'));
        }, 3000);
        
        return true;
    }
}

// Statistical Model for individual parameter anomaly detection
class StatisticalModel {
    constructor(windowSize = 100) {
        this.windowSize = windowSize;
        this.dataPoints = [];
        this.mean = 0;
        this.variance = 0;
        this.standardDeviation = 0;
    }
    
    addDataPoint(value) {
        this.dataPoints.push(value);
        
        if (this.dataPoints.length > this.windowSize) {
            this.dataPoints.shift();
        }
        
        this.updateStatistics();
    }
    
    updateStatistics() {
        if (this.dataPoints.length < 10) return;
        
        this.mean = this.dataPoints.reduce((sum, val) => sum + val, 0) / this.dataPoints.length;
        this.variance = this.dataPoints.reduce((sum, val) => sum + Math.pow(val - this.mean, 2), 0) / this.dataPoints.length;
        this.standardDeviation = Math.sqrt(this.variance);
    }
    
    calculateAnomalyScore(value) {
        if (!this.hasEnoughData()) return 0;
        
        const zScore = Math.abs((value - this.mean) / this.standardDeviation);
        
        // Convert z-score to probability (using normal distribution approximation)
        // z-score of 2 = ~95% confidence, z-score of 3 = ~99.7% confidence
        return Math.min(0.999, Math.max(0, (zScore - 1) / 2));
    }
    
    hasEnoughData() {
        return this.dataPoints.length >= 20 && this.standardDeviation > 0;
    }
}

// Simplified Isolation Forest implementation
class IsolationForest {
    constructor(numTrees = 10, subsampleSize = 50) {
        this.numTrees = numTrees;
        this.subsampleSize = subsampleSize;
        this.trees = [];
        this.trainingData = [];
        this.trained = false;
    }
    
    addTrainingData(features) {
        this.trainingData.push([...features]);
        
        if (this.trainingData.length > 500) {
            this.trainingData.shift();
        }
        
        // Retrain periodically
        if (this.trainingData.length % 50 === 0 && this.trainingData.length >= 100) {
            this.train();
        }
    }
    
    train() {
        if (this.trainingData.length < 20) return;
        
        this.trees = [];
        
        for (let i = 0; i < this.numTrees; i++) {
            // Create subsample
            const subsample = this.createSubsample();
            const tree = this.buildTree(subsample, 0, Math.ceil(Math.log2(this.subsampleSize)));
            this.trees.push(tree);
        }
        
        this.trained = true;
    }
    
    createSubsample() {
        const shuffled = [...this.trainingData].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(this.subsampleSize, shuffled.length));
    }
    
    buildTree(data, currentDepth, maxDepth) {
        if (currentDepth >= maxDepth || data.length <= 1) {
            return { size: data.length };
        }
        
        // Randomly select feature and split point
        const featureIndex = Math.floor(Math.random() * data[0].length);
        const featureValues = data.map(point => point[featureIndex]);
        const minVal = Math.min(...featureValues);
        const maxVal = Math.max(...featureValues);
        
        if (minVal === maxVal) {
            return { size: data.length };
        }
        
        const splitValue = minVal + Math.random() * (maxVal - minVal);
        
        const leftData = data.filter(point => point[featureIndex] < splitValue);
        const rightData = data.filter(point => point[featureIndex] >= splitValue);
        
        return {
            featureIndex,
            splitValue,
            left: this.buildTree(leftData, currentDepth + 1, maxDepth),
            right: this.buildTree(rightData, currentDepth + 1, maxDepth)
        };
    }
    
    predict(features) {
        if (!this.trained || this.trees.length === 0) {
            return 0;
        }
        
        const pathLengths = this.trees.map(tree => this.getPathLength(features, tree, 0));
        const avgPathLength = pathLengths.reduce((sum, len) => sum + len, 0) / pathLengths.length;
        
        // Normalize to anomaly score (0-1)
        const expectedPathLength = Math.log2(this.subsampleSize);
        return Math.max(0, Math.min(1, 1 - (avgPathLength / expectedPathLength)));
    }
    
    getPathLength(features, tree, currentDepth) {
        if (!tree.featureIndex) {
            return currentDepth + this.c(tree.size);
        }
        
        if (features[tree.featureIndex] < tree.splitValue) {
            return this.getPathLength(features, tree.left, currentDepth + 1);
        } else {
            return this.getPathLength(features, tree.right, currentDepth + 1);
        }
    }
    
    c(n) {
        if (n <= 1) return 0;
        return 2 * (Math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n;
    }
}

// Simplified LSTM Time Series Anomaly Detector
class LSTMTimeSeriesDetector {
    constructor(sequenceLength = 30) {
        this.sequenceLength = sequenceLength;
        this.sequences = [];
        this.trained = false;
        this.baseline = null;
    }
    
    addSequencePoint(telemetryData) {
        // Create feature vector from telemetry
        const features = [
            telemetryData.power.battery.voltage,
            telemetryData.power.battery.current,
            telemetryData.power.solar.power,
            telemetryData.thermal.processor,
            telemetryData.communication.signalStrength
        ];
        
        this.sequences.push(features);
        
        if (this.sequences.length > 200) {
            this.sequences.shift();
        }
        
        if (this.sequences.length >= this.sequenceLength && !this.trained) {
            this.train();
        }
    }
    
    train() {
        if (this.sequences.length < this.sequenceLength) return;
        
        // Calculate baseline patterns (simplified)
        this.baseline = {
            means: [],
            variances: []
        };
        
        const numFeatures = this.sequences[0].length;
        
        for (let i = 0; i < numFeatures; i++) {
            const featureValues = this.sequences.map(seq => seq[i]);
            const mean = featureValues.reduce((sum, val) => sum + val, 0) / featureValues.length;
            const variance = featureValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / featureValues.length;
            
            this.baseline.means.push(mean);
            this.baseline.variances.push(variance);
        }
        
        this.trained = true;
    }
    
    detectAnomaly(telemetryData) {
        if (!this.trained || this.sequences.length < this.sequenceLength) {
            return 0;
        }
        
        // Get recent sequence
        const recentSequence = this.sequences.slice(-this.sequenceLength);
        
        // Calculate deviation from baseline patterns
        let totalDeviation = 0;
        const numFeatures = recentSequence[0].length;
        
        for (let i = 0; i < numFeatures; i++) {
            const recentValues = recentSequence.map(seq => seq[i]);
            const recentMean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
            
            const deviation = Math.abs(recentMean - this.baseline.means[i]) / 
                             Math.sqrt(this.baseline.variances[i] + 0.0001);
            
            totalDeviation += deviation;
        }
        
        const avgDeviation = totalDeviation / numFeatures;
        
        // Convert to anomaly score (0-1)
        return Math.min(1, Math.max(0, (avgDeviation - 1) / 3));
    }
}

// Global anomaly detector instance
window.anomalyDetector = new AnomalyDetector();