/**
 * Sofia Widget - Versão 2.7 - API Funcionando
 * Código corrigido para funcionar com a API
 */

(function() {
    'use strict';

    const API_URL = "https://sofia-api-backend-production.up.railway.app/chat";
    
    const defaultConfig = {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        position: 'bottom-right',
        welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica. Como posso te ajudar hoje?',
        showAfterSeconds: 2,
        analytics: false
    };

    class SofiaWidget {
        constructor(config = {}) {
            this.config = { ...defaultConfig, ...config };
            this.chatOpen = false;
            this.isTyping = false;
            this.messageCount = 0;
            
            this.init();
        }

        init() {
            this.injectStyles();
            this.createHTML();
            this.bindEvents();
            this.startBehaviors();
            console.log('✅ Sofia Widget inicializado com sucesso!');
        }

        injectStyles() {
            const styles = `
                .sofia-widget-container * {
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .sofia-bubble {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
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

                @keyframes sofia-pulse {
                    0%, 100% { box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
                }

                .sofia-bubble:hover {
                    transform: scale(1.1);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
                }

                .sofia-avatar {
                    width: 40px;
                    height: 40px;
                    background: rgba(255,255,255,0.9);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: bold;
                    color: ${this.config.primaryColor};
                    border: 2px solid rgba(255,255,255,0.3);
                }

                .sofia-chat-window {
                    position: fixed;
                    bottom: 120px;
                    right: 30px;
                    width: 400px;
                    height: 600px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 999997;
                    transition: all 0.4s ease;
                }

                .sofia-chat-window.open {
                    display: flex;
                }

                .sofia-chat-header {
                    background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
                    color: white;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .sofia-header-info h3 {
                    margin: 0;
                    font-size: 18px;
                }

                .sofia-header-info p {
                    margin: 5px 0 0 0;
                    font-size: 12px;
                    opacity: 0.8;
                }

                .sofia-status-dot {
                    width: 8px;
                    height: 8px;
                    background: #28a745;
                    border-radius: 50%;
                    display: inline-block;
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
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    transition: background 0.2s;
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
                    animation: sofia-slide-in 0.3s ease;
                }

                @keyframes sofia-slide-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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
                }

                .sofia-typing-indicator.show {
                    display: flex;
                    animation: sofia-slide-in 0.3s ease;
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

                .sofia-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
                .sofia-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

                @keyframes sofia-typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-8px); opacity: 1; }
                }

                .sofia-chat-input-area {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .sofia-chat-input {
                    flex: 1;
                    padding: 14px 18px;
                    border: 2px solid #e9ecef;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    background: #f8f9fa;
                    transition: all 0.3s ease;
                }

                .sofia-chat-input:focus {
                    border-color: ${this.config.primaryColor};
                    background: white;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
                    font-size: 18px;
                    transition: all 0.3s ease;
                }

                .sofia-send-button:hover:not(:disabled) {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }

                .sofia-send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .sofia-connection-status {
                    position: fixed;
                    bottom: 10px;
                    left: 10px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 10px;
                    font-size: 12px;
                    z-index: 999998;
                    display: none;
                }

                .sofia-connection-status.show {
                    display: block;
                }

                .sofia-connection-status.online {
                    background: rgba(40, 167, 69, 0.9);
                }

                .sofia-connection-status.offline {
                    background: rgba(220, 53, 69, 0.9);
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
                    
                    .sofia-avatar {
                        width: 35px;
                        height: 35px;
                        font-size: 16px;
                    }
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
                <div class="sofia-connection-status" id="sofiaConnectionStatus">
                    🔄 Conectando...
                </div>

                <div class="sofia-bubble" id="sofiaBubble">
                    <div class="sofia-avatar">S</div>
                </div>

                <div class="sofia-chat-window" id="sofiaChatWindow">
                    <div class="sofia-chat-header">
                        <div class="sofia-header-info">
                            <h3>Sofia</h3>
                            <p><span class="sofia-status-dot"></span>Consultora Estoica • Online</p>
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
            `;

            document.body.appendChild(container);
        }

        bindEvents() {
            const bubble = document.getElementById('sofiaBubble');
            const closeBtn = document.querySelector('.sofia-close-chat');
            const sendBtn = document.getElementById('sofiaSendButton');
            const input = document.getElementById('sofiaChatInput');

            if (bubble) {
                bubble.addEventListener('click', () => this.toggleChat());
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.toggleChat());
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', () => this.sendMessage());
            }

            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });
            }

            console.log('✅ Eventos vinculados com sucesso!');
        }

        startBehaviors() {
            // Mostrar bubble
            setTimeout(() => {
                const bubble = document.getElementById('sofiaBubble');
                if (bubble) {
                    bubble.classList.add('show');
                    console.log('✅ Bubble exibido!');
                }
            }, this.config.showAfterSeconds * 1000);

            // Testar conexão
            this.testConnection();
        }

        async testConnection() {
            const statusElement = document.getElementById('sofiaConnectionStatus');
            
            if (statusElement) {
                statusElement.classList.add('show');
                statusElement.textContent = '🔄 Testando conexão...';
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mensagem: 'teste de conexão' })
                });

                if (response.ok) {
                    console.log('✅ API conectada com sucesso!');
                    if (statusElement) {
                        statusElement.textContent = '✅ API Online';
                        statusElement.classList.add('online');
                        setTimeout(() => {
                            statusElement.classList.remove('show');
                        }, 3000);
                    }
                } else {
                    throw new Error(`Status ${response.status}`);
                }
            } catch (error) {
                console.error('❌ Erro na conexão:', error);
                if (statusElement) {
                    statusElement.textContent = '❌ API Offline';
                    statusElement.classList.add('offline');
                }
            }
        }

        toggleChat() {
            const chatWindow = document.getElementById('sofiaChatWindow');
            
            if (!chatWindow) {
                console.error('❌ Elemento do chat não encontrado!');
                return;
            }

            this.chatOpen = !this.chatOpen;
            console.log(`📱 Chat ${this.chatOpen ? 'aberto' : 'fechado'}`);

            if (this.chatOpen) {
                chatWindow.classList.add('open');
                setTimeout(() => {
                    const input = document.getElementById('sofiaChatInput');
                    if (input) input.focus();
                }, 300);
            } else {
                chatWindow.classList.remove('open');
            }
        }

        sendMessage() {
            const input = document.getElementById('sofiaChatInput');
            
            if (!input) {
                console.error('❌ Campo de input não encontrado!');
                return;
            }

            const message = input.value.trim();
            console.log('📝 Mensagem enviada:', message);

            if (message && !this.isTyping) {
                this.addMessage(message, 'user');
                input.value = '';
                this.callSofiaAPI(message);
                this.messageCount++;
            }
        }

        async callSofiaAPI(userMessage) {
            console.log('🚀 Chamando API Sofia...');
            this.showTyping();

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ mensagem: userMessage })
                });

                console.log('📡 Resposta da API - Status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('📄 Dados recebidos:', data);
                    
                    const reply = data.resposta || data.message || 'Resposta recebida!';
                    
                    // Simular tempo de digitação
                    setTimeout(() => {
                        this.addMessage(reply, 'sofia');
                        this.hideTyping();
                        console.log('✅ Resposta exibida com sucesso!');
                    }, 1500);

                } else {
                    throw new Error(`HTTP ${response.status}`);
                }

            } catch (error) {
                console.error('❌ Erro na API:', error);
                
                setTimeout(() => {
                    this.addMessage(
                        'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes.',
                        'sofia'
                    );
                    this.hideTyping();
                }, 1000);
            }
        }

        addMessage(content, sender = 'sofia') {
            const messages = document.getElementById('sofiaChatMessages');
            if (!messages) {
                console.error('❌ Container de mensagens não encontrado!');
                return;
            }

            const time = new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Criar mensagem
            const msgDiv = document.createElement('div');
            msgDiv.className = `sofia-message ${sender}`;
            msgDiv.innerHTML = `<div class="sofia-message-content">${this.escapeHtml(content)}</div>`;

            // Criar timestamp
            const timeDiv = document.createElement('div');
            timeDiv.className = 'sofia-message-time';
            timeDiv.textContent = time;

            messages.appendChild(msgDiv);
            messages.appendChild(timeDiv);

            // Auto-scroll
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 100);

            console.log(`💬 Mensagem adicionada (${sender}):`, content);
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        showTyping() {
            console.log('⌨️ Mostrando indicador de digitação...');
            this.isTyping = true;
            
            const indicator = document.getElementById('sofiaTypingIndicator');
            const sendBtn = document.getElementById('sofiaSendButton');
            const input = document.getElementById('sofiaChatInput');

            if (indicator) indicator.classList.add('show');
            if (sendBtn) sendBtn.disabled = true;
            if (input) input.disabled = true;

            // Auto-scroll para o indicador
            setTimeout(() => {
                const messages = document.getElementById('sofiaChatMessages');
                if (messages) messages.scrollTop = messages.scrollHeight;
            }, 100);
        }

        hideTyping() {
            console.log('✋ Ocultando indicador de digitação...');
            this.isTyping = false;
            
            const indicator = document.getElementById('sofiaTypingIndicator');
            const sendBtn = document.getElementById('sofiaSendButton');
            const input = document.getElementById('sofiaChatInput');

            if (indicator) indicator.classList.remove('show');
            if (sendBtn) sendBtn.disabled = false;
            if (input) input.disabled = false;
        }

        // Métodos públicos
        open() {
            if (!this.chatOpen) this.toggleChat();
        }

        close() {
            if (this.chatOpen) this.toggleChat();
        }

        sendMessageProgrammatically(message) {
            this.addMessage(message, 'sofia');
        }
    }

    // Inicialização global
    window.SofiaWidget = {
        instance: null,
        
        init: function(config = {}) {
            console.log('🚀 Inicializando Sofia Widget...');
            
            if (this.instance) {
                console.warn('⚠️ Sofia Widget já foi inicializado!');
                return this.instance;
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.instance = new SofiaWidget(config);
                    window.sofiaWidget = this.instance;
                    console.log('✅ Sofia Widget carregado após DOM ready!');
                });
            } else {
                this.instance = new SofiaWidget(config);
                window.sofiaWidget = this.instance;
                console.log('✅ Sofia Widget carregado imediatamente!');
            }

            return this.instance;
        },

        open: function() {
            if (this.instance) this.instance.open();
        },

        close: function() {
            if (this.instance) this.instance.close();
        }
    };

    // Auto-inicialização
    if (typeof window.sofiaConfig !== 'undefined') {
        console.log('🔧 Usando configuração global:', window.sofiaConfig);
        window.SofiaWidget.init(window.sofiaConfig);
    }

})();

// Inicializar automaticamente se não houver config global
if (typeof window.sofiaConfig === 'undefined') {
    console.log('🚀 Auto-inicializando Sofia Widget...');
    SofiaWidget.init();
}
