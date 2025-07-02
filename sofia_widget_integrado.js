/**
 * Sofia Widget - Assistente Estoica Inteligente
 * Versão: 2.4 - Correções de Bug e Melhorias
 * Para integrar em qualquer página web
 */

(function() {
    'use strict';

    // ENDPOINT DA SOFIA (Railway)
    const API_URL = "https://sofia-api-backend-production.up.railway.app/chat";
    
    // CONFIGURAÇÕES PADRÃO
    const defaultConfig = {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica. Como posso te ajudar hoje?',
        avatarUrl: './Sofia_IA.png',
        showAfterSeconds: 3,
        notificationDelay: 15000,
        exitIntentEnabled: true,
        mobileOptimized: true,
        analytics: true,
        fallbackAvatar: true,
        apiTimeout: 10000
    };

    // CLASSE PRINCIPAL DO WIDGET
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
            this.testApiConnection();
            
            if (this.config.analytics) {
                this.trackEvent('widget_loaded');
            }
        }

        // TESTE DE CONEXÃO COM API
        async testApiConnection() {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ mensagem: 'teste' }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                this.apiConnected = response.ok;
                console.log('Sofia API Status:', this.apiConnected ? 'Conectada' : 'Desconectada');
                
            } catch (error) {
                this.apiConnected = false;
                console.warn('Sofia API não disponível:', error.message);
            }
        }

        // INJETAR ESTILOS CSS
        injectStyles() {
            const styles = `
                /* SOFIA WIDGET STYLES */
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
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    z-index: 999999;
                    opacity: 0;
                    transform: scale(0.8) translateY(20px);
                }

                .sofia-bubble.show {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    animation: sofia-gentle-pulse 3s infinite;
                }

                .sofia-bubble:hover {
                    transform: scale(1.1) translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
                }

                .sofia-bubble.chat-open {
                    transform: scale(0.9);
                    opacity: 0.8;
                }

                @keyframes sofia-gentle-pulse {
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

                .sofia-fallback-avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 18px;
                    font-weight: bold;
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
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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

                .sofia-notification::${this.getNotificationArrow()} {
                    content: '';
                    position: absolute;
                    ${this.getNotificationArrowPosition()};
                    width: 0;
                    height: 0;
                    border: 8px solid transparent;
                    ${this.getNotificationArrowBorder()};
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
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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

                .sofia-fallback-avatar-large {
                    width: 50px;
                    height: 50px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 22px;
                    font-weight: bold;
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
                    transform: scale(1.1);
                }

                .sofia-chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: #f8f9fa;
                    scroll-behavior: smooth;
                }

                .sofia-chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .sofia-chat-messages::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }

                .sofia-chat-messages::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
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

                .sofia-chat-input::placeholder {
                    color: #adb5bd;
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
                    transform: none;
                }

                .sofia-error-message {
                    background: #fee;
                    color: #c33;
                    padding: 10px;
                    border-radius: 10px;
                    margin: 10px 0;
                    font-size: 12px;
                    border: 1px solid #fcc;
                }

                /* RESPONSIVO MOBILE */
                @media (max-width: 480px) {
                    .sofia-chat-window {
                        width: calc(100vw - 20px) !important;
                        height: calc(100vh - 40px) !important;
                        bottom: 10px !important;
                        right: 10px !important;
                        left: 10px !important;
                        border-radius: 15px;
                    }

                    .sofia-chat-header {
                        padding: 15px;
                        border-radius: 15px 15px 0 0;
                    }

                    .sofia-avatar, .sofia-fallback-avatar-large {
                        width: 45px;
                        height: 45px;
                        margin-right: 12px;
                    }

                    .sofia-info h3 {
                        font-size: 16px;
                    }

                    .sofia-chat-messages {
                        padding: 15px;
                    }

                    .sofia-message-content {
                        max-width: 90%;
                        font-size: 15px;
                        padding: 14px 16px;
                    }

                    .sofia-chat-input-area {
                        padding: 15px;
                        gap: 10px;
                    }

                    .sofia-chat-input {
                        padding: 16px 18px;
                        font-size: 16px;
                    }

                    .sofia-send-button {
                        width: 50px;
                        height: 50px;
                        font-size: 20px;
                    }

                    .sofia-bubble {
                        bottom: 20px !important;
                        right: 20px !important;
                        width: 65px;
                        height: 65px;
                    }

                    .sofia-icon, .sofia-fallback-avatar {
                        width: 38px;
                        height: 38px;
                    }

                    .sofia-notification {
                        bottom: 105px !important;
                        right: 20px !important;
                        left: 20px !important;
                        max-width: none;
                        font-size: 15px;
                    }
                }

                /* EXIT INTENT */
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

                .sofia-exit-button.secondary:hover {
                    background: #dee2e6;
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.setAttribute('data-sofia-widget', 'true');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        // CRIAR ESTRUTURA HTML
        createHTML() {
            const container = document.createElement('div');
            container.className = 'sofia-widget-container';
            container.innerHTML = `
                <!-- NOTIFICAÇÃO -->
                <div class="sofia-notification" id="sofiaNotification">
                    <button class="notification-close" onclick="window.sofiaWidget && window.sofiaWidget.hideNotification()">×</button>
                    <strong>👋 Precisa de ajuda?</strong><br>
                    Sou a Sofia e posso te ajudar com desenvolvimento estoico!
                </div>

                <!-- BUBBLE -->
                <div class="sofia-bubble" id="sofiaBubble">
                    <img src="${this.config.avatarUrl}" 
                         alt="Sofia" 
                         class="sofia-icon" 
                         style="display: none;"
                         onload="this.style.display='block'" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="sofia-fallback-avatar" style="display: none;">S</div>
                </div>

                <!-- CHAT WINDOW -->
                <div class="sofia-chat-window" id="sofiaChatWindow">
                    <div class="sofia-chat-header">
                        <div style="display: flex; align-items: center;">
                            <img src="${this.config.avatarUrl}" 
                                 alt="Sofia" 
                                 class="sofia-avatar" 
                                 style="display: none;"
                                 onload="this.style.display='block'"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="sofia-fallback-avatar-large" style="display: none;">S</div>
                            <div class="sofia-info">
                                <h3>Sofia</h3>
                                <p><span class="sofia-online-dot"></span>Consultora Estoica • Online</p>
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
                            maxlength="500"
                        >
                        <button class="sofia-send-button" id="sofiaSendButton">➤</button>
                    </div>
                </div>

                <!-- EXIT INTENT -->
                ${this.config.exitIntentEnabled ? `
                <div class="sofia-exit-intent-overlay" id="sofiaExitIntentOverlay">
                    <div class="sofia-exit-intent-modal">
                        <h3>✋ Espera aí!</h3>
                        <p>Antes de sair, que tal conversar com a Sofia? Ela pode esclarecer suas dúvidas sobre o estoicismo em apenas alguns minutos!</p>
                        <button class="sofia-exit-button" onclick="window.sofiaWidget && window.sofiaWidget.openChatFromExit()">Conversar com Sofia</button>
                        <button class="sofia-exit-button secondary" onclick="window.sofiaWidget && window.sofiaWidget.closeExitIntent()">Continuar navegando</button>
                    </div>
                </div>
                ` : ''}
            `;

            document.body.appendChild(container);
        }

        // VINCULAR EVENTOS
        bindEvents() {
            // Bubble click
            const bubble = document.getElementById('sofiaBubble');
            if (bubble) {
                bubble.addEventListener('click', () => this.toggleChat());
            }
            
            // Close button
            const closeButton = document.querySelector('.sofia-close-chat');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.toggleChat());
            }
            
            // Send button
            const sendButton = document.getElementById('sofiaSendButton');
            if (sendButton) {
                sendButton.addEventListener('click', () => this.sendMessage());
            }
            
            // Enter key
            const chatInput = document.getElementById('sofiaChatInput');
            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });
            }

            // Exit intent
            if (this.config.exitIntentEnabled) {
                document.addEventListener('mouseleave', (e) => {
                    if (e.clientY <= 0 && !this.exitIntentShown && !this.chatOpen) {
                        this.showExitIntent();
                    }
                });
            }

            // Scroll detection
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

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // ESC para fechar chat
                if (e.key === 'Escape' && this.chatOpen) {
                    this.toggleChat();
                }
            });
        }

        // INICIAR COMPORTAMENTOS
        startBehaviors() {
            // Mostrar bubble
            setTimeout(() => {
                const bubble = document.getElementById('sofiaBubble');
                if (bubble) {
                    bubble.classList.add('show');
                }
            }, this.config.showAfterSeconds * 1000);

            // Notificação por inatividade
            setTimeout(() => {
                if (!this.chatOpen && !this.notificationShown && window.scrollY > 100) {
                    this.showNotification();
                }
            }, this.config.notificationDelay);
        }

        // MÉTODOS PRINCIPAIS
        toggleChat() {
            const chatWindow = document.getElementById('sofiaChatWindow');
            const bubble = document.getElementById('sofiaBubble');

            if (!chatWindow || !bubble) return;

            this.hideNotification();
            this.chatOpen = !this.chatOpen;

            if (this.chatOpen) {
                chatWindow.classList.add('open');
                bubble.classList.add('chat-open');
                
                setTimeout(() => {
                    const input = document.getElementById('sofiaChatInput');
                    if (input) input.focus();
                }, 300);

                if (this.config.analytics) this.trackEvent('chat_opened');
            } else {
                chatWindow.classList.remove('open');
                bubble.classList.remove('chat-open');

                if (this.config.analytics) this.trackEvent('chat_closed');
            }
        }

        sendMessage() {
            const input = document.getElementById('sofiaChatInput');
            if (!input) return;

            const message = input.value.trim();

            if (message && !this.isTyping) {
                this.addMessage(message, 'user');
                input.value = '';
                this.simulateSofiaResponse(message);
                this.messageCount++;

                if (this.config.analytics) {
                    this.trackEvent('message_sent', { message_count: this.messageCount });
                }
            }
        }

        async simulateSofiaResponse(userMessage) {
            this.showTyping();
            
            try {
                // Verificar se API está disponível
                if (!this.apiConnected) {
                    await this.testApiConnection();
                }

                if (!this.apiConnected) {
                    throw new Error('API não disponível');
                }

                // Criar controller para timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.apiTimeout);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ mensagem: userMessage }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const reply = data.resposta || data.message || 'Desculpe, não consegui processar sua mensagem.';

                // Simular tempo de digitação mais realista
                const typingTime = Math.min(Math.max(reply.length * 50, 1000), 3000);
                
                setTimeout(() => {
                    this.addMessage(reply, 'sofia');
                    this.hideTyping();
                }, typingTime);

            } catch (error) {
               console.error('Erro na API Sofia:', error);
               
               let errorMessage = 'Desculpe, estou com dificuldades técnicas no momento. ';
               
               if (error.name === 'AbortError') {
                   errorMessage = 'A resposta está demorando muito. Tente uma pergunta mais simples.';
               } else if (error.message.includes('HTTP')) {
                   errorMessage = 'Servidor temporariamente indisponível. Tente novamente em alguns instantes.';
               } else if (!navigator.onLine) {
                   errorMessage = 'Parece que você está sem internet. Verifique sua conexão.';
               } else {
                   errorMessage += 'Tente novamente em alguns instantes.';
               }

               setTimeout(() => {
                   this.addMessage(errorMessage, 'sofia');
                   this.hideTyping();
               }, 1000);
               
               // Tentar reconectar
               setTimeout(() => {
                   this.testApiConnection();
               }, 5000);
           }
       }

       addMessage(content, sender = 'sofia') {
           const messages = document.getElementById('sofiaChatMessages');
           if (!messages) return;

           const time = new Date().toLocaleTimeString('pt-BR', {
               hour: '2-digit',
               minute: '2-digit'
           });

           // Sanitizar conteúdo para evitar XSS
           const sanitizedContent = this.sanitizeHtml(content);

           // Criar elemento da mensagem
           const msgDiv = document.createElement('div');
           msgDiv.className = `sofia-message ${sender}`;
           msgDiv.innerHTML = `<div class="sofia-message-content">${sanitizedContent}</div>`;

           // Criar elemento do horário
           const timeDiv = document.createElement('div');
           timeDiv.className = 'sofia-message-time';
           timeDiv.textContent = time;

           // Adicionar ao container
           messages.appendChild(msgDiv);
           messages.appendChild(timeDiv);

           // Auto-scroll suave
           setTimeout(() => {
               messages.scrollTop = messages.scrollHeight;
           }, 100);

           // Remover mensagens antigas se houver muitas (performance)
           const allMessages = messages.querySelectorAll('.sofia-message');
           if (allMessages.length > 50) {
               allMessages[0].remove();
               allMessages[1].remove(); // Remove também o timestamp
           }
       }

       sanitizeHtml(text) {
           const div = document.createElement('div');
           div.textContent = text;
           return div.innerHTML;
       }

       showTyping() {
           this.isTyping = true;
           const indicator = document.getElementById('sofiaTypingIndicator');
           const sendButton = document.getElementById('sofiaSendButton');
           const chatInput = document.getElementById('sofiaChatInput');
           
           if (indicator) indicator.classList.add('show');
           if (sendButton) sendButton.disabled = true;
           if (chatInput) chatInput.disabled = true;
           
           setTimeout(() => {
               const messages = document.getElementById('sofiaChatMessages');
               if (messages) {
                   messages.scrollTop = messages.scrollHeight;
               }
           }, 100);
       }

       hideTyping() {
           this.isTyping = false;
           const indicator = document.getElementById('sofiaTypingIndicator');
           const sendButton = document.getElementById('sofiaSendButton');
           const chatInput = document.getElementById('sofiaChatInput');
           
           if (indicator) indicator.classList.remove('show');
           if (sendButton) sendButton.disabled = false;
           if (chatInput) chatInput.disabled = false;
       }

       showNotification() {
           if (this.notificationShown || this.chatOpen) return;
           
           const notification = document.getElementById('sofiaNotification');
           if (notification) {
               notification.classList.add('show');
               this.notificationShown = true;

               // Auto-hide após 8 segundos
               setTimeout(() => {
                   this.hideNotification();
               }, 8000);

               if (this.config.analytics) {
                   this.trackEvent('notification_shown');
               }
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

               // Auto-hide após 10 segundos
               setTimeout(() => {
                   this.closeExitIntent();
               }, 10000);
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
           if (!this.chatOpen) {
               this.toggleChat();
           }
           
           if (this.config.analytics) {
               this.trackEvent('chat_opened_from_exit_intent');
           }
       }

       // MÉTODOS AUXILIARES DE POSICIONAMENTO
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
               'bottom-right': 'bottom: 120px; right: 30px;',
               'bottom-left': 'bottom: 120px; left: 30px;',
               'top-right': 'top: 120px; right: 30px;',
               'top-left': 'top: 120px; left: 30px;'
           };
           return positions[this.config.position] || positions['bottom-right'];
       }

       getNotificationArrow() {
           const arrows = {
               'bottom-right': 'before',
               'bottom-left': 'before',
               'top-right': 'after',
               'top-left': 'after'
           };
           return arrows[this.config.position] || arrows['bottom-right'];
       }

       getNotificationArrowPosition() {
           const positions = {
               'bottom-right': 'bottom: -8px; right: 30px;',
               'bottom-left': 'bottom: -8px; left: 30px;',
               'top-right': 'top: -8px; right: 30px;',
               'top-left': 'top: -8px; left: 30px;'
           };
           return positions[this.config.position] || positions['bottom-right'];
       }

       getNotificationArrowBorder() {
           const borders = {
               'bottom-right': 'border-top: 8px solid white;',
               'bottom-left': 'border-top: 8px solid white;',
               'top-right': 'border-bottom: 8px solid white;',
               'top-left': 'border-bottom: 8px solid white;'
           };
           return borders[this.config.position] || borders['bottom-right'];
       }

       hexToRgba(hex, alpha) {
           const r = parseInt(hex.slice(1, 3), 16);
           const g = parseInt(hex.slice(3, 5), 16);
           const b = parseInt(hex.slice(5, 7), 16);
           return `rgba(${r}, ${g}, ${b}, ${alpha})`;
       }

       trackEvent(eventName, properties = {}) {
           try {
               // Google Analytics 4
               if (typeof gtag !== 'undefined') {
                   gtag('event', eventName, {
                       event_category: 'sofia_widget',
                       event_label: 'user_interaction',
                       ...properties
                   });
               }
               
               // Facebook Pixel
               if (typeof fbq !== 'undefined') {
                   fbq('trackCustom', 'SofiaWidget_' + eventName, properties);
               }

               // Console log para debug
               if (this.config.analytics) {
                   console.log('Sofia Analytics:', eventName, properties);
               }
           } catch (error) {
               console.warn('Erro no tracking:', error);
           }
       }

       // MÉTODOS PÚBLICOS PARA INTEGRAÇÃO EXTERNA
       open() {
           if (!this.chatOpen) {
               this.toggleChat();
           }
       }

       close() {
           if (this.chatOpen) {
               this.toggleChat();
           }
       }

       sendMessageProgrammatically(message, sender = 'sofia') {
           if (message && typeof message === 'string') {
               this.addMessage(message, sender);
           }
       }

       updateConfig(newConfig) {
           if (typeof newConfig === 'object') {
               this.config = { ...this.config, ...newConfig };
               console.log('Configuração atualizada:', this.config);
           }
       }

       getStatus() {
           return {
               chatOpen: this.chatOpen,
               isTyping: this.isTyping,
               messageCount: this.messageCount,
               apiConnected: this.apiConnected,
               notificationShown: this.notificationShown,
               exitIntentShown: this.exitIntentShown
           };
       }

       resetChat() {
           const messages = document.getElementById('sofiaChatMessages');
           if (messages) {
               messages.innerHTML = `
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
               `;
           }
           
           this.messageCount = 0;
           this.isTyping = false;
           
           if (this.config.analytics) {
               this.trackEvent('chat_reset');
           }
       }

       destroy() {
           try {
               // Remover container
               const container = document.querySelector('.sofia-widget-container');
               if (container) {
                   container.remove();
               }
               
               // Remover estilos
               const styles = document.querySelector('style[data-sofia-widget]');
               if (styles) {
                   styles.remove();
               }

               // Limpar referências globais
               if (window.sofiaWidget === this) {
                   window.sofiaWidget = null;
               }

               console.log('Sofia Widget removido com sucesso');
           } catch (error) {
               console.error('Erro ao remover Sofia Widget:', error);
           }
       }
   }

   // FUNÇÃO DE INICIALIZAÇÃO GLOBAL
   window.SofiaWidget = {
       instance: null,
       
       init: function(config = {}) {
           if (this.instance) {
               console.warn('Sofia Widget já foi inicializado. Use SofiaWidget.destroy() para remover primeiro.');
               return this.instance;
           }
           
           // Aguardar DOM estar pronto
           if (document.readyState === 'loading') {
               document.addEventListener('DOMContentLoaded', () => {
                   this.instance = new SofiaWidget(config);
                   window.sofiaWidget = this.instance;
               });
           } else {
               this.instance = new SofiaWidget(config);
               window.sofiaWidget = this.instance;
           }
           
           return this.instance;
       },

       // Métodos de conveniência
       open: function() {
           if (this.instance) this.instance.open();
       },

       close: function() {
           if (this.instance) this.instance.close();
       },

       reset: function() {
           if (this.instance) this.instance.resetChat();
       },

       status: function() {
           return this.instance ? this.instance.getStatus() : null;
       },

       destroy: function() {
           if (this.instance) {
               this.instance.destroy();
               this.instance = null;
               window.sofiaWidget = null;
           }
       },

       // Configurações pré-definidas
       presets: {
           default: {},
           
           minimalist: {
               primaryColor: '#2d3748',
               secondaryColor: '#4a5568',
               showAfterSeconds: 5,
               exitIntentEnabled: false,
               notificationDelay: 20000
           },
           
           energetic: {
               primaryColor: '#e53e3e',
               secondaryColor: '#dd6b20',
               showAfterSeconds: 1,
               notificationDelay: 5000,
               exitIntentEnabled: true
           },
           
           professional: {
               primaryColor: '#3182ce',
               secondaryColor: '#2b6cb0',
               showAfterSeconds: 10,
               exitIntentEnabled: true,
               notificationDelay: 30000
           },

           estoic: {
               primaryColor: '#667eea',
               secondaryColor: '#764ba2',
               welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica. Como posso te ajudar a desenvolver sua mente através da filosofia estoica?',
               showAfterSeconds: 3,
               exitIntentEnabled: true,
               notificationDelay: 15000,
               analytics: true
           },

           mobile: {
               primaryColor: '#667eea',
               secondaryColor: '#764ba2',
               showAfterSeconds: 2,
               exitIntentEnabled: false,
               notificationDelay: 10000,
               mobileOptimized: true
           }
       },

       // Utilitários
       utils: {
           isMobile: function() {
               return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
           },
           
           isTablet: function() {
               return /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent);
           },
           
           getRecommendedPreset: function() {
               if (this.isMobile()) return 'mobile';
               return 'estoic';
           }
       }
   };

   // AUTO-INICIALIZAÇÃO SE HOUVER CONFIGURAÇÃO GLOBAL
   if (typeof window.sofiaConfig !== 'undefined') {
       console.log('Inicializando Sofia Widget com configuração global:', window.sofiaConfig);
       window.SofiaWidget.init(window.sofiaConfig);
   }

   // INICIALIZAÇÃO AUTOMÁTICA INTELIGENTE
   if (typeof window.sofiaAutoInit !== 'undefined' && window.sofiaAutoInit) {
       const recommendedPreset = window.SofiaWidget.utils.getRecommendedPreset();
       console.log('Auto-inicializando Sofia Widget com preset:', recommendedPreset);
       window.SofiaWidget.init(window.SofiaWidget.presets[recommendedPreset]);
   }

})();

// EXPORTAÇÃO PARA MÓDULOS (se necessário)
if (typeof module !== 'undefined' && module.exports) {
   module.exports = window.SofiaWidget;
}

// ====================================================================
// EXEMPLOS DE USO E DOCUMENTAÇÃO
// ====================================================================

/*

// ============================================
// USO BÁSICO
// ============================================

// Inicialização simples
SofiaWidget.init();

// Inicialização com preset recomendado
SofiaWidget.init(SofiaWidget.presets.estoic);

// ============================================
// USO CUSTOMIZADO
// ============================================

SofiaWidget.init({
   primaryColor: '#667eea',
   secondaryColor: '#764ba2',
   position: 'bottom-right',
   welcomeMessage: 'Olá! Como posso ajudar com estoicismo?',
   avatarUrl: './images/sofia-avatar.png',
   showAfterSeconds: 2,
   notificationDelay: 10000,
   exitIntentEnabled: true,
   analytics: true
});

// ============================================
// CONTROLE PROGRAMÁTICO
// ============================================

// Abrir chat
SofiaWidget.open();

// Fechar chat
SofiaWidget.close();

// Verificar status
console.log(SofiaWidget.status());

// Resetar conversa
SofiaWidget.reset();

// Enviar mensagem programaticamente
window.sofiaWidget.sendMessageProgrammatically('Mensagem automática', 'sofia');

// Destruir widget
SofiaWidget.destroy();

// ============================================
// CONFIGURAÇÃO VIA HTML
// ============================================

// Adicione antes do script do widget:
<script>
window.sofiaConfig = {
   primaryColor: '#667eea',
   position: 'bottom-left',
   welcomeMessage: 'Olá! Precisa de ajuda?'
};
</script>

// Ou para auto-inicialização:
<script>
window.sofiaAutoInit = true; // Usa preset recomendado automaticamente
</script>

// ============================================
// INTEGRAÇÃO COM ANALYTICS
// ============================================

SofiaWidget.init({
   analytics: true,
   primaryColor: '#667eea'
});

// Eventos rastreados automaticamente:
// - widget_loaded
// - chat_opened
// - chat_closed
// - message_sent
// - notification_shown
// - exit_intent_shown
// - chat_opened_from_exit_intent

// ============================================
// DETECÇÃO AUTOMÁTICA DE DISPOSITIVO
// ============================================

// Verificar se é mobile
if (SofiaWidget.utils.isMobile()) {
   SofiaWidget.init(SofiaWidget.presets.mobile);
} else {
   SofiaWidget.init(SofiaWidget.presets.professional);
}

// Ou usar preset recomendado automaticamente
const preset = SofiaWidget.utils.getRecommendedPreset();
SofiaWidget.init(SofiaWidget.presets[preset]);

// ============================================
// CONFIGURAÇÃO AVANÇADA
// ============================================

SofiaWidget.init({
   // Cores e visual
   primaryColor: '#667eea',
   secondaryColor: '#764ba2',
   position: 'bottom-right',
   
   // Conteúdo
   welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica. Como posso te ajudar hoje?',
   avatarUrl: './Sofia_IA.png',
   
   // Comportamento
   showAfterSeconds: 3,
   notificationDelay: 15000,
   exitIntentEnabled: true,
   apiTimeout: 10000,
   
   // Funcionalidades
   mobileOptimized: true,
   analytics: true,
   fallbackAvatar: true
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// O widget já trata automaticamente:
// - Falhas na API
// - Timeout de conexão
// - Perda de internet
// - Imagens não encontradas
// - Errors de JavaScript

// Para debug, verifique o console do navegador

// ============================================
// PERSONALIZAÇÃO VIA CSS
// ============================================

// Você pode sobrescrever estilos específicos:
<style>
.sofia-bubble {
   width: 80px !important;
   height: 80px !important;
}

.sofia-message.sofia .sofia-message-content {
   background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%) !important;
}
</style>

*/
