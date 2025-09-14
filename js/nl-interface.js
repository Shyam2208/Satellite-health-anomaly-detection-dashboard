/**
 * Natural Language Interface for Mission Control
 * Advanced conversational AI for satellite operations
 */

class NaturalLanguageInterface {
    constructor() {
        this.conversationHistory = [];
        this.contextMemory = {};
        this.commandPatterns = this.initializeCommandPatterns();
        this.responseTemplates = this.initializeResponseTemplates();
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.isProcessing = false;
        
        // Initialize conversation
        this.initializeInterface();
    }
    
    initializeInterface() {
        console.log('Natural Language Interface initialized');
        
        // Add welcome message
        this.addToConversationHistory('system', 'Natural Language Interface online. Ask me about satellite health, system status, or operational recommendations.');
        
        // Setup enhanced input handling
        this.setupEnhancedInput();
    }
    
    setupEnhancedInput() {
        const queryInput = document.getElementById('nl-query');
        if (!queryInput) return;
        
        // Add input suggestions
        queryInput.addEventListener('focus', () => {
            this.showInputSuggestions();
        });
        
        queryInput.addEventListener('input', (e) => {
            this.handleInputChange(e.target.value);
        });
        
        // Enhanced keyboard shortcuts
        queryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window.processNLQuery();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autoCompleteInput();
            }
        });
    }
    
    initializeCommandPatterns() {
        return {
            // System status queries
            status: {
                patterns: [
                    /(?:what|how).*(?:status|health|condition|state)/i,
                    /(?:show|display|tell).*(?:overall|system|general|current)/i,
                    /(?:how.*doing|everything.*ok|all.*systems)/i
                ],
                handler: 'handleSystemStatusQuery'
            },
            
            // Subsystem specific queries
            battery: {
                patterns: [
                    /(?:battery|power|energy|charge|capacity)/i,
                    /(?:how.*battery|battery.*health|power.*level)/i
                ],
                handler: 'handleBatteryQuery'
            },
            
            solar: {
                patterns: [
                    /(?:solar|panel|sun|generation|producing)/i,
                    /(?:how.*solar|solar.*power|panel.*working)/i
                ],
                handler: 'handleSolarQuery'
            },
            
            thermal: {
                patterns: [
                    /(?:temperature|thermal|heat|cooling|hot|cold)/i,
                    /(?:how.*hot|temperature.*reading|thermal.*status)/i
                ],
                handler: 'handleThermalQuery'
            },
            
            communication: {
                patterns: [
                    /(?:communication|signal|antenna|transmission|contact)/i,
                    /(?:signal.*strength|can.*communicate|contact.*ground)/i
                ],
                handler: 'handleCommunicationQuery'
            },
            
            // Anomaly queries
            anomalies: {
                patterns: [
                    /(?:anomal|problem|issue|error|fault|wrong)/i,
                    /(?:what.*wrong|any.*problem|detect.*issue)/i,
                    /(?:alert|warning|critical|emergency)/i
                ],
                handler: 'handleAnomalyQuery'
            },
            
            // Predictive queries
            prediction: {
                patterns: [
                    /(?:predict|forecast|future|will|expect|trend)/i,
                    /(?:what.*happen|when.*fail|how.*long)/i,
                    /(?:maintenance|schedule|due)/i
                ],
                handler: 'handlePredictiveQuery'
            },
            
            // Recommendations
            recommendations: {
                patterns: [
                    /(?:recommend|suggest|advice|should|action|do)/i,
                    /(?:what.*should|how.*fix|next.*step)/i
                ],
                handler: 'handleRecommendationQuery'
            },
            
            // Control commands
            control: {
                patterns: [
                    /(?:activate|deactivate|turn|switch|enable|disable)/i,
                    /(?:safe.*mode|emergency|shutdown|restart)/i,
                    /(?:simulate|test|failure|demo)/i
                ],
                handler: 'handleControlCommand'
            },
            
            // Historical data
            history: {
                patterns: [
                    /(?:history|past|previous|last|ago|trend)/i,
                    /(?:show.*data|chart|graph|plot)/i
                ],
                handler: 'handleHistoryQuery'
            },
            
            // Help and explanation
            help: {
                patterns: [
                    /(?:help|explain|what.*mean|how.*work|tutorial)/i,
                    /(?:what.*can|available.*command|capability)/i
                ],
                handler: 'handleHelpQuery'
            }
        };
    }
    
    initializeResponseTemplates() {
        return {
            greeting: [
                "Hello! I'm your Mission Control AI assistant. How can I help you today?",
                "Welcome to the Natural Language Interface. What would you like to know about the satellite?",
                "Hi there! I can provide information about satellite health, anomalies, predictions, and recommendations."
            ],
            
            acknowledgment: [
                "I understand you're asking about {topic}.",
                "Let me check the {subsystem} status for you.",
                "Looking into {query_type} information..."
            ],
            
            error: [
                "I'm not sure I understand that request. Could you please rephrase?",
                "I couldn't process that query. Try asking about battery, solar, thermal, communication, or overall status.",
                "That request is unclear. You can ask about system health, anomalies, predictions, or recommendations."
            ],
            
            noData: [
                "No data available for that request at this time.",
                "I don't have sufficient information to answer that question.",
                "The requested data is not currently available."
            ]
        };
    }
    
    initializeKnowledgeBase() {
        return {
            subsystems: {
                battery: {
                    description: "Primary power storage system using lithium-ion technology",
                    normalRanges: {
                        voltage: "22-28V",
                        capacity: "80-100%",
                        temperature: "15-35°C"
                    },
                    commonIssues: [
                        "Overheating during eclipse periods",
                        "Capacity degradation over time",
                        "Voltage fluctuations under load"
                    ]
                },
                
                solar: {
                    description: "Photovoltaic array providing primary power generation",
                    normalRanges: {
                        power: "1.8-2.8kW",
                        efficiency: "85-95%",
                        temperature: "-20 to 80°C"
                    },
                    commonIssues: [
                        "Panel degradation from radiation",
                        "Tracking system misalignment",
                        "Dust or debris accumulation"
                    ]
                },
                
                thermal: {
                    description: "Temperature management and heat dissipation system",
                    normalRanges: {
                        processor: "20-60°C",
                        battery: "15-35°C",
                        radiator: "-60 to -30°C"
                    },
                    commonIssues: [
                        "Inadequate heat dissipation",
                        "Thermal cycling stress",
                        "Radiator efficiency degradation"
                    ]
                },
                
                communication: {
                    description: "RF communication system for ground contact",
                    normalRanges: {
                        signalStrength: "-110 to -70dBm",
                        dataRate: "128-512kbps",
                        errorRate: "< 0.1%"
                    },
                    commonIssues: [
                        "Signal attenuation during maneuvers",
                        "Antenna pointing errors",
                        "Interference from other systems"
                    ]
                }
            },
            
            operationalModes: {
                nominal: "Normal operational mode with all systems functioning within parameters",
                safe: "Reduced functionality mode activated during anomalies or emergencies",
                eclipse: "Power conservation mode during solar eclipse periods",
                maneuver: "Attitude control mode for orbital adjustments"
            },
            
            procedures: {
                emergency: [
                    "Assess severity of anomaly",
                    "Implement immediate safeguards",
                    "Activate backup systems if necessary",
                    "Notify ground control",
                    "Execute recovery procedures"
                ],
                maintenance: [
                    "Schedule routine health checks",
                    "Monitor performance trends",
                    "Calibrate sensors periodically",
                    "Update software as needed"
                ]
            }
        };
    }
    
    async processQuery(query) {
        if (this.isProcessing) {
            return "Please wait for the current query to complete.";
        }
        
        this.isProcessing = true;
        
        try {
            // Add user query to history
            this.addToConversationHistory('user', query);
            
            // Parse and understand the query
            const intent = this.parseUserIntent(query);
            
            // Generate contextual response
            const response = await this.generateResponse(intent, query);
            
            // Add AI response to history
            this.addToConversationHistory('assistant', response);
            
            // Update context memory
            this.updateContextMemory(intent, query, response);
            
            return response;
            
        } catch (error) {
            console.error('NL Processing error:', error);
            return "I encountered an error processing your request. Please try again.";
        } finally {
            this.isProcessing = false;
        }
    }
    
    parseUserIntent(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        // Check for multiple intents
        const intents = [];
        
        for (const [category, config] of Object.entries(this.commandPatterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(normalizedQuery)) {
                    intents.push({
                        category,
                        confidence: this.calculateConfidence(normalizedQuery, pattern),
                        handler: config.handler
                    });
                    break;
                }
            }
        }
        
        // Sort by confidence and return top intent
        intents.sort((a, b) => b.confidence - a.confidence);
        
        return intents.length > 0 ? intents[0] : {
            category: 'unknown',
            confidence: 0,
            handler: 'handleUnknownQuery'
        };
    }
    
    calculateConfidence(query, pattern) {
        const match = query.match(pattern);
        if (!match) return 0;
        
        // Basic confidence calculation based on match length and specificity
        const matchLength = match[0].length;
        const queryLength = query.length;
        const specificity = matchLength / queryLength;
        
        return Math.min(1, specificity * 2); // Scale to 0-1
    }
    
    async generateResponse(intent, query) {
        const handlerMethod = intent.handler;
        
        if (typeof this[handlerMethod] === 'function') {
            return await this[handlerMethod](query, intent);
        } else {
            return this.handleUnknownQuery(query, intent);
        }
    }
    
    // Intent Handlers
    
    async handleSystemStatusQuery(query, intent) {
        const telemetry = window.telemetrySimulator?.getLatestTelemetry();
        if (!telemetry) {
            return "Telemetry data is not currently available. Please check system connections.";
        }
        
        const battery = telemetry.power.battery;
        const solar = telemetry.power.solar;
        const thermal = telemetry.thermal;
        const comm = telemetry.communication;
        
        // Determine overall health
        const statuses = [battery.status, solar.status, thermal.status, comm.status];
        const overallStatus = statuses.includes('critical') ? 'CRITICAL' : 
                            statuses.includes('warning') ? 'WARNING' : 'NOMINAL';
        
        let response = `🛰️ **SATELLITE STATUS REPORT**\\n\\n`;
        response += `**Overall Status**: ${overallStatus}\\n\\n`;
        
        response += `**Power Systems:**\\n`;
        response += `• Battery: ${battery.capacity.toFixed(1)}% capacity, ${battery.voltage.toFixed(1)}V (${battery.status.toUpperCase()})\\n`;
        response += `• Solar: ${(solar.power/1000).toFixed(1)}kW generation, ${solar.efficiency.toFixed(1)}% efficiency (${solar.status.toUpperCase()})\\n\\n`;
        
        response += `**Thermal Management:**\\n`;
        response += `• Processor: ${thermal.processor}°C\\n`;
        response += `• Battery: ${thermal.battery}°C\\n`;
        response += `• Status: ${thermal.status.toUpperCase()}\\n\\n`;
        
        response += `**Communications:**\\n`;
        response += `• Signal: ${comm.signalStrength}dBm\\n`;
        response += `• Data Rate: ${comm.dataRate}kbps\\n`;
        response += `• Status: ${comm.status.toUpperCase()}\\n\\n`;
        
        // Add active anomalies if any
        const anomalies = window.anomalyDetector?.getActiveAnomalies() || [];
        if (anomalies.length > 0) {
            response += `**⚠️ Active Anomalies**: ${anomalies.length}\\n`;
            anomalies.slice(0, 3).forEach(a => {
                response += `• ${a.subsystem.toUpperCase()}: ${a.message}\\n`;
            });
        }
        
        return response;
    }
    
    async handleBatteryQuery(query, intent) {
        const telemetry = window.telemetrySimulator?.getLatestTelemetry();
        if (!telemetry) return this.getRandomTemplate('noData');
        
        const battery = telemetry.power.battery;
        const predictions = window.recommendationEngine?.predictiveModels.battery.getPredictions();
        
        let response = `🔋 **BATTERY SYSTEM STATUS**\\n\\n`;
        response += `**Current Status**: ${battery.status.toUpperCase()}\\n`;
        response += `**Capacity**: ${battery.capacity.toFixed(1)}% (${this.getBatteryHealthDescription(battery.capacity)})\\n`;
        response += `**Voltage**: ${battery.voltage.toFixed(1)}V ${this.getVoltageAssessment(battery.voltage)}\\n`;
        response += `**Current**: ${battery.current.toFixed(1)}A ${battery.current < 0 ? '(discharging)' : '(charging)'}\\n`;
        response += `**Temperature**: ${battery.temperature.toFixed(1)}°C ${this.getThermalAssessment(battery.temperature, 'battery')}\\n\\n`;
        
        if (predictions && predictions.degradationRisk > 0.3) {
            response += `**⚠️ Predictive Analysis**:\\n`;
            response += `• Degradation Risk: ${(predictions.degradationRisk * 100).toFixed(1)}%\\n`;
            if (predictions.timeToFailure) {
                response += `• Estimated Service Life: ${Math.round(predictions.timeToFailure / 3600)} hours\\n`;
            }
        }
        
        // Add maintenance recommendations
        const batteryRecommendations = this.getSubsystemRecommendations('battery');
        if (batteryRecommendations.length > 0) {
            response += `\\n**Recommendations**:\\n`;
            batteryRecommendations.forEach(rec => {
                response += `• ${rec}\\n`;
            });
        }
        
        return response;
    }
    
    async handleSolarQuery(query, intent) {
        const telemetry = window.telemetrySimulator?.getLatestTelemetry();
        if (!telemetry) return this.getRandomTemplate('noData');
        
        const solar = telemetry.power.solar;
        const isEclipse = telemetry.power.eclipse;
        
        let response = `☀️ **SOLAR POWER SYSTEM STATUS**\\n\\n`;
        response += `**Current Status**: ${solar.status.toUpperCase()}\\n`;
        response += `**Power Generation**: ${(solar.power/1000).toFixed(1)}kW\\n`;
        response += `**Efficiency**: ${solar.efficiency.toFixed(1)}%\\n`;
        response += `**Panel Temperature**: ${solar.temperature.toFixed(1)}°C\\n`;
        response += `**Orbital Position**: ${isEclipse ? '🌑 Eclipse Period' : '☀️ Sunlit Phase'}\\n\\n`;
        
        if (isEclipse) {
            response += `**Eclipse Information**:\\n`;
            response += `• Currently in Earth's shadow\\n`;
            response += `• Running on battery power\\n`;
            response += `• Solar generation minimal\\n\\n`;
        } else {
            const expectedPower = 2400; // kW
            const efficiency = (solar.power / expectedPower) * 100;
            response += `**Performance Analysis**:\\n`;
            response += `• Expected Power: ${(expectedPower/1000).toFixed(1)}kW\\n`;
            response += `• Current Efficiency: ${efficiency.toFixed(1)}% of expected\\n`;
            
            if (efficiency < 80) {
                response += `• ⚠️ Below optimal performance\\n`;
            }
        }
        
        return response;
    }
    
    async handleThermalQuery(query, intent) {
        const telemetry = window.telemetrySimulator?.getLatestTelemetry();
        if (!telemetry) return this.getRandomTemplate('noData');
        
        const thermal = telemetry.thermal;
        
        let response = `🌡️ **THERMAL MANAGEMENT STATUS**\\n\\n`;
        response += `**Overall Status**: ${thermal.status.toUpperCase()}\\n\\n`;
        
        response += `**Component Temperatures**:\\n`;
        response += `• Processor: ${thermal.processor}°C ${this.getThermalAssessment(thermal.processor, 'processor')}\\n`;
        response += `• Battery: ${thermal.battery}°C ${this.getThermalAssessment(thermal.battery, 'battery')}\\n`;
        response += `• Solar Panels: ${thermal.solar}°C ${this.getThermalAssessment(thermal.solar, 'solar')}\\n`;
        response += `• Radiator: ${thermal.radiator}°C ${this.getThermalAssessment(thermal.radiator, 'radiator')}\\n\\n`;
        
        // Thermal trends
        const thermalHistory = window.telemetrySimulator?.getHistoricalData('thermal', 1) || [];
        if (thermalHistory.length > 10) {
            const recent = thermalHistory.slice(-5);
            const earlier = thermalHistory.slice(-10, -5);
            
            const recentAvg = recent.reduce((sum, d) => sum + d.thermal.processor, 0) / recent.length;
            const earlierAvg = earlier.reduce((sum, d) => sum + d.thermal.processor, 0) / earlier.length;
            const trend = recentAvg - earlierAvg;
            
            response += `**Temperature Trend**:\\n`;
            response += `• Processor trend: ${trend > 1 ? '📈 Rising' : trend < -1 ? '📉 Falling' : '➡️ Stable'} (${trend.toFixed(1)}°C change)\\n`;
        }
        
        return response;
    }
    
    async handleCommunicationQuery(query, intent) {
        const telemetry = window.telemetrySimulator?.getLatestTelemetry();
        if (!telemetry) return this.getRandomTemplate('noData');
        
        const comm = telemetry.communication;
        
        let response = `📡 **COMMUNICATION SYSTEM STATUS**\\n\\n`;
        response += `**Overall Status**: ${comm.status.toUpperCase()}\\n`;
        response += `**Signal Strength**: ${comm.signalStrength}dBm ${this.getSignalAssessment(comm.signalStrength)}\\n`;
        response += `**Data Rate**: ${comm.dataRate}kbps\\n`;
        response += `**Error Rate**: ${(comm.errorRate * 100).toFixed(3)}%\\n`;
        response += `**Antenna Temperature**: ${comm.antennaTemperature.toFixed(1)}°C\\n\\n`;
        
        // Communication quality assessment
        const quality = this.assessCommunicationQuality(comm);
        response += `**Link Quality**: ${quality.description}\\n`;
        response += `**Expected Coverage**: ${quality.coverage}\\n`;
        
        if (quality.issues.length > 0) {
            response += `\\n**Potential Issues**:\\n`;
            quality.issues.forEach(issue => {
                response += `• ${issue}\\n`;
            });
        }
        
        return response;
    }
    
    async handleAnomalyQuery(query, intent) {
        const activeAnomalies = window.anomalyDetector?.getActiveAnomalies() || [];
        const anomalyHistory = window.anomalyDetector?.getAnomalyHistory(24) || [];
        
        let response = `🚨 **ANOMALY DETECTION REPORT**\\n\\n`;
        
        if (activeAnomalies.length === 0) {
            response += `**✅ No Active Anomalies**\\n`;
            response += `All systems operating within normal parameters.\\n\\n`;
        } else {
            response += `**⚠️ Active Anomalies: ${activeAnomalies.length}**\\n\\n`;
            
            activeAnomalies.slice(0, 5).forEach((anomaly, index) => {
                response += `${index + 1}. **${anomaly.subsystem.toUpperCase()} - ${anomaly.severity.toUpperCase()}**\\n`;
                response += `   • ${anomaly.message}\\n`;
                response += `   • Risk Level: ${(anomaly.riskLevel * 100).toFixed(0)}%\\n`;
                response += `   • Detected: ${new Date(anomaly.timestamp).toLocaleTimeString()}\\n`;
                if (anomaly.explanation) {
                    response += `   • Explanation: ${anomaly.explanation}\\n`;
                }
                response += `\\n`;
            });
        }
        
        // Historical anomaly summary
        if (anomalyHistory.length > 0) {
            const last24Hours = anomalyHistory.length;
            const criticalCount = anomalyHistory.filter(a => a.severity === 'critical').length;
            const warningCount = anomalyHistory.filter(a => a.severity === 'warning').length;
            
            response += `**📊 24-Hour Summary**:\\n`;
            response += `• Total Anomalies: ${last24Hours}\\n`;
            response += `• Critical: ${criticalCount}\\n`;
            response += `• Warning: ${warningCount}\\n`;
        }
        
        return response;
    }
    
    async handlePredictiveQuery(query, intent) {
        const predictions = window.recommendationEngine?.getPredictiveMaintenance() || {};
        
        let response = `🔮 **PREDICTIVE ANALYSIS REPORT**\\n\\n`;
        
        // Battery predictions
        if (predictions.battery && predictions.battery.length > 0) {
            response += `**🔋 Battery Predictions**:\\n`;
            predictions.battery.forEach(pred => {
                response += `• ${pred.task}: ${pred.priority} priority\\n`;
                response += `  Due in: ${Math.round(pred.dueIn / 3600000)} hours\\n`;
            });
            response += `\\n`;
        }
        
        // General predictive insights
        const telemetry = window.telemetrySimulator?.getLatestTelemetry();
        if (telemetry) {
            response += `**🎯 Predictive Insights**:\\n`;
            
            // Battery health trend
            const batteryHealth = telemetry.power.battery.capacity;
            if (batteryHealth < 90) {
                const degradationRate = 100 - batteryHealth;
                response += `• Battery degradation detected: ${degradationRate.toFixed(1)}% below nominal\\n`;
            }
            
            // Thermal predictions
            if (telemetry.thermal.processor > 50) {
                response += `• Elevated processor temperature may require attention\\n`;
            }
            
            // Solar efficiency
            const solarEfficiency = telemetry.power.solar.efficiency;
            if (solarEfficiency < 90) {
                response += `• Solar efficiency below optimal: ${solarEfficiency.toFixed(1)}%\\n`;
            }
        }
        
        // Future maintenance recommendations
        response += `\\n**🔧 Upcoming Maintenance**:\\n`;
        response += `• System health assessment recommended within 24 hours\\n`;
        response += `• Sensor calibration due in 7 days\\n`;
        response += `• Battery capacity test due in 14 days\\n`;
        
        return response;
    }
    
    async handleRecommendationQuery(query, intent) {
        const activeRecommendations = window.recommendationEngine?.getActiveRecommendations() || [];
        
        let response = `💡 **SYSTEM RECOMMENDATIONS**\\n\\n`;
        
        if (activeRecommendations.length === 0) {
            response += `**✅ No Active Recommendations**\\n`;
            response += `All systems are operating optimally. Continue monitoring.\\n\\n`;
            response += `**General Best Practices**:\\n`;
            response += `• Monitor telemetry trends regularly\\n`;
            response += `• Perform scheduled maintenance on time\\n`;
            response += `• Keep backup systems ready\\n`;
        } else {
            response += `**📋 Active Recommendations: ${activeRecommendations.length}**\\n\\n`;
            
            activeRecommendations.slice(0, 5).forEach((rec, index) => {
                response += `${index + 1}. **${rec.title}** (${rec.priority})\\n`;
                response += `   • ${rec.description}\\n`;
                response += `   • Risk Level: ${(rec.riskLevel * 100).toFixed(0)}%\\n`;
                
                if (rec.timeToAct) {
                    const timeToAct = this.formatTimeToAct(rec.timeToAct);
                    response += `   • Time to Act: ${timeToAct}\\n`;
                }
                
                if (rec.actions && rec.actions.length > 0) {
                    response += `   • Recommended Actions:\\n`;
                    rec.actions.slice(0, 3).forEach(action => {
                        response += `     - ${action}\\n`;
                    });
                }
                response += `\\n`;
            });
        }
        
        return response;
    }
    
    async handleControlCommand(query, intent) {
        // Safety check - only allow simulation commands
        if (query.toLowerCase().includes('simulate') || query.toLowerCase().includes('demo')) {
            let response = `🎮 **SIMULATION CONTROLS**\\n\\n`;
            response += `Available failure simulations:\\n`;
            response += `• "simulate battery failure" - Battery overheating simulation\\n`;
            response += `• "simulate solar failure" - Solar panel degradation\\n`;
            response += `• "simulate thermal failure" - Thermal anomaly\\n`;
            response += `• "simulate communication failure" - Signal loss\\n\\n`;
            
            // Check if specific simulation was requested
            if (query.toLowerCase().includes('battery')) {
                window.simulateFailure('battery');
                response += `✅ Battery failure simulation activated!\\n`;
            } else if (query.toLowerCase().includes('solar')) {
                window.simulateFailure('solar');
                response += `✅ Solar failure simulation activated!\\n`;
            } else if (query.toLowerCase().includes('thermal')) {
                window.simulateFailure('thermal');
                response += `✅ Thermal failure simulation activated!\\n`;
            } else if (query.toLowerCase().includes('communication')) {
                window.simulateFailure('communication');
                response += `✅ Communication failure simulation activated!\\n`;
            }
            
            return response;
        } else {
            return `⚠️ **SAFETY RESTRICTION**\\n\\nActual satellite control commands are not available through this interface for safety reasons. Only simulation commands are supported.\\n\\nFor real operations, use the authorized mission control systems.`;
        }
    }
    
    async handleHistoryQuery(query, intent) {
        const powerHistory = window.telemetrySimulator?.getHistoricalData('power', 5) || [];
        
        if (powerHistory.length === 0) {
            return this.getRandomTemplate('noData');
        }
        
        let response = `📈 **HISTORICAL DATA SUMMARY**\\n\\n`;
        
        // Calculate trends
        const recent = powerHistory.slice(-10);
        const batteryTrend = this.calculateTrend(recent.map(d => d.power.battery.voltage));
        const solarTrend = this.calculateTrend(recent.map(d => d.power.solar.power));
        
        response += `**5-Minute Trends**:\\n`;
        response += `• Battery Voltage: ${batteryTrend.direction} ${batteryTrend.description}\\n`;
        response += `• Solar Power: ${solarTrend.direction} ${solarTrend.description}\\n\\n`;
        
        // Recent statistics
        const latestBattery = recent[recent.length - 1].power.battery.voltage;
        const avgBattery = recent.reduce((sum, d) => sum + d.power.battery.voltage, 0) / recent.length;
        
        response += `**Recent Statistics**:\\n`;
        response += `• Current Battery: ${latestBattery.toFixed(1)}V\\n`;
        response += `• 5-min Average: ${avgBattery.toFixed(1)}V\\n`;
        response += `• Data Points: ${powerHistory.length}\\n`;
        
        return response;
    }
    
    async handleHelpQuery(query, intent) {
        let response = `🤖 **NATURAL LANGUAGE INTERFACE HELP**\\n\\n`;
        
        response += `**What I can help you with**:\\n`;
        response += `• 🛰️ System status and health reports\\n`;
        response += `• 🔋 Battery, solar, thermal, and communication info\\n`;
        response += `• 🚨 Anomaly detection and alerts\\n`;
        response += `• 🔮 Predictive analysis and maintenance\\n`;
        response += `• 💡 Operational recommendations\\n`;
        response += `• 📈 Historical data and trends\\n`;
        response += `• 🎮 Failure simulations (demo mode)\\n\\n`;
        
        response += `**Example Questions**:\\n`;
        response += `• "What's the overall satellite status?"\\n`;
        response += `• "How is the battery health?"\\n`;
        response += `• "Are there any anomalies?"\\n`;
        response += `• "What are your recommendations?"\\n`;
        response += `• "Predict future maintenance needs"\\n`;
        response += `• "Simulate battery failure"\\n\\n`;
        
        response += `**Tips**:\\n`;
        response += `• Use natural language - I understand conversational queries\\n`;
        response += `• Ask follow-up questions for more details\\n`;
        response += `• Use Tab for auto-completion\\n`;
        response += `• I remember context within our conversation\\n`;
        
        return response;
    }
    
    async handleUnknownQuery(query, intent) {
        const suggestions = this.generateQuerySuggestions(query);
        
        let response = `❓ I'm not sure I understand that request.\\n\\n`;
        
        if (suggestions.length > 0) {
            response += `**Did you mean**:\\n`;
            suggestions.forEach(suggestion => {
                response += `• ${suggestion}\\n`;
            });
            response += `\\n`;
        }
        
        response += `**I can help with**:\\n`;
        response += `• System status and health\\n`;
        response += `• Anomaly detection\\n`;
        response += `• Predictive maintenance\\n`;
        response += `• Operational recommendations\\n`;
        response += `\\nTry asking "help" for more information.`;
        
        return response;
    }
    
    // Helper methods
    
    getBatteryHealthDescription(capacity) {
        if (capacity >= 95) return "Excellent";
        if (capacity >= 85) return "Good";
        if (capacity >= 70) return "Fair";
        if (capacity >= 50) return "Poor";
        return "Critical";
    }
    
    getVoltageAssessment(voltage) {
        if (voltage >= 26) return "(Excellent)";
        if (voltage >= 24) return "(Good)";
        if (voltage >= 22) return "(Normal)";
        if (voltage >= 20) return "(Low)";
        return "(Critical)";
    }
    
    getThermalAssessment(temperature, component) {
        const thresholds = {
            processor: { good: 40, warning: 60, critical: 70 },
            battery: { good: 25, warning: 35, critical: 45 },
            solar: { good: 40, warning: 70, critical: 85 },
            radiator: { good: -40, warning: -20, critical: 0 }
        };
        
        const thresh = thresholds[component] || thresholds.processor;
        
        if (component === 'radiator') {
            if (temperature <= thresh.good) return "(Excellent)";
            if (temperature <= thresh.warning) return "(Normal)";
            if (temperature <= thresh.critical) return "(Warm)";
            return "(Too Hot)";
        } else {
            if (temperature <= thresh.good) return "(Excellent)";
            if (temperature <= thresh.warning) return "(Normal)";
            if (temperature <= thresh.critical) return "(Elevated)";
            return "(Critical)";
        }
    }
    
    getSignalAssessment(signalStrength) {
        if (signalStrength >= -80) return "(Excellent)";
        if (signalStrength >= -90) return "(Good)";
        if (signalStrength >= -100) return "(Fair)";
        if (signalStrength >= -110) return "(Poor)";
        return "(Critical)";
    }
    
    assessCommunicationQuality(comm) {
        const quality = {
            description: "Unknown",
            coverage: "Unknown",
            issues: []
        };
        
        if (comm.signalStrength >= -85) {
            quality.description = "Excellent";
            quality.coverage = "Full duplex, high-rate data";
        } else if (comm.signalStrength >= -95) {
            quality.description = "Good";
            quality.coverage = "Normal operations";
        } else if (comm.signalStrength >= -105) {
            quality.description = "Fair";
            quality.coverage = "Reduced data rate";
            quality.issues.push("Consider antenna adjustment");
        } else {
            quality.description = "Poor";
            quality.coverage = "Limited connectivity";
            quality.issues.push("Signal strength critically low");
            quality.issues.push("Check antenna pointing");
        }
        
        if (comm.errorRate > 0.05) {
            quality.issues.push("High error rate detected");
        }
        
        return quality;
    }
    
    calculateTrend(values) {
        if (values.length < 2) return { direction: "➡️", description: "Insufficient data" };
        
        const first = values[0];
        const last = values[values.length - 1];
        const change = last - first;
        const changePercent = (change / first) * 100;
        
        let direction = "➡️";
        let description = "Stable";
        
        if (Math.abs(changePercent) > 5) {
            if (change > 0) {
                direction = "📈";
                description = `Rising (${changePercent.toFixed(1)}%)`;
            } else {
                direction = "📉";
                description = `Falling (${Math.abs(changePercent).toFixed(1)}%)`;
            }
        }
        
        return { direction, description };
    }
    
    formatTimeToAct(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
        return `${Math.round(seconds / 86400)}d`;
    }
    
    getSubsystemRecommendations(subsystem) {
        const recommendations = [];
        const telemetry = window.telemetrySimulator?.getLatestTelemetry();
        
        if (!telemetry) return recommendations;
        
        switch (subsystem) {
            case 'battery':
                const battery = telemetry.power.battery;
                if (battery.capacity < 80) {
                    recommendations.push("Schedule battery health assessment");
                }
                if (battery.temperature > 35) {
                    recommendations.push("Monitor thermal management");
                }
                break;
            // Add more subsystem-specific recommendations
        }
        
        return recommendations;
    }
    
    generateQuerySuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Simple suggestion logic
        if (queryLower.includes('stat') || queryLower.includes('health')) {
            suggestions.push("What's the overall system status?");
        }
        
        if (queryLower.includes('batt') || queryLower.includes('power')) {
            suggestions.push("How is the battery health?");
        }
        
        if (queryLower.includes('solar') || queryLower.includes('panel')) {
            suggestions.push("What's the solar power status?");
        }
        
        return suggestions.slice(0, 3); // Limit to 3 suggestions
    }
    
    addToConversationHistory(role, content) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });
        
        // Keep history manageable
        if (this.conversationHistory.length > 100) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
    }
    
    updateContextMemory(intent, query, response) {
        this.contextMemory = {
            lastIntent: intent.category,
            lastQuery: query,
            lastResponse: response,
            timestamp: Date.now()
        };
    }
    
    getRandomTemplate(templateName) {
        const templates = this.responseTemplates[templateName];
        if (!templates || templates.length === 0) {
            return "I don't have information available for that request.";
        }
        
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    showInputSuggestions() {
        // Could implement auto-complete dropdown here
        console.log('Input suggestions could be shown here');
    }
    
    handleInputChange(value) {
        // Could implement real-time suggestions here
        if (value.length > 2) {
            // Show suggestions based on partial input
        }
    }
    
    autoCompleteInput() {
        const input = document.getElementById('nl-query');
        if (!input) return;
        
        const value = input.value.toLowerCase();
        const completions = {
            'what': 'What is the satellite status?',
            'how': 'How is the battery health?',
            'show': 'Show me the system overview',
            'predict': 'Predict future maintenance needs',
            'simulate': 'Simulate battery failure'
        };
        
        for (const [prefix, completion] of Object.entries(completions)) {
            if (value.startsWith(prefix)) {
                input.value = completion;
                break;
            }
        }
    }
}

// Global NL interface instance
window.naturalLanguageInterface = new NaturalLanguageInterface();

// Enhanced NL query processing function
window.processNLQuery = async function() {
    const queryInput = document.getElementById('nl-query');
    const responseElement = document.getElementById('nl-response');
    
    if (!queryInput || !responseElement) return;
    
    const query = queryInput.value.trim();
    if (!query) return;
    
    // Show loading state
    responseElement.classList.remove('hidden');
    responseElement.innerHTML = `
        <div class="flex items-center space-x-2">
            <div class="loading-shimmer h-3 w-3 rounded-full"></div>
            <span class="text-sm text-gray-400">Processing query...</span>
        </div>
    `;
    
    try {
        // Process the query
        const response = await window.naturalLanguageInterface.processQuery(query);
        
        // Format and display response
        const formattedResponse = response.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        responseElement.innerHTML = `
            <div class="text-sm text-gray-200">
                ${formattedResponse}
            </div>
        `;
        
        // Clear input
        queryInput.value = '';
        
    } catch (error) {
        console.error('NL Query Error:', error);
        responseElement.innerHTML = `
            <div class="text-sm text-red-400">
                Error processing query. Please try again.
            </div>
        `;
    }
};
