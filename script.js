// Storch Chat Demo - JavaScript für n8n Webhook Integration

class StorchChat {
    constructor() {
        // WebSocket URL (lokaler WebSocket-Server)
        this.websocketUrl = 'ws://localhost:3001';
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 2000; // 2 seconds
        this.isConnected = false;
        
        // n8n Webhook URL (Production)
        this.webhookUrl = 'https://n8n.malerinstitut.de/webhook/storch-demo';
        // Demo-Modus: true = lokal ohne n8n | false = echte n8n Verbindung
        this.useDemoMode = false; // ✅ JETZT MIT ECHTER N8N-VERBINDUNG
        this.apiKey = '';
        this.soundEnabled = true;
        this.isTyping = false;
        this.messageHistory = [];
        
        // Voice Input
        this.isRecording = false;
        this.recognition = null;
        
        // Voice Assistant (ElevenLabs)
        this.voiceAssistantActive = false;
        this.elevenLabsApiKey = '';
        
        this.initializeChat();
        this.loadSettings();
        this.initializeVoiceInput();
        this.connectWebSocket();
    }

    initializeChat() {
        // Event Listeners
        document.getElementById('messageInput').addEventListener('input', this.handleInputChange.bind(this));
        document.getElementById('sendButton').addEventListener('click', this.sendMessage.bind(this));
        
        // Enter key support
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-focus input
        document.getElementById('messageInput').focus();
        
        // Initialize welcome message
        this.showWelcomeMessage();
        
        // Set initial status to offline
        this.updateConnectionStatus(false);
    }

    connectWebSocket() {
        if (this.useDemoMode) {
            console.log('🎭 Demo-Modus - keine WebSocket-Verbindung benötigt');
            this.updateConnectionStatus(true, true);
            return;
        }

        console.log('🔌 Verbinde mit WebSocket-Server...');
        
        try {
            this.websocket = new WebSocket(this.websocketUrl);
            
            this.websocket.onopen = () => {
                console.log('✅ WebSocket verbunden!');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus(true, false);
                this.showNotification('✅ Verbindung hergestellt', 'success');
                
                // Start ping interval to keep connection alive
                this.startPingInterval();
            };
            
            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Fehler beim Parsen der WebSocket-Nachricht:', error);
                }
            };
            
            this.websocket.onclose = (event) => {
                console.log('🔌 WebSocket getrennt:', event.code, event.reason);
                this.isConnected = false;
                this.updateConnectionStatus(false);
                
                // Stop ping interval
                if (this.pingInterval) {
                    clearInterval(this.pingInterval);
                    this.pingInterval = null;
                }
                
                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = this.reconnectDelay * this.reconnectAttempts;
                    console.log(`🔄 Reconnect-Versuch ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay/1000}s...`);
                    this.showNotification(`Verbindung getrennt. Reconnect in ${delay/1000}s...`, 'warning');
                    
                    setTimeout(() => {
                        this.connectWebSocket();
                    }, delay);
                } else {
                    console.error('❌ Maximale Reconnect-Versuche erreicht');
                    this.showNotification('❌ Verbindung fehlgeschlagen. Bitte Seite neu laden.', 'danger');
                }
            };
            
            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket-Fehler:', error);
                this.updateConnectionStatus(false);
            };
            
        } catch (error) {
            console.error('❌ Fehler beim Erstellen der WebSocket-Verbindung:', error);
            this.updateConnectionStatus(false);
        }
    }

    startPingInterval() {
        // Send ping every 25 seconds to keep connection alive
        this.pingInterval = setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'ping',
                    timestamp: new Date().toISOString()
                }));
                console.log('💓 Ping gesendet');
            }
        }, 25000);
    }

    handleWebSocketMessage(data) {
        console.log('📩 WebSocket-Nachricht empfangen:', data);
        
        switch (data.type) {
            case 'connection':
                console.log('✅ Verbindung bestätigt:', data.message);
                break;
                
            case 'heartbeat':
                console.log('💓 Heartbeat empfangen');
                break;
                
            case 'pong':
                console.log('🏓 Pong empfangen');
                break;
                
            case 'response':
                // Handle response from n8n
                this.hideTypingIndicator();
                const message = data.data?.message || data.data?.output || JSON.stringify(data.data);
                this.addMessage(message, 'assistant');
                if (this.soundEnabled) {
                    this.playNotificationSound();
                }
                break;
                
            case 'error':
                console.error('❌ Server-Fehler:', data.message);
                this.hideTypingIndicator();
                this.showNotification('Fehler: ' + data.message, 'danger');
                break;
                
            default:
                console.log('Unbekannter Nachrichtentyp:', data.type);
        }
    }

    handleInputChange(e) {
        const input = e.target;
        const sendButton = document.getElementById('sendButton');
        
        // Enable/disable send button based on input
        if (input.value.trim()) {
            sendButton.disabled = false;
            sendButton.classList.remove('btn-secondary');
            sendButton.classList.add('btn-primary');
        } else {
            sendButton.disabled = true;
            sendButton.classList.remove('btn-primary');
            sendButton.classList.add('btn-secondary');
        }
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Clear input and disable send button
        input.value = '';
        this.handleInputChange({ target: input });
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Demo-Modus für lokale Nutzung
        if (this.useDemoMode) {
            setTimeout(() => {
                this.hideTypingIndicator();
                const demoResponse = this.getIntelligentDemoResponse(message);
                this.addMessage(demoResponse, 'assistant');
                if (this.soundEnabled) {
                    this.playNotificationSound();
                }
            }, 1000);
            return;
        }
        
        try {
            // Send via WebSocket if connected
            if (this.isConnected && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                const payload = {
                    type: 'message',
                    message: message,
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId(),
                    userAgent: navigator.userAgent,
                    webhookUrl: this.webhookUrl  // Send current webhook URL to server
                };
                
                this.websocket.send(JSON.stringify(payload));
                console.log('📤 Nachricht via WebSocket gesendet');
                console.log('🔗 Webhook-URL gesendet:', this.webhookUrl);
            } else {
                // Fallback: Show error
                this.hideTypingIndicator();
                this.showNotification('❌ Keine Verbindung zum Server', 'danger');
                
                // Try to reconnect
                console.log('🔄 Versuche erneut zu verbinden...');
                this.connectWebSocket();
            }
            
        } catch (error) {
            console.error('Fehler beim Senden der Nachricht:', error);
            this.hideTypingIndicator();
            this.showNotification('Fehler beim Senden: ' + error.message, 'danger');
        }
    }

    getIntelligentDemoResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Intelligente Antworten basierend auf Kontext
        if (lowerMessage.includes('hallo') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return 'Hallo! Schön, dass Sie hier sind. Wie kann ich Ihnen heute helfen?';
        } else if (lowerMessage.includes('wie geht') || lowerMessage.includes('wie geht\'s')) {
            return 'Mir geht es gut, danke der Nachfrage! Wie kann ich Sie unterstützen?';
        } else if (lowerMessage.includes('hilfe') || lowerMessage.includes('help')) {
            return 'Ich bin hier, um Ihnen zu helfen! Stellen Sie mir einfach Ihre Frage und ich werde mein Bestes tun, um sie zu beantworten.';
        } else if (lowerMessage.includes('danke') || lowerMessage.includes('thank')) {
            return 'Sehr gerne! Wenn Sie noch weitere Fragen haben, bin ich für Sie da.';
        } else if (lowerMessage.includes('tschüss') || lowerMessage.includes('bye')) {
            return 'Auf Wiedersehen! Ich wünsche Ihnen einen schönen Tag. Kommen Sie gerne wieder!';
        } else {
            const responses = [
                `Interessante Frage zu "${message}"! Als KI-Assistent kann ich Ihnen bei vielen Themen weiterhelfen.`,
                `Vielen Dank für Ihre Nachricht. Ich habe verstanden: "${message}". Wie kann ich Ihnen damit weiterhelfen?`,
                `Das ist eine gute Frage! Lassen Sie mich darüber nachdenken und Ihnen eine hilfreiche Antwort geben.`,
                `Ich verstehe. Sie interessieren sich für "${message}". Können Sie mir mehr Details dazu geben?`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    async sendToWebhook(message) {
        const payload = {
            message: message,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent
        };

        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            console.log('Sende an n8n:', payload);
            
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                mode: 'cors',
                headers: headers,
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('Response Status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('✅ n8n Response:', responseData);
            
            // Prüfe verschiedene mögliche Response-Formate
            if (responseData.output) {
                return { message: responseData.output };
            } else if (responseData.message) {
                return { message: responseData.message };
            } else if (typeof responseData === 'string') {
                return { message: responseData };
            } else {
                // Wenn die Response ein Objekt ist, versuche den ersten sinnvollen Wert zu finden
                return { message: JSON.stringify(responseData) };
            }
        } catch (error) {
            console.error('❌ Webhook-Fehler Details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Zeige detaillierten Fehler in der Console
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('🔴 CORS Problem! Der Webhook blockiert Cross-Origin Requests.');
                console.error('Lösung: Fügen Sie im n8n Respond to Webhook Node diese Header hinzu:');
                console.error('Access-Control-Allow-Origin: *');
            }
            
            // Fallback: Demo-Antworten für Offline-Testing
            return this.getDemoResponse(message);
        }
    }

    getDemoResponse(message) {
        const demoResponses = [
            "Das ist eine Demo-Antwort! Ihr n8n Webhook ist nicht erreichbar.",
            "Ich bin im Demo-Modus. Bitte überprüfen Sie Ihre n8n-Instanz.",
            "Webhook-Verbindung fehlgeschlagen. Hier ist eine Demo-Antwort.",
            "Demo-Modus aktiviert. Ihre Nachricht wurde simuliert verarbeitet.",
            "n8n Webhook nicht verfügbar. Dies ist eine Demo-Antwort."
        ];
        
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        
        return {
            message: `${randomResponse}\n\n💡 Tipp: Überprüfen Sie Ihre n8n-Instanz und Webhook-URL in den Einstellungen.`,
            demo: true
        };
    }

    addMessage(content, sender, type = 'normal') {
        const chatMessages = document.getElementById('chatMessages');
        
        // Remove welcome message if it exists
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} new`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${type}`;
        
        // Handle content with images and text
        this.renderMessageContent(content, messageBubble);
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.appendChild(messageBubble);
        messageDiv.appendChild(messageTime);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store in history
        this.messageHistory.push({
            content,
            sender,
            type,
            timestamp: new Date()
        });
    }

    renderMessageContent(content, container) {
        const imageUrls = [];
        const shopLinks = [];
        
        // 1. Handle special image URLs: __SHOP_LINK_https://...__
        // This regex captures the URL part without the prefix/suffix
        const specialImagePattern = /__SHOP_LINK_(https?:\/\/[^_\s]+?)__/gi;
        content = content.replace(specialImagePattern, (match, urlPart) => {
            let fullUrl = urlPart;
            // Ensure .jpg is appended if missing
            if (!fullUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) {
                fullUrl += '.jpg';
            }
            imageUrls.push({ url: fullUrl, alt: 'Produktbild' });
            return `__IMAGE_PLACEHOLDER_${imageUrls.length - 1}__`;
        });

        // 2. Handle Markdown image syntax: ![alt text](image_url)
        const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        content = content.replace(markdownImageRegex, (match, altText, imageUrl) => {
            imageUrls.push({ url: imageUrl, alt: altText });
            return `__IMAGE_PLACEHOLDER_${imageUrls.length - 1}__`;
        });

        // 3. Handle shop links: https://shop.storch.de/...
        // This regex captures the full shop URL but excludes trailing parentheses
        const shopLinkRegex = /(https?:\/\/shop\.storch\.de[^\s)]*)/gi;
        content = content.replace(shopLinkRegex, (match) => {
            shopLinks.push(match);
            return `__SHOP_LINK_PLACEHOLDER_${shopLinks.length - 1}__`;
        });

        // Split content by line breaks to handle multiline messages
        const lines = content.split('\n');

        lines.forEach((line) => {
            if (line.trim()) {
                const lineElement = document.createElement('div');
                lineElement.className = 'message-line';

                // Split line by all placeholders
                const parts = line.split(/(__IMAGE_PLACEHOLDER_\d+__)|(__SHOP_LINK_PLACEHOLDER_\d+__)/g);

                parts.forEach((part) => {
                    if (!part) return;

                    if (part.startsWith('__IMAGE_PLACEHOLDER_')) {
                        const index = parseInt(part.match(/\d+/)[0]);
                        const imageData = imageUrls[index];
                        if (imageData) {
                            this.createImageElement(imageData.url, imageData.alt, lineElement);
                        }
                    } else if (part.startsWith('__SHOP_LINK_PLACEHOLDER_')) {
                        const index = parseInt(part.match(/\d+/)[0]);
                        const url = shopLinks[index];
                        if (url) {
                            const linkElement = document.createElement('a');
                            linkElement.href = url;
                            linkElement.textContent = '(Link)'; // Display "(Link)"
                            linkElement.target = '_blank';
                            linkElement.rel = 'noopener noreferrer';
                            linkElement.style.cssText = `
                                color: #007bff;
                                text-decoration: underline;
                                cursor: pointer;
                            `;
                            lineElement.appendChild(linkElement);
                        }
                    } else {
                        // Handle bold text: **text**
                        this.renderBoldText(part, lineElement);
                    }
                });
                container.appendChild(lineElement);
            }
        });
    }

    createImageElement(imageUrl, altText, container) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = altText || 'Produktbild';
        img.className = 'message-image';
        img.style.cssText = `
            max-width: 100%;
            max-height: 300px;
            border-radius: 8px;
            margin: 0.5rem 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
        `;
        
        // Add click to enlarge functionality
        img.addEventListener('click', () => {
            this.showImageModal(imageUrl);
        });
        
        // Add error handling
        img.addEventListener('error', () => {
            img.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-muted small';
            errorDiv.textContent = 'Bild konnte nicht geladen werden';
            container.appendChild(errorDiv);
        });
        
        container.appendChild(img);
    }

    renderBoldText(text, container) {
        // Handle bold text: **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = text.split(boldRegex);
        
        parts.forEach((part, index) => {
            if (!part) return;
            
            // Odd indices are bold text (captured groups)
            if (index % 2 === 1) {
                const boldElement = document.createElement('strong');
                boldElement.textContent = part;
                boldElement.style.fontWeight = 'bold';
                container.appendChild(boldElement);
            } else {
                // Even indices are regular text
                const textNode = document.createTextNode(part);
                container.appendChild(textNode);
            }
        });
    }

    showImageModal(imageUrl) {
        // Create modal for image enlargement
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        modal.appendChild(img);
        document.body.appendChild(modal);
        
        // Close on click
        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const chatMessages = document.getElementById('chatMessages');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-message';
        typingDiv.id = 'typingIndicator';
        
        const typingBubble = document.createElement('div');
        typingBubble.className = 'typing-indicator';
        
        const typingDots = document.createElement('div');
        typingDots.className = 'typing-dots';
        typingDots.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        
        typingBubble.appendChild(typingDots);
        typingDiv.appendChild(typingBubble);
        chatMessages.appendChild(typingDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showWelcomeMessage() {
        const chatMessages = document.getElementById('chatMessages');
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message text-center py-5';
        welcomeDiv.innerHTML = `
            <div class="welcome-icon mb-3">
                <i class="bi bi-chat-dots" style="font-size: 3rem; color: #667eea;"></i>
            </div>
            <h5>Willkommen beim KI-Helfer!</h5>
            <p class="text-muted">Stellen Sie mir eine Frage und ich helfe Ihnen gerne weiter.</p>
        `;
        chatMessages.appendChild(welcomeDiv);
    }

    playNotificationSound() {
        // Create a simple notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    getSessionId() {
        let sessionId = localStorage.getItem('storch_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('storch_session_id', sessionId);
        }
        return sessionId;
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        this.messageHistory = [];
        this.showWelcomeMessage();
    }

    toggleSettings() {
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();
    }

    saveSettings() {
        const newWebhookUrl = document.getElementById('webhookUrl').value;
        console.log('💾 Speichere Einstellungen...');
        console.log('🔧 Alte URL:', this.webhookUrl);
        console.log('🔧 Neue URL:', newWebhookUrl);
        
        // Update chatInstance webhookUrl
        this.webhookUrl = newWebhookUrl;
        this.apiKey = document.getElementById('apiKey').value;
        this.soundEnabled = document.getElementById('soundEnabled').checked;
        
        // Save to localStorage
        localStorage.setItem('storch_settings', JSON.stringify({
            webhookUrl: this.webhookUrl,
            apiKey: this.apiKey,
            soundEnabled: this.soundEnabled
        }));
        
        console.log('✅ Einstellungen gespeichert:', {
            webhookUrl: this.webhookUrl,
            apiKey: this.apiKey,
            soundEnabled: this.soundEnabled
        });
        
        // Update button states after saving
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        modal.hide();
        
        this.showNotification('Einstellungen gespeichert!', 'success');
        
        // Test connection with new URL
        console.log('🔗 Teste neue URL:', this.webhookUrl);
    }

    loadSettings() {
        const settings = localStorage.getItem('storch_settings');
        console.log('📂 Lade Einstellungen...');
        console.log('🔧 Gespeicherte Einstellungen:', settings);
        
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            console.log('🔧 Parsed Settings:', parsedSettings);
            
            this.webhookUrl = parsedSettings.webhookUrl || this.webhookUrl;
            this.apiKey = parsedSettings.apiKey || '';
            this.soundEnabled = parsedSettings.soundEnabled !== false;
            
            console.log('✅ Geladene URL:', this.webhookUrl);
            
            // Update UI
            document.getElementById('webhookUrl').value = this.webhookUrl;
            document.getElementById('apiKey').value = this.apiKey;
            document.getElementById('soundEnabled').checked = this.soundEnabled;
            
            // Update URL preset button states
        } else {
            console.log('⚠️ Keine gespeicherten Einstellungen gefunden, verwende Standard-URL:', this.webhookUrl);
        }
    }
    

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Voice Input Functionality
    initializeVoiceInput() {
        // Check if browser supports Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.lang = 'de-DE';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                const voiceButton = document.getElementById('voiceInputButton');
                voiceButton.classList.add('recording');
                this.showNotification('Sprechen Sie jetzt...', 'info');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                
                document.getElementById('messageInput').value = transcript;
            };
            
            this.recognition.onend = () => {
                this.isRecording = false;
                const voiceButton = document.getElementById('voiceInputButton');
                voiceButton.classList.remove('recording');
            };
            
            this.recognition.onerror = (event) => {
                this.isRecording = false;
                const voiceButton = document.getElementById('voiceInputButton');
                voiceButton.classList.remove('recording');
                
                if (event.error !== 'no-speech') {
                    this.showNotification(`Sprachfehler: ${event.error}`, 'danger');
                }
            };
        } else {
            console.warn('Web Speech API wird von diesem Browser nicht unterstützt');
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Spracheingabe wird von Ihrem Browser nicht unterstützt', 'warning');
            return;
        }
        
        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    // Voice Assistant (ElevenLabs) - Vorbereitet für zukünftige Integration
    toggleVoiceAssistant() {
        this.voiceAssistantActive = !this.voiceAssistantActive;
        const voiceAssistantButton = document.getElementById('voiceAssistantButton');
        
        if (this.voiceAssistantActive) {
            voiceAssistantButton.classList.add('active');
            this.showNotification('Sprachassistent aktiviert (ElevenLabs Integration ausstehend)', 'info');
        } else {
            voiceAssistantButton.classList.remove('active');
            this.showNotification('Sprachassistent deaktiviert', 'info');
        }
        
        // TODO: ElevenLabs Integration hier implementieren
        // - API-Schlüssel konfigurieren
        // - Text-to-Speech Integration
        // - Sprach-Streaming
    }

    // Update Connection Status
    updateConnectionStatus(isOnline, isDemo = false) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (isOnline) {
            statusDot.classList.remove('offline');
            statusDot.classList.add('online');
            statusText.textContent = isDemo ? 'Demo' : 'Online';
        } else {
            statusDot.classList.remove('online');
            statusDot.classList.add('offline');
            statusText.textContent = 'Offline';
        }
    }

    // Test WebSocket Connection
    async testWebhookConnection() {
        const testButton = document.getElementById('testConnectionButton');
        testButton.classList.add('testing');
        
        // Im Demo-Modus simulieren
        if (this.useDemoMode) {
            setTimeout(() => {
                this.updateConnectionStatus(true, true);
                this.showNotification('🎭 Demo-Modus - Verbindung simuliert', 'info');
                testButton.classList.remove('testing');
            }, 500);
            return;
        }
        
        // Test WebSocket connection
        if (this.isConnected && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            // Send test ping
            this.websocket.send(JSON.stringify({
                type: 'ping',
                test: true,
                timestamp: new Date().toISOString()
            }));
            this.showNotification('✅ WebSocket-Verbindung aktiv!', 'success');
            testButton.classList.remove('testing');
        } else {
            // Try to reconnect
            this.showNotification('🔄 Versuche Verbindung herzustellen...', 'info');
            this.reconnectAttempts = 0; // Reset counter
            this.connectWebSocket();
            
            // Wait a bit and check again
            setTimeout(() => {
                if (this.isConnected) {
                    this.showNotification('✅ Verbindung erfolgreich hergestellt!', 'success');
                } else {
                    this.showNotification('❌ Verbindung fehlgeschlagen. Bitte Server prüfen.', 'danger');
                }
                testButton.classList.remove('testing');
            }, 3000);
        }
    }
}

// Global functions for HTML onclick handlers
let chatInstance;

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function sendMessage() {
    if (chatInstance) {
        chatInstance.sendMessage();
    }
}

function clearChat() {
    if (chatInstance) {
        chatInstance.clearChat();
    }
}

function toggleSettings() {
    if (chatInstance) {
        chatInstance.toggleSettings();
    }
}

function saveSettings() {
    if (chatInstance) {
        chatInstance.saveSettings();
    }
}

function toggleVoiceInput() {
    if (chatInstance) {
        chatInstance.toggleVoiceInput();
    }
}

function toggleVoiceAssistant() {
    if (chatInstance) {
        chatInstance.toggleVoiceAssistant();
    }
}

function testConnection() {
    if (chatInstance) {
        if (chatInstance.useDemoMode) {
            console.log('🎭 Demo-Modus - Verbindungstest simuliert');
            chatInstance.updateConnectionStatus(true, true);
            chatInstance.showNotification('Demo-Modus aktiv - keine echte Verbindung benötigt', 'info');
        } else {
            chatInstance.testWebhookConnection();
        }
    }
}


function copyUrl() {
    const urlInput = document.getElementById('webhookUrl');
    urlInput.select();
    urlInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        chatInstance.showNotification('📋 URL in Zwischenablage kopiert', 'success');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(urlInput.value).then(() => {
            chatInstance.showNotification('📋 URL in Zwischenablage kopiert', 'success');
        }).catch(() => {
            chatInstance.showNotification('❌ Kopieren fehlgeschlagen', 'danger');
        });
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    chatInstance = new StorchChat();
    
    // Add some demo functionality
    console.log('🚀 Storch Chat Demo initialisiert');
    console.log('📡 WebSocket URL:', chatInstance.websocketUrl);
    console.log('🔗 n8n Webhook URL:', chatInstance.webhookUrl);
    console.log('🧪 Standard-URL: Test-URL aktiviert');
    
    // Im Demo-Modus keine echte Verbindung testen
    if (chatInstance.useDemoMode) {
        console.log('🎭 Demo-Modus aktiviert - Chat funktioniert offline');
        chatInstance.updateConnectionStatus(true, true);
        chatInstance.showNotification('Demo-Modus aktiv - Chat läuft lokal', 'success');
    } else {
        console.log('🔌 WebSocket-Verbindung wird automatisch hergestellt...');
        // WebSocket connection is automatically started in constructor
        // The connection status will be updated automatically
    }
});
