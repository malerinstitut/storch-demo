// Storch Chat Demo - JavaScript für n8n Webhook Integration

class StorchChat {
    constructor() {
        // NETLIFY MODE: Direkter Zugriff auf n8n (ohne WebSocket-Server)
        this.useNetlifyMode = true; // ✅ FÜR NETLIFY DEPLOYMENT
        
        // n8n Webhook URL (Production)
        this.webhookUrl = 'https://n8n.malerinstitut.de/webhook/storch-demo';
        this.apiKey = '';
        this.soundEnabled = true;
        this.isTyping = false;
        this.messageHistory = [];
        
        // Voice Input
        this.isRecording = false;
        this.recognition = null;
        
        this.initializeChat();
        this.loadSettings();
        this.initializeVoiceInput();
        
        // Zeige sofort "Online" an (direkte n8n Verbindung)
        this.updateConnectionStatus(true, false);
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
        
        // Set status to online (direkte n8n Verbindung)
        this.updateConnectionStatus(true, false);
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

        input.value = '';
        this.handleInputChange({ target: input });
        this.addMessage(message, 'user');
        this.showTypingIndicator();
        
        try {
            // NETLIFY MODE: Direkter POST an n8n
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId(),
                    userAgent: navigator.userAgent
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.hideTypingIndicator();
            
            const replyMessage = data.output || data.message || JSON.stringify(data);
            this.addMessage(replyMessage, 'assistant');
            
            if (this.soundEnabled) {
                this.playNotificationSound();
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            this.showNotification('Fehler: ' + error.message, 'danger');
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
        
        // 1. Handle Markdown link syntax FIRST: [text](url) - aber NICHT für Bilder ![...]
        const markdownLinkRegex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
        content = content.replace(markdownLinkRegex, (match, linkText, url) => {
            shopLinks.push({ url: url, text: linkText });
            return `__SHOP_LINK_PLACEHOLDER_${shopLinks.length - 1}__`;
        });
        
        // 2. Handle special image URLs: __SHOP_LINK_https://...__
        const specialImagePattern = /__SHOP_LINK_(https?:\/\/[^_\s]+?)__/gi;
        content = content.replace(specialImagePattern, (match, urlPart) => {
            let fullUrl = urlPart;
            if (!fullUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) {
                fullUrl += '.jpg';
            }
            imageUrls.push({ url: fullUrl, alt: 'Produktbild' });
            return `__IMAGE_PLACEHOLDER_${imageUrls.length - 1}__`;
        });

        // 3. Handle Markdown image syntax: ![alt text](image_url)
        const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        content = content.replace(markdownImageRegex, (match, altText, imageUrl) => {
            imageUrls.push({ url: imageUrl, alt: altText });
            return `__IMAGE_PLACEHOLDER_${imageUrls.length - 1}__`;
        });

        // 4. Handle bare shop links: https://shop.storch.de/...
        const bareShopLinkRegex = /(https?:\/\/shop\.storch\.de[^\s)]*)/gi;
        content = content.replace(bareShopLinkRegex, (match) => {
            // Nur ersetzen wenn nicht schon als Markdown-Link verarbeitet
            if (!content.includes(`__SHOP_LINK_PLACEHOLDER_`)) {
                shopLinks.push({ url: match, text: match });
                return `__SHOP_LINK_PLACEHOLDER_${shopLinks.length - 1}__`;
            }
            return match;
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
                        const linkData = shopLinks[index];
                        if (linkData) {
                            const linkElement = document.createElement('a');
                            linkElement.href = linkData.url || linkData;
                            linkElement.textContent = linkData.text || linkData.url || linkData;
                            linkElement.target = '_blank';
                            linkElement.rel = 'noopener noreferrer';
                            linkElement.style.cssText = `
                                color: #007bff;
                                text-decoration: underline;
                                cursor: pointer;
                                word-break: break-all;
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
        this.webhookUrl = document.getElementById('webhookUrl').value;
        this.apiKey = document.getElementById('apiKey').value;
        this.soundEnabled = document.getElementById('soundEnabled').checked;
        
        localStorage.setItem('storch_settings', JSON.stringify({
            webhookUrl: this.webhookUrl,
            apiKey: this.apiKey,
            soundEnabled: this.soundEnabled
        }));
        
        console.log('Einstellungen gespeichert');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        modal.hide();
        this.showNotification('Einstellungen gespeichert!', 'success');
    }

    loadSettings() {
        const settings = localStorage.getItem('storch_settings');
        
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            this.webhookUrl = parsedSettings.webhookUrl || this.webhookUrl;
            this.apiKey = parsedSettings.apiKey || '';
            this.soundEnabled = parsedSettings.soundEnabled !== false;
            
            // Update UI
            document.getElementById('webhookUrl').value = this.webhookUrl;
            document.getElementById('apiKey').value = this.apiKey;
            document.getElementById('soundEnabled').checked = this.soundEnabled;
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

    toggleVoiceAssistant() {
        this.showNotification('Sprachassistent ist derzeit nicht verfügbar', 'info');
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
        
        this.showNotification('Verbindung wird getestet...', 'info');
        
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Test', test: true })
            });
            
            if (response.ok) {
                this.showNotification('✅ Verbindung erfolgreich!', 'success');
            } else {
                this.showNotification('❌ Verbindung fehlgeschlagen', 'danger');
            }
        } catch (error) {
            this.showNotification('❌ Verbindungsfehler', 'danger');
        }
        
        testButton.classList.remove('testing');
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
        chatInstance.testWebhookConnection();
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
});
