/**
 * Sofia Widget - Versão 3.0 - API Inteligente Conectada
 * Conecta com a Sofia real do Railway
 */

(function() {
    'use strict';

    const API_URL = "https://sofia-api-backend-production.up.railway.app/chat";
    
    // CONFIGURAÇÕES PADRÃO
    const defaultConfig = {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        position: 'bottom-right',
        welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica inteligente. Como posso te ajudar hoje?',
        avatarUrl: 'Sofia_IA.png',
        showAfterSeconds: 3,
        notificationDelay: 15000,
        exitIntentEnabled: true,
        mobileOptimized: true,
        analytics: true
    };

    class SofiaWidget {
        constructor(config = {}) {
            this.config = { ...defaultConfig, ...config };
            this.chatOpen = false;
            this.isTyping = false;
            this.notificationShown = false;
            this.exitIntentShown = false;
            this.userScrolled = false;
            this.messageCount = 0;
            this.apiConnected = false;
            
            this.init();
        }

        init() {
            this.injectStyles();
            this.createHTML();
            this.bindEvents();
            this.startBehaviors();
            this.testAPIConnection();
            
            if (this.config.analytics) {
                this.trackEvent('widget_loaded');
            }
        }

        async testAPIConnection() {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mensagem: 'teste' })
                });
                
                this.apiConnected = response.ok;
                console.log('🧠 Sofia API:', this.apiConnected ? '✅ Conectada' : '❌ Offline');
            } catch (error) {
                this.apiConnected = false;
                console.log('🧠 Sofia API: ❌ Erro de conexão');
            }
        }

        injectStyles() {
            const styles = `
                .sofia-widget-container * {
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .sofia-bubble {
                    position: fixed;
                    ${this.getPositionStyles()};
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
                    border-radius: 50%;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.4s ease;
                    z-index: 999999;
                    opacity: 0;
                    transform: scale(0.8);
                }

                .sofia-bubble.show {
                    opacity: 1;
                    transform: scale(1);
                    animation: sofia-pulse 3s infinite;
                }

                .sofia-bubble:hover {
                    transform: scale(1.1);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
                }

                @keyframes sofia-pulse {
                    0%, 100% { box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 8px 25px ${this.hexToRgba(this.config.primaryColor, 0.4)}; }
                }

                .sofia-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid rgba(255,255,255,0.2);
                }

                .sofia-notification {
                    position: fixed;
                    ${this.getNotificationPosition()};
                    background: white;
                    padding: 15px 20px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 280px;
                    opacity: 0;
                    transform: translateY(20px) scale(0.9);
                    transition: all 0.4s ease;
                    z-index: 999998;
                    font-size: 14px;
                    line-height: 1.4;
                    color: #333;
                    border-left: 4px solid ${this.config.primaryColor};
                }

                .sofia-notification.show {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                .notification-close {
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                }

                .sofia-chat-window {
                    position: fixed;
                    ${this.getChatPosition()};
                    width: 400px;
                    height: 600px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 999997;
                    opacity: 0;
                    transform: translateY(30px) scale(0.95);
                    transition: all 0.4s ease;
                }

                .sofia-chat-window.open {
                    display: flex;
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                .sofia-chat-header {
                    background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
                    color: white;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 20px 20px 0 0;
                }

                .sofia-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-right: 15px;
                    border: 2px solid rgba(255,255,255,0.2);
                }

                .sofia-info h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .sofia-info p {
                    margin: 5px 0 0 0;
                    font-size: 12px;
                    opacity: 0.8;
                    display: flex;
                    align-items: center;
                }

                .sofia-online-dot {
                    width: 8px;
                    height: 8px;
                    background: #28a745;
                    border-radius: 50%;
                    margin-right: 6px;
                    animation: sofia-blink 2s infinite;
                }

                @keyframes sofia-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }

                .sofia-close-chat {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    transition: all 0.2s ease;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .sofia-close-chat:hover {
                    background: rgba(255,255,255,0.1);
                }

                .sofia-chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: #f8f9fa;
                    scroll-behavior: smooth;
                }

                .sofia-message {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                    opacity: 0;
                    transform: translateY(10px);
                    animation: sofia-message-slide-in 0.3s ease forwards;
                }

                @keyframes sofia-message-slide-in {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .sofia-message.user {
                    justify-content: flex-end;
                }

                .sofia-message-content {
                    max-width: 85%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    word-wrap: break-word;
                    line-height: 1.5;
                    font-size: 14px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .sofia-message.sofia .sofia-message-content {
                    background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
                    color: white;
                    border-bottom-left-radius: 6px;
                }

                .sofia-message.user .sofia-message-content {
                    background: #e9ecef;
                    color: #333;
                    border-bottom-right-radius: 6px;
                }

                .sofia-message-time {
                    font-size: 11px;
                    opacity: 0.6;
                    margin: 5px 10px 0;
                    color: #666;
                }

                .sofia-typing-indicator {
                    display: none;
                    align-items: center;
                    margin-bottom: 15px;
                    opacity: 0;
                    transform: translateY(10px);
                }

                .sofia-typing-indicator.show {
                    display: flex;
                    animation: sofia-message-slide-in 0.3s ease forwards;
                }

                .sofia-typing-dots {
                    background: ${this.config.primaryColor};
                    padding: 12px 16px;
                    border-radius: 18px;
                    border-bottom-left-radius: 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .sofia-typing-dots span {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: white;
                    margin: 0 2px;
                    animation: sofia-typing 1.4s infinite;
                }

                .sofia-typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .sofia-typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes sofia-typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-8px);
                        opacity: 1;
                    }
                }

                .sofia-chat-input-area {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-radius: 0 0 20px 20px;
                }

                .sofia-chat-input {
                    flex: 1;
                    padding: 14px 18px;
                    border: 2px solid #e9ecef;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    background: #f8f9fa;
                }

                .sofia-chat-input:focus {
                    border-color: ${this.config.primaryColor};
                    box-shadow: 0 0 0 3px ${this.hexToRgba(this.config.primaryColor, 0.1)};
                    background: white;
                }

                .sofia-send-button {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    font-size: 18px;
                }

                .sofia-send-button:hover:not(:disabled) {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px ${this.hexToRgba(this.config.primaryColor, 0.4)};
                }

                .sofia-send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 480px) {
                    .sofia-chat-window {
                        width: calc(100vw - 20px) !important;
                        height: calc(100vh - 40px) !important;
                        bottom: 10px !important;
                        right: 10px !important;
                        left: 10px !important;
                    }

                    .sofia-bubble {
                        bottom: 20px !important;
                        right: 20px !important;
                        width: 60px;
                        height: 60px;
                    }

                    .sofia-icon {
                        width: 35px;
                        height: 35px;
                    }
                }

                .sofia-exit-intent-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999999;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .sofia-exit-intent-overlay.show {
                    display: flex;
                    opacity: 1;
                }

                .sofia-exit-intent-modal {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    max-width: 400px;
                    text-align: center;
                    transform: scale(0.9);
                    transition: transform 0.3s ease;
                    margin: 20px;
                }

                .sofia-exit-intent-overlay.show .sofia-exit-intent-modal {
                    transform: scale(1);
                }

                .sofia-exit-button {
                    background: ${this.config.primaryColor};
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    margin: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .sofia-exit-button:hover {
                    background: ${this.config.secondaryColor};
                    transform: scale(1.05);
                }

                .sofia-exit-button.secondary {
                    background: #e9ecef;
                    color: #333;
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        createHTML() {
            const container = document.createElement('div');
            container.className = 'sofia-widget-container';
            container.innerHTML = `
                <div class="sofia-notification" id="sofiaNotification">
                    <button class="notification-close" onclick="window.sofiaWidget && window.sofiaWidget.hideNotification()">×</button>
                    <strong>🏛️ Precisa de ajuda?</strong><br>
                    Sou a Sofia e posso te ajudar com o AppEstoicismo!
                </div>

                <div class="sofia-bubble" id="sofiaBubble">
                    <img src="${this.config.avatarUrl}" alt="Sofia" class="sofia-icon" onerror="this.style.display='none'; this.parentNode.innerHTML='<div style=\'width:40px;height:40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;font-weight:bold;\'>S</div>'">
                </div>

                <div class="sofia-chat-window" id="sofiaChatWindow">
                    <div class="sofia-chat-header">
                        <div style="display: flex; align-items: center;">
                            <img src="${this.config.avatarUrl}" alt="Sofia" class="sofia-avatar" onerror="this.style.display='none'">
                            <div class="sofia-info">
                                <h3>Sofia</h3>
                                <p><span class="sofia-online-dot"></span>Consultora Estoica IA • Online</p>
                            </div>
                        </div>
                        <button class="sofia-close-chat">✕</button>
                    </div>

                    <div class="sofia-chat-messages" id="sofiaChatMessages">
                        <div class="sofia-message sofia">
                            <div class="sofia-message-content">${this.config.welcomeMessage}</div>
                        </div>
                        <div class="sofia-message-time">Agora</div>

                        <div class="sofia-typing-indicator" id="sofiaTypingIndicator">
                            <div class="sofia-typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>

                    <div class="sofia-chat-input-area">
                        <input 
                            type="text" 
                            class="sofia-chat-input" 
                            id="sofiaChatInput" 
                            placeholder="Digite sua mensagem..."
                        >
                        <button class="sofia-send-button" id="sofiaSendButton">➤</button>
                    </div>
                </div>

                ${this.config.exitIntentEnabled ? `
                <div class="sofia-exit-intent-overlay" id="sofiaExitIntentOverlay">
                    <div class="sofia-exit-intent-modal">
                        <h3>✋ Espera aí!</h3>
                        <p>Antes de sair, que tal conversar comigo? Posso esclarecer suas dúvidas sobre o AppEstoicismo em alguns minutos!</p>
                        <button class="sofia-exit-button" onclick="window.sofiaWidget && window.sofiaWidget.openChatFromExit()">Conversar com Sofia</button>
                        <button class="sofia-exit-button secondary" onclick="window.sofiaWidget && window.sofiaWidget.closeExitIntent()">Continuar navegando</button>
                    </div>
                </div>
                ` : ''}
            `;

            document.body.appendChild(container);
        }

        bindEvents() {
            document.getElementById('sofiaBubble')?.addEventListener('click', () => this.toggleChat());
            document.querySelector('.sofia-close-chat')?.addEventListener('click', () => this.toggleChat());
            document.getElementById('sofiaSendButton')?.addEventListener('click', () => this.sendMessage());
            
            document.getElementById('sofiaChatInput')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            if (this.config.exitIntentEnabled) {
                document.addEventListener('mouseleave', (e) => {
                    if (e.clientY <= 0 && !this.exitIntentShown && !this.chatOpen) {
                        this.showExitIntent();
                    }
                });
            }

            let scrollTimeout;
            window.addEventListener('scroll', () => {
                this.userScrolled = true;
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (!this.notificationShown && !this.chatOpen && this.userScrolled) {
                        this.showNotification();
                    }
                }, 2000);
            });
        }

        startBehaviors() {
            setTimeout(() => {
                document.getElementById('sofiaBubble')?.classList.add('show');
            }, this.config.showAfterSeconds * 1000);

            setTimeout(() => {
                if (!this.chatOpen && !this.notificationShown && window.scrollY > 100) {
                    this.showNotification();
                }
            }, this.config.notificationDelay);
        }

        toggleChat() {
            const chatWindow = document.getElementById('sofiaChatWindow');
            const bubble = document.getElementById('sofiaBubble');
            
            this.hideNotification();
            this.chatOpen = !this.chatOpen;
            
            if (this.chatOpen) {
                chatWindow?.classList.add('open');
                setTimeout(() => {
                    document.getElementById('sofiaChatInput')?.focus();
                }, 300);
                
                if (this.config.analytics) {
                    this.trackEvent('chat_opened');
                }
            } else {
                chatWindow?.classList.remove('open');
                
                if (this.config.analytics) {
                    this.trackEvent('chat_closed');
                }
            }
        }

        sendMessage() {
            const input = document.getElementById('sofiaChatInput');
            const message = input?.value.trim();
            
            if (message && !this.isTyping) {
                this.addMessage(message, 'user');
                input.value = '';
                this.callSofiaAPI(message);
                this.messageCount++;
                
                if (this.config.analytics) {
                    this.trackEvent('message_sent', { message_count: this.messageCount });
                }
            }
        }

        async callSofiaAPI(userMessage) {
            console.log('🧠 Chamando Sofia IA...');
            this.showTyping();

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        mensagem: userMessage,
                        contexto: this.messageCount > 1 ? 'conversa_continuada' : 'primeira_mensagem'
                    })
                });

                console.log('📡 Status da API:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('📄 Resposta da Sofia IA:', data);
                    
                    const reply = data.resposta || data.message || 'Resposta recebida da Sofia!';
                    
                    // Detectar link de pagamento na resposta
                    const hasPaymentLink = reply.includes('pay.kiwify.com.br') || 
                                         reply.includes('quero comprar') || 
                                         reply.includes('vamos começar');
                    
                    // Tempo de digitação realista
                    const typingTime = Math.min(reply.length * 40, 3000);
                    
                    setTimeout(() => {
                        this.addMessage(reply, 'sofia');
                        this.hideTyping();
                        
                        if (hasPaymentLink && this.config.analytics) {
                            this.trackEvent('payment_link_sent');
                        }
                        
                        console.log('✅ Resposta da Sofia IA exibida!');
                    }, typingTime);

                } else {
                    throw new Error(`HTTP ${response.status}`);
                }

            } catch (error) {
                console.error('❌ Erro na Sofia API:', error);
                
                // Fallback para resposta local
                const fallbackResponses = [
                    'Entendo sua situação. O estoicismo nos ensina a focar no que podemos controlar. Como posso ajudar especificamente?',
                    'Interessante perspectiva! Na filosofia estoica, aprendemos que nossa resposta às situações é mais importante que as situações em si.',
                    'Baseado no que você compartilhou, o AppEstoicismo tem ferramentas específicas que podem te ajudar. Quer saber mais?',
                    'Que tal começarmos sua jornada estoica hoje? <br><br>👉 <a href="https://pay.kiwify.com.br/iT6ZM5N" target="_blank" style="color: #22c55e; font-weight: bold;">Garantir acesso com 79% OFF</a>'
                ];
                
                const fallbackReply = this.messageCount >= 2 ? 
                    fallbackResponses[3] : 
                    fallbackResponses[Math.floor(Math.random() * 3)];
                
                setTimeout(() => {
                    this.addMessage(fallbackReply, 'sofia');
                    this.hideTyping();
                }, 1500);
            }
        }

        addMessage(content, sender) {
            const messagesContainer = document.getElementById('sofiaChatMessages');
            if (!messagesContainer) return;

            const time = new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            const messageDiv = document.createElement('div');
            messageDiv.className = `sofia-message ${sender}`;
            messageDiv.innerHTML = `<div class="sofia-message-content">${content}</div>`;

            const timeDiv = document.createElement('div');
            timeDiv.className = 'sofia-message-time';
            timeDiv.textContent = time;

            messagesContainer.appendChild(messageDiv);
            messagesContainer.appendChild(timeDiv);
            
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }

        showTyping() {
            this.isTyping = true;
            const indicator = document.getElementById('sofiaTypingIndicator');
            const sendButton = document.getElementById('sofiaSendButton');
            
            indicator?.classList.add('show');
            if (sendButton) sendButton.disabled = true;
            
            setTimeout(() => {
                const messagesContainer = document.getElementById('sofiaChatMessages');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }, 100);
        }

        hideTyping() {
            this.isTyping = false;
            const indicator = document.getElementById('sofiaTypingIndicator');
            const sendButton = document.getElementById('sofiaSendButton');
            
            indicator?.classList.remove('show');
            if (sendButton) sendButton.disabled = false;
        }

        showNotification() {
            if (this.notificationShown || this.chatOpen) return;
            
            const notification = document.getElementById('sofiaNotification');
            if (notification) {
                notification.classList.add('show');
                this.notificationShown = true;

                setTimeout(() => {
                    this.hideNotification();
                }, 8000);
            }
        }

        hideNotification() {
            const notification = document.getElementById('sofiaNotification');
            if (notification) {
                notification.classList.remove('show');
            }
        }

        showExitIntent() {
            if (this.exitIntentShown || !this.config.exitIntentEnabled) return;
            
            const overlay = document.getElementById('sofiaExitIntentOverlay');
            if (overlay) {
                overlay.classList.add('show');
                this.exitIntentShown = true;
                
                if (this.config.analytics) {
                    this.trackEvent('exit_intent_shown');
                }
            }
        }

        closeExitIntent() {
            const overlay = document.getElementById('sofiaExitIntentOverlay');
            if (overlay) {
                overlay.classList.remove('show');
            }
        }

        openChatFromExit() {
            this.closeExitIntent();
            this.toggleChat();
            
            if (this.config.analytics) {
                this.trackEvent('chat_opened_from_exit_intent');
            }
        }

        // Métodos auxiliares
        getPositionStyles() {
            const positions = {
                'bottom-right': 'bottom: 30px; right: 30px;',
                'bottom-left': 'bottom: 30px; left: 30px;',
                'top-right': 'top: 30px; right: 30px;',
                'top-left': 'top: 30px; left: 30px;'
            };
            return positions[this.config.position] || positions['bottom-right'];
        }

       getNotificationPosition() {
           const positions = {
               'bottom-right': 'bottom: 120px; right: 30px;',
               'bottom-left': 'bottom: 120px; left: 30px;',
               'top-right': 'top: 120px; right: 30px;',
               'top-left': 'top: 120px; left: 30px;'
           };
           return positions[this.config.position] || positions['bottom-right'];
       }

       getChatPosition() {
           const positions = {
               'bottom-right': 'bottom: 30px; right: 30px;',
               'bottom-left': 'bottom: 30px; left: 30px;',
               'top-right': 'top: 30px; right: 30px;',
               'top-left': 'top: 30px; left: 30px;'
           };
           return positions[this.config.position] || positions['bottom-right'];
       }

       hexToRgba(hex, alpha) {
           const r = parseInt(hex.slice(1, 3), 16);
           const g = parseInt(hex.slice(3, 5), 16);
           const b = parseInt(hex.slice(5, 7), 16);
           return `rgba(${r}, ${g}, ${b}, ${alpha})`;
       }

       escapeHtml(text) {
           const div = document.createElement('div');
           div.textContent = text;
           return div.innerHTML;
       }

       trackEvent(eventName, properties = {}) {
           if (typeof gtag !== 'undefined') {
               gtag('event', eventName, {
                   custom_parameter_1: 'sofia_widget',
                   ...properties
               });
           }
           
           console.log('📊 Analytics:', eventName, properties);
       }

       // Método para configurar presets
       static createPreset(presetName, config) {
           SofiaWidget.presets = SofiaWidget.presets || {};
           SofiaWidget.presets[presetName] = config;
       }

       // Método para inicializar com preset
       static init(config = {}) {
           if (window.sofiaWidget) {
               console.log('🔄 Sofia Widget já inicializado');
               return window.sofiaWidget;
           }

           window.sofiaWidget = new SofiaWidget(config);
           return window.sofiaWidget;
       }

       // Método para destruir o widget
       destroy() {
           const container = document.querySelector('.sofia-widget-container');
           if (container) {
               container.remove();
           }
           
           const styleSheets = document.querySelectorAll('style');
           styleSheets.forEach(sheet => {
               if (sheet.textContent && sheet.textContent.includes('.sofia-widget-container')) {
                   sheet.remove();
               }
           });

           window.sofiaWidget = null;
           console.log('🗑️ Sofia Widget removido');
       }

       // API pública para controle externo
       openChat() {
           if (!this.chatOpen) {
               this.toggleChat();
           }
       }

       closeChat() {
           if (this.chatOpen) {
               this.toggleChat();
           }
       }

       sendCustomMessage(message) {
           if (message && message.trim()) {
               this.addMessage(message, 'sofia');
           }
       }

       // Método para atualizar configurações
       updateConfig(newConfig) {
           this.config = { ...this.config, ...newConfig };
           console.log('⚙️ Configurações atualizadas:', this.config);
       }

       // Método para verificar status da API
       async checkAPIStatus() {
           try {
               const response = await fetch(API_URL + '/health', {
                   method: 'GET',
                   timeout: 5000
               });
               
               return {
                   online: response.ok,
                   status: response.status,
                   timestamp: new Date().toISOString()
               };
           } catch (error) {
               return {
                   online: false,
                   error: error.message,
                   timestamp: new Date().toISOString()
               };
           }
       }

       // Método para obter estatísticas
       getStats() {
           return {
               messageCount: this.messageCount,
               chatOpen: this.chatOpen,
               apiConnected: this.apiConnected,
               notificationShown: this.notificationShown,
               exitIntentShown: this.exitIntentShown,
               userScrolled: this.userScrolled
           };
       }
   }

   // PRESETS PREDEFINIDOS
   SofiaWidget.presets = {
       // Preset para AppEstoicismo
       estoic: {
           primaryColor: '#667eea',
           secondaryColor: '#764ba2',
           welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica inteligente. Como posso te ajudar hoje? 🏛️',
           avatarUrl: 'Sofia_IA.png',
           position: 'bottom-right',
           showAfterSeconds: 3,
           notificationDelay: 15000,
           exitIntentEnabled: true,
           analytics: true
       },

       // Preset minimalista
       minimal: {
           primaryColor: '#000000',
           secondaryColor: '#333333',
           welcomeMessage: 'Olá! Como posso ajudar?',
           position: 'bottom-right',
           showAfterSeconds: 5,
           notificationDelay: 20000,
           exitIntentEnabled: false,
           analytics: false
       },

       // Preset moderno
       modern: {
           primaryColor: '#6366f1',
           secondaryColor: '#8b5cf6',
           welcomeMessage: 'Oi! 👋 Sou sua assistente virtual. Em que posso ajudar?',
           position: 'bottom-right',
           showAfterSeconds: 2,
           notificationDelay: 10000,
           exitIntentEnabled: true,
           analytics: true
       },

       // Preset para e-commerce
       ecommerce: {
           primaryColor: '#10b981',
           secondaryColor: '#059669',
           welcomeMessage: 'Olá! Posso ajudar com alguma dúvida sobre nossos produtos? 🛍️',
           position: 'bottom-right',
           showAfterSeconds: 3,
           notificationDelay: 12000,
           exitIntentEnabled: true,
           analytics: true
       }
   };

   // Expor a classe globalmente
   window.SofiaWidget = SofiaWidget;

   // Auto-inicialização se houver configuração global
   if (window.SOFIA_CONFIG) {
       document.addEventListener('DOMContentLoaded', () => {
           SofiaWidget.init(window.SOFIA_CONFIG);
       });
   }

   console.log('🚀 Sofia Widget 3.0 carregado - API Inteligente Conectada!');

})();

// Inicialização automática com preset estoico (para AppEstoicismo)
document.addEventListener('DOMContentLoaded', function() {
   // Aguarda um pouco para garantir que tudo carregou
   setTimeout(() => {
       if (!window.sofiaWidget) {
           console.log('🏛️ Iniciando Sofia Widget com preset estoico...');
           SofiaWidget.init(SofiaWidget.presets.estoic);
       }
   }, 1000);
});
