/**
 * Interactive Dashboard Controller
 * Manages real-time charts, KPIs, and UI updates
 */

class DashboardController {
    constructor() {
        this.charts = {};
        this.isInitialized = false;
        this.updateInterval = null;
        this.notifications = [];
        
        // Chart color schemes
        this.colorScheme = {
            normal: 'rgba(16, 185, 129, 0.8)',
            warning: 'rgba(245, 158, 11, 0.8)',
            critical: 'rgba(239, 68, 68, 0.8)',
            background: 'rgba(255, 255, 255, 0.1)',
            grid: 'rgba(255, 255, 255, 0.2)'
        };
        
        // Data buffers for charts
        this.chartData = {
            power: { labels: [], datasets: [] },
            thermal: { labels: [], datasets: [] },
            anomaly: { labels: [], datasets: [] }
        };
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        console.log('Initializing dashboard...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize charts
        this.initializeCharts();
        
        // Start mission timer
        this.startMissionTimer();
        
        // Start telemetry simulation
        window.telemetrySimulator.start();
        
        // Train ML models after some data collection
        setTimeout(() => {
            window.anomalyDetector.trainMLModels();
        }, 5000);
        
        this.isInitialized = true;
        console.log('Dashboard initialized successfully');
    }
    
    setupEventListeners() {
        // Listen for telemetry updates
        window.addEventListener('telemetryUpdate', (event) => {
            this.updateDashboard(event.detail);
        });
        
        // Listen for anomaly detections
        window.addEventListener('anomalyDetected', (event) => {
            this.handleAnomaly(event.detail);
        });
        
        // Listen for ML training completion
        window.addEventListener('mlTrainingComplete', () => {
            this.showNotification('ML Training Complete', 'Anomaly detection models are now active', 'success');
        });
        
        // Setup failure simulation buttons
        window.simulateFailure = (subsystem) => {
            window.telemetrySimulator.simulateFailure(subsystem);
            this.showNotification('Failure Simulated', `${subsystem} failure simulation activated`, 'warning');
        };
        
        // Setup natural language query
        window.processNLQuery = () => {
            const query = document.getElementById('nl-query').value;
            if (query.trim()) {
                this.processNaturalLanguageQuery(query);
            }
        };
        
        // Enter key for NL query
        document.getElementById('nl-query')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.processNLQuery();
            }
        });
    }
    
    initializeCharts() {
        // Power Systems Chart
        this.initializePowerChart();
        
        // Thermal Systems Chart
        this.initializeThermalChart();
        
        // Anomaly Timeline Chart
        this.initializeAnomalyChart();
    }
    
    initializePowerChart() {
        const ctx = document.getElementById('powerChart')?.getContext('2d');
        if (!ctx) return;
        
        this.charts.power = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Battery Voltage (V)',
                    data: [],
                    borderColor: this.colorScheme.normal,
                    backgroundColor: this.colorScheme.normal,
                    yAxisID: 'y',
                    tension: 0.1,
                    fill: false
                }, {
                    label: 'Solar Power (W)',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: '#f59e0b',
                    yAxisID: 'y1',
                    tension: 0.1,
                    fill: false
                }, {
                    label: 'Battery Current (A)',
                    data: [],
                    borderColor: '#8b5cf6',
                    backgroundColor: '#8b5cf6',
                    yAxisID: 'y2',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Time',
                            color: 'white'
                        },
                        grid: {
                            color: this.colorScheme.grid
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Voltage (V)',
                            color: 'white'
                        },
                        grid: {
                            color: this.colorScheme.grid
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Power (W)',
                            color: 'white'
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: this.colorScheme.grid
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y2: {
                        type: 'linear',
                        display: false,
                        title: {
                            display: true,
                            text: 'Current (A)',
                            color: 'white'
                        }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }
    
    initializeThermalChart() {
        const ctx = document.getElementById('thermalChart')?.getContext('2d');
        if (!ctx) return;
        
        this.charts.thermal = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Processor (°C)',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: '#ef4444',
                    tension: 0.1,
                    fill: false
                }, {
                    label: 'Battery (°C)',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: '#f59e0b',
                    tension: 0.1,
                    fill: false
                }, {
                    label: 'Solar Panel (°C)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: '#3b82f6',
                    tension: 0.1,
                    fill: false
                }, {
                    label: 'Radiator (°C)',
                    data: [],
                    borderColor: '#06b6d4',
                    backgroundColor: '#06b6d4',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Time',
                            color: 'white'
                        },
                        grid: {
                            color: this.colorScheme.grid
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temperature (°C)',
                            color: 'white'
                        },
                        grid: {
                            color: this.colorScheme.grid
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }
    
    initializeAnomalyChart() {
        const ctx = document.getElementById('anomalyChart')?.getContext('2d');
        if (!ctx) return;
        
        this.charts.anomaly = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Normal',
                    data: [],
                    backgroundColor: this.colorScheme.normal,
                    borderColor: this.colorScheme.normal,
                    pointRadius: 4
                }, {
                    label: 'Warning',
                    data: [],
                    backgroundColor: this.colorScheme.warning,
                    borderColor: this.colorScheme.warning,
                    pointRadius: 6
                }, {
                    label: 'Critical',
                    data: [],
                    backgroundColor: this.colorScheme.critical,
                    borderColor: this.colorScheme.critical,
                    pointRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return `Time: ${context[0].parsed.x}s`;
                            },
                            label: function(context) {
                                return `${context.dataset.label}: Anomaly Score ${context.parsed.y.toFixed(3)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Time',
                            color: 'white'
                        },
                        title: {
                            display: true,
                            text: 'Time',
                            color: 'white'
                        },
                        grid: {
                            color: this.colorScheme.grid
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Anomaly Score',
                            color: 'white'
                        },
                        min: 0,
                        max: 1,
                        grid: {
                            color: this.colorScheme.grid
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }
    
    updateDashboard(telemetryData) {
        // Update KPI cards
        this.updateKPICards(telemetryData);
        
        // Update charts
        this.updateCharts(telemetryData);
        
        // Update overall status
        this.updateOverallStatus(telemetryData);
    }
    
    updateKPICards(data) {
        // Battery Level
        const batteryLevel = data.power.battery.capacity;
        const batteryElement = document.getElementById('battery-level');
        const batteryBar = document.getElementById('battery-bar');
        const batteryStatus = document.getElementById('battery-status');
        
        if (batteryElement) batteryElement.textContent = `${batteryLevel.toFixed(0)}%`;
        if (batteryBar) batteryBar.style.width = `${batteryLevel}%`;
        
        // Update battery status color
        const batteryStatusClass = this.getStatusClass(data.power.battery.status);
        if (batteryStatus) {
            batteryStatus.className = `${batteryStatusClass} w-12 h-12 rounded-full flex items-center justify-center`;
        }
        
        // Solar Power
        const solarPower = data.power.solar.power;
        const solarElement = document.getElementById('solar-power');
        const solarStatus = document.getElementById('solar-status');
        
        if (solarElement) solarElement.textContent = `${(solarPower / 1000).toFixed(1)}kW`;
        
        const solarStatusClass = this.getStatusClass(data.power.solar.status);
        if (solarStatus) {
            solarStatus.className = `${solarStatusClass} w-12 h-12 rounded-full flex items-center justify-center`;
        }
        
        // Temperature
        const temperature = data.thermal.processor;
        const tempElement = document.getElementById('temperature');
        const tempStatus = document.getElementById('temp-status');
        
        if (tempElement) tempElement.textContent = `${temperature}°C`;
        
        const tempStatusClass = this.getStatusClass(data.thermal.status);
        if (tempStatus) {
            tempStatus.className = `${tempStatusClass} w-12 h-12 rounded-full flex items-center justify-center`;
        }
        
        // Signal Strength
        const signalStrength = data.communication.signalStrength;
        const signalElement = document.getElementById('signal-strength');
        const signalStatus = document.getElementById('signal-status');
        
        if (signalElement) signalElement.textContent = `${signalStrength}dBm`;
        
        const signalStatusClass = this.getStatusClass(data.communication.status);
        if (signalStatus) {
            signalStatus.className = `${signalStatusClass} w-12 h-12 rounded-full flex items-center justify-center`;
        }
    }
    
    updateCharts(data) {
        const timeIndex = this.chartTimeIndex || 0;
        this.chartTimeIndex = timeIndex + 1;
        
        // Update power chart
        if (this.charts.power) {
            this.charts.power.data.labels.push(timeIndex);
            this.charts.power.data.datasets[0].data.push(data.power.battery.voltage);
            this.charts.power.data.datasets[1].data.push(data.power.solar.power);
            this.charts.power.data.datasets[2].data.push(data.power.battery.current);
            
            // Keep only last 60 points (1 minute)
            if (this.charts.power.data.labels.length > 60) {
                this.charts.power.data.labels.shift();
                this.charts.power.data.datasets.forEach(dataset => dataset.data.shift());
            }
            
            this.charts.power.update('none');
        }
        
        // Update thermal chart
        if (this.charts.thermal) {
            this.charts.thermal.data.labels.push(timeIndex);
            this.charts.thermal.data.datasets[0].data.push(data.thermal.processor);
            this.charts.thermal.data.datasets[1].data.push(data.thermal.battery);
            this.charts.thermal.data.datasets[2].data.push(data.thermal.solar);
            this.charts.thermal.data.datasets[3].data.push(data.thermal.radiator);
            
            // Keep only last 60 points
            if (this.charts.thermal.data.labels.length > 60) {
                this.charts.thermal.data.labels.shift();
                this.charts.thermal.data.datasets.forEach(dataset => dataset.data.shift());
            }
            
            this.charts.thermal.update('none');
        }
    }
    
    updateOverallStatus(data) {
        const statusElement = document.getElementById('overall-status');
        if (!statusElement) return;
        
        // Determine overall status based on all subsystems
        const statuses = [
            data.power.battery.status,
            data.power.solar.status,
            data.thermal.status,
            data.communication.status
        ];
        
        let overallStatus = 'NOMINAL';
        let statusColor = 'text-green-400';
        
        if (statuses.includes('critical')) {
            overallStatus = 'CRITICAL';
            statusColor = 'text-red-400';
        } else if (statuses.includes('warning')) {
            overallStatus = 'WARNING';
            statusColor = 'text-yellow-400';
        }
        
        statusElement.textContent = overallStatus;
        statusElement.className = `text-xl font-semibold ${statusColor}`;
    }
    
    handleAnomaly(anomaly) {
        console.log('Anomaly detected:', anomaly);
        
        // Add to anomaly chart
        if (this.charts.anomaly) {
            const datasetIndex = anomaly.severity === 'critical' ? 2 : 
                                 anomaly.severity === 'warning' ? 1 : 0;
            
            this.charts.anomaly.data.datasets[datasetIndex].data.push({
                x: anomaly.timestamp,
                y: anomaly.score || 0.8
            });
            
            // Keep only last 100 anomalies per severity
            if (this.charts.anomaly.data.datasets[datasetIndex].data.length > 100) {
                this.charts.anomaly.data.datasets[datasetIndex].data.shift();
            }
            
            this.charts.anomaly.update('none');
        }
        
        // Show notification
        this.showNotification(
            `${anomaly.severity.toUpperCase()} Anomaly`,
            anomaly.message,
            anomaly.severity
        );
        
        // Add to alerts list
        this.addToAlertsList(anomaly);
        
        // Trigger recommendations update
        if (window.recommendationEngine) {
            window.recommendationEngine.processAnomaly(anomaly);
        }
    }
    
    addToAlertsList(anomaly) {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;
        
        const alertElement = document.createElement('div');
        alertElement.className = `p-3 rounded-lg border-l-4 ${
            anomaly.severity === 'critical' ? 'bg-red-900 border-red-500' :
            anomaly.severity === 'warning' ? 'bg-yellow-900 border-yellow-500' :
            'bg-blue-900 border-blue-500'
        }`;
        
        alertElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="font-medium text-sm">${anomaly.subsystem.toUpperCase()}</p>
                    <p class="text-xs text-gray-300">${anomaly.message}</p>
                    <p class="text-xs text-gray-400 mt-1">${new Date(anomaly.timestamp).toLocaleTimeString()}</p>
                </div>
                <button onclick="acknowledgeAnomaly('${anomaly.id}')" 
                        class="text-gray-400 hover:text-white text-xs">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `;
        
        // Add to top of list
        alertsList.insertBefore(alertElement, alertsList.firstChild);
        
        // Keep only last 10 alerts visible
        while (alertsList.children.length > 10) {
            alertsList.removeChild(alertsList.lastChild);
        }
        
        // Make acknowledge function global
        window.acknowledgeAnomaly = (anomalyId) => {
            window.anomalyDetector.acknowledgeAnomaly(anomalyId);
            alertElement.style.opacity = '0.5';
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.parentNode.removeChild(alertElement);
                }
            }, 1000);
        };
    }
    
    showNotification(title, message, type = 'info') {
        const toast = document.getElementById('notification-toast');
        const toastIcon = document.getElementById('toast-icon');
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        
        if (!toast || !toastIcon || !toastTitle || !toastMessage) return;
        
        // Set content
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Set icon and colors based on type
        let iconClass = 'fas fa-info-circle';
        let colorClass = 'bg-blue-600';
        
        switch (type) {
            case 'success':
                iconClass = 'fas fa-check-circle';
                colorClass = 'bg-green-600';
                break;
            case 'warning':
                iconClass = 'fas fa-exclamation-triangle';
                colorClass = 'bg-yellow-600';
                break;
            case 'critical':
                iconClass = 'fas fa-exclamation-circle';
                colorClass = 'bg-red-600';
                break;
        }
        
        toastIcon.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`;
        toastIcon.innerHTML = `<i class="${iconClass}"></i>`;
        
        // Show notification
        toast.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }
    
    hideNotification() {
        const toast = document.getElementById('notification-toast');
        if (toast) {
            toast.classList.remove('show');
        }
    }
    
    processNaturalLanguageQuery(query) {
        const responseElement = document.getElementById('nl-response');
        const queryInput = document.getElementById('nl-query');
        
        if (!responseElement) return;
        
        responseElement.classList.remove('hidden');
        responseElement.innerHTML = '<div class="loading-shimmer h-4 w-full rounded"></div>';
        
        // Simple NL processing (would use real NLP in production)
        setTimeout(() => {
            const response = this.generateNLResponse(query.toLowerCase());
            responseElement.innerHTML = response;
            queryInput.value = '';
        }, 1000);
    }
    
    generateNLResponse(query) {
        const latestData = window.telemetrySimulator.getLatestTelemetry();
        if (!latestData) return 'No telemetry data available.';
        
        if (query.includes('battery') && query.includes('health')) {
            const battery = latestData.power.battery;
            return `Battery Health: ${battery.capacity.toFixed(1)}% capacity, ${battery.voltage.toFixed(1)}V, ${battery.temperature.toFixed(1)}°C. Status: ${battery.status.toUpperCase()}.`;
        }
        
        if (query.includes('solar') && query.includes('power')) {
            const solar = latestData.power.solar;
            return `Solar Power: ${(solar.power/1000).toFixed(1)}kW, efficiency ${solar.efficiency.toFixed(1)}%. Status: ${solar.status.toUpperCase()}.`;
        }
        
        if (query.includes('temperature') || query.includes('thermal')) {
            const thermal = latestData.thermal;
            return `Thermal Status: Processor ${thermal.processor}°C, Battery ${thermal.battery}°C, Solar ${thermal.solar}°C. Overall: ${thermal.status.toUpperCase()}.`;
        }
        
        if (query.includes('communication') || query.includes('signal')) {
            const comm = latestData.communication;
            return `Communication: Signal strength ${comm.signalStrength}dBm, data rate ${comm.dataRate}kbps, error rate ${(comm.errorRate*100).toFixed(3)}%. Status: ${comm.status.toUpperCase()}.`;
        }
        
        if (query.includes('anomal')) {
            const activeAnomalies = window.anomalyDetector.getActiveAnomalies();
            if (activeAnomalies.length === 0) {
                return 'No active anomalies detected. All systems operating nominally.';
            }
            return `${activeAnomalies.length} active anomal${activeAnomalies.length > 1 ? 'ies' : 'y'}: ${activeAnomalies.map(a => `${a.subsystem} ${a.severity}`).join(', ')}.`;
        }
        
        if (query.includes('status') || query.includes('health') || query.includes('overview')) {
            const battery = latestData.power.battery;
            const solar = latestData.power.solar;
            const thermal = latestData.thermal;
            const comm = latestData.communication;
            
            return `System Overview: Battery ${battery.capacity.toFixed(0)}% (${battery.status}), Solar ${(solar.power/1000).toFixed(1)}kW (${solar.status}), Thermal ${thermal.processor}°C (${thermal.status}), Comms ${comm.signalStrength}dBm (${comm.status}).`;
        }
        
        return 'I can provide information about battery health, solar power, thermal status, communication systems, anomalies, or overall system status. Please ask about specific subsystems.';
    }
    
    startMissionTimer() {
        const missionTimeElement = document.getElementById('mission-time');
        if (!missionTimeElement) return;
        
        const startTime = Date.now();
        
        setInterval(() => {
            const elapsed = Date.now() - startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            missionTimeElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'critical':
                return 'status-critical';
            case 'warning':
                return 'status-warning';
            default:
                return 'status-normal';
        }
    }
}

// Make hideNotification global
window.hideNotification = () => {
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.classList.remove('show');
    }
};

// Global dashboard controller instance
window.dashboardController = new DashboardController();