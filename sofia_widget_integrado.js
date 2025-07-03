/**
 * Sofia Widget V3.1 - VERSÃO CORRIGIDA
 * Problema da imagem resolvido + Fallbacks inteligentes
 */

(function() {
    'use strict';

    // CONFIGURAÇÕES PADRÃO
    const defaultConfig = {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        position: 'bottom-right',
        welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica. Como posso te ajudar?',
        avatarUrl: './Sofia_IA.png', // CAMINHO CORRIGIDO
        showAfterSeconds: 3,
        notificationDelay: 15000,
        exitIntentEnabled: true,
        analytics: true
    };

    // API URL com fallback
    const API_URL = "https://sofia-api-backend-production.up.railway.app/chat";

    class SofiaWidget {
        constructor(config = {}) {
            this.config = { ...defaultConfig, ...config };
            this.chatOpen = false;
            this.isTyping = false;
            this.notificationShown = false;
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
            console.log('🏛️ Sofia Widget carregado!');
        }

        async testAPIConnection() {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mensagem: 'ping' }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                this.apiConnected = response.ok;
                console.log('🧠 Sofia API:', this.apiConnected ? '✅ Online' : '❌ Offline');
            } catch (error) {
                this.apiConnected = false;
                console.log('🧠 Sofia API: ❌ Offline - usando respostas locais');
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

                .sofia-avatar {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid rgba(255,255,255,0.3);
                    display: block;
                }

                .sofia-avatar-fallback {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                    font-weight: bold;
                    border: 2px solid rgba(255,255,255,0.3);
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
                    transform: translateY(20px);
                    transition: all 0.4s ease;
                    z-index: 999998;
                    color: #333;
                    border-left: 4px solid ${this.config.primaryColor};
                }

                .sofia-notification.show {
                    opacity: 1;
                    transform: translateY(0);
                }

                .sofia-notification-close {
                    position: absolute;
                    top: 8px;
                    right: 12px;
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #999;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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
                    z-index: 999997;
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                    transition: all 0.3s ease;
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

                .sofia-header-info {
                    display: flex;
                    align-items: center;
                }

                .sofia-header-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    margin-right: 15px;
                    border: 2px solid rgba(255,255,255,0.3);
                    object-fit: cover;
                }

                .sofia-header-avatar-fallback {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin-right: 15px;
                    border: 2px solid rgba(255,255,255,0.3);
                    color: white;
                    font-weight: bold;
                }

                .sofia-header-text h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .sofia-header-text p {
                    margin: 4px 0 0 0;
                    font-size: 13px;
                    opacity: 0.9;
                    display: flex;
                    align-items: center;
                }

                .sofia-online-dot {
                    width: 8px;
                    height: 8px;
                    background: #4ade80;
                    border-radius: 50%;
                    margin-right: 6px;
                    animation: sofia-blink 2s infinite;
                }

                @keyframes sofia-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .sofia-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .sofia-close-btn:hover {
                    background: rgba(255,255,255,0.1);
                    transform: scale(1.1);
                }

                .sofia-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .sofia-message {
                    display: flex;
                    opacity: 0;
                    transform: translateY(10px);
                    animation: sofia-slide-in 0.3s ease forwards;
                }

                @keyframes sofia-slide-in {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .sofia-message.user {
                    justify-content: flex-end;
                }

                .sofia-message-bubble {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    word-wrap: break-word;
                    line-height: 1.4;
                    font-size: 14px;
                    position: relative;
                }

                .sofia-message.sofia .sofia-message-bubble {
                    background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
                    color: white;
                    border-bottom-left-radius: 4px;
                }

                .sofia-message.user .sofia-message-bubble {
                    background: #e2e8f0;
                    color: #334155;
                    border-bottom-right-radius: 4px;
                }

                .sofia-message-time {
                    font-size: 11px;
                    opacity: 0.6;
                    margin-top: 4px;
                    text-align: center;
                }

                .sofia-typing {
                    display: none;
                    align-items: center;
                }

                .sofia-typing.show {
                    display: flex;
                    animation: sofia-slide-in 0.3s ease forwards;
                }

                .sofia-typing-bubble {
                    background: ${this.config.primaryColor};
                    padding: 12px 16px;
                    border-radius: 18px;
                    border-bottom-left-radius: 4px;
                }

                .sofia-typing-dots {
                    display: flex;
                    gap: 4px;
                }

                .sofia-typing-dot {
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    animation: sofia-typing-anim 1.4s infinite;
                }

                .sofia-typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .sofia-typing-dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes sofia-typing-anim {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-8px); opacity: 1; }
                }

                .sofia-input-area {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    border-radius: 0 0 20px 20px;
                }

                .sofia-input {
                    flex: 1;
                    padding: 14px 18px;
                    border: 2px solid #e2e8f0;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    background: #f8fafc;
                }

                .sofia-input:focus {
                    border-color: ${this.config.primaryColor};
                    background: white;
                    box-shadow: 0 0 0 3px ${this.hexToRgba(this.config.primaryColor, 0.1)};
                }

                .sofia-send-btn {
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

                .sofia-send-btn:hover:not(:disabled) {
                    transform: scale(1.05);
                    box-shadow: 0 4px 20px ${this.hexToRgba(this.config.primaryColor, 0.4)};
                }

                .sofia-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 480px) {
                    .sofia-chat-window {
                        width: calc(100vw - 20px) !important;
                        height: calc(100vh - 40px) !important;
                        bottom: 10px !important;
                        left: 10px !important;
                        right: 10px !important;
                    }
                    
                    .sofia-bubble {
                        width: 60px !important;
                        height: 60px !important;
                        bottom: 20px !important;
                        right: 20px !important;
                    }

                    .sofia-avatar, .sofia-avatar-fallback {
                        width: 35px !important;
                        height: 35px !important;
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
            
            // Criar elemento de imagem com fallback
            const avatarElement = this.createAvatarElement();
            const headerAvatarElement = this.createHeaderAvatarElement();
            
            container.innerHTML = `
                <div class="sofia-notification" id="sofiaNotification">
                    <button class="sofia-notification-close" onclick="window.sofiaWidget && window.sofiaWidget.hideNotification()">×</button>
                    <strong>👋 Precisa de ajuda?</strong><br>
                    Sou a Sofia e posso te ajudar com o AppEstoicismo!
                </div>

                <div class="sofia-bubble" id="sofiaBubble">
                    ${avatarElement}
                </div>

                <div class="sofia-chat-window" id="sofiaChatWindow">
                    <div class="sofia-chat-header">
                        <div class="sofia-header-info">
                            ${headerAvatarElement}
                            <div class="sofia-header-text">
                                <h3>Sofia</h3>
                                <p><span class="sofia-online-dot"></span>Consultora Estoica • Online</p>
                            </div>
                        </div>
                        <button class="sofia-close-btn" id="sofiaCloseBtn">×</button>
                    </div>

                    <div class="sofia-messages" id="sofiaMessages">
                        <div class="sofia-message sofia">
                            <div class="sofia-message-bubble">${this.config.welcomeMessage}</div>
                        </div>
                        <div class="sofia-message-time">Agora</div>

                        <div class="sofia-typing" id="sofiaTyping">
                            <div class="sofia-typing-bubble">
                                <div class="sofia-typing-dots">
                                    <div class="sofia-typing-dot"></div>
                                    <div class="sofia-typing-dot"></div>
                                    <div class="sofia-typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="sofia-input-area">
                        <input type="text" class="sofia-input" id="sofiaInput" placeholder="Digite sua mensagem...">
                        <button class="sofia-send-btn" id="sofiaSendBtn">➤</button>
                    </div>
                </div>
            `;

            document.body.appendChild(container);
        }

        createAvatarElement() {
            return `
                <img src="${this.config.avatarUrl}" 
                     alt="Sofia" 
                     class="sofia-avatar" 
                     onload="console.log('✅ Imagem da Sofia carregada!')"
                     onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\\'sofia-avatar-fallback\\'>S</div>'; console.log('❌ Erro ao carregar imagem da Sofia, usando fallback')">
            `;
        }

        createHeaderAvatarElement() {
            return `
                <img src="${this.config.avatarUrl}" 
                     alt="Sofia" 
                     class="sofia-header-avatar"
                     onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\\'sofia-header-avatar-fallback\\'>S</div>'">
            `;
        }

        bindEvents() {
            document.getElementById('sofiaBubble')?.addEventListener('click', () => this.toggleChat());
            document.getElementById('sofiaCloseBtn')?.addEventListener('click', () => this.toggleChat());
            document.getElementById('sofiaSendBtn')?.addEventListener('click', () => this.sendMessage());
            
            document.getElementById('sofiaInput')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        startBehaviors() {
            setTimeout(() => {
                document.getElementById('sofiaBubble')?.classList.add('show');
            }, this.config.showAfterSeconds * 1000);

            setTimeout(() => {
                if (!this.chatOpen && !this.notificationShown) {
                    this.showNotification();
                }
            }, this.config.notificationDelay);
        }

        toggleChat() {
            const chatWindow = document.getElementById('sofiaChatWindow');
            
            this.hideNotification();
            this.chatOpen = !this.chatOpen;
            
            if (this.chatOpen) {
                chatWindow?.classList.add('open');
                setTimeout(() => {
                    document.getElementById('sofiaInput')?.focus();
                }, 300);
                console.log('💬 Chat aberto');
            } else {
                chatWindow?.classList.remove('open');
                console.log('💬 Chat fechado');
            }
        }

        sendMessage() {
            const input = document.getElementById('sofiaInput');
            const message = input?.value.trim();
            
            if (message && !this.isTyping) {
                this.addMessage(message, 'user');
                input.value = '';
                this.getSofiaResponse(message);
                this.messageCount++;
            }
        }

        async getSofiaResponse(userMessage) {
            this.showTyping();
            
            // Tentativa 1: API do Railway
            if (this.apiConnected) {
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mensagem: userMessage }),
                        timeout: 10000
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const reply = data.resposta || data.message || "Resposta da Sofia API!";
                        
                        setTimeout(() => {
                            this.hideTyping();
                            this.addMessage(reply, 'sofia');
                        }, Math.min(reply.length * 30, 2000));
                        return;
                    }
                } catch (error) {
                    console.log('⚠️ API offline, usando respostas locais');
                    this.apiConnected = false;
                }
            }
            
            // Fallback: Respostas locais inteligentes
            const localResponse = this.getLocalResponse(userMessage);
            setTimeout(() => {
                this.hideTyping();
                this.addMessage(localResponse, 'sofia');
            }, 1500);
        }

        getLocalResponse(userMessage) {
            const msg = userMessage.toLowerCase();
            
            // Respostas específicas sobre o AppEstoicismo
            if (msg.includes('preço') || msg.includes('valor') || msg.includes('custa')) {
                return `O AppEstoicismo está com uma oferta especial: <strong>R$ 19,90/mês</strong> (79% OFF).<br><br>🎯 <a href="https://pay.kiwify.com.br/iT6ZM5N" target="_blank" style="color: #22c55e; font-weight: bold;">Garantir acesso agora</a>`;
            }
            
            if (msg.includes('funciona') || msg.includes('como') || msg.includes('metodo')) {
                return `O AppEstoicismo usa o <strong>Método N.E.R.O™</strong> - Neurociência + Estoicismo para reprogramar sua mente em apenas 10 min/dia.<br><br>✅ 48+ ferramentas práticas<br>✅ Mentor IA disponível 24/7<br>✅ Garantia de 7 dias`;
            }
            
            if (msg.includes('garantia') || msg.includes('cancelar') || msg.includes('devolver')) {
                return `<strong>Garantia total de 7 dias!</strong> 🛡️<br><br>Se não gostar, cancele com 1 clique e receba 100% do seu dinheiro de volta. Sem perguntas, sem burocracia.`;
            }
            
            if (msg.includes('comprar') || msg.includes('quero') || msg.includes('vamos')) {
                return `Perfeito! Vamos começar sua jornada estoica agora! 🏛️<br><br>👉 <a href="https://pay.kiwify.com.br/iT6ZM5N" target="_blank" style="color: #22c55e; font-weight: bold; text-decoration: none; padding: 8px 16px; background: #22c55e; color: white; border-radius: 6px;">COMEÇAR MEU TREINO MENTAL</a><br><br>✅ Acesso imediato<br>✅ 79% de desconto<br>✅ 7 dias de garantia`;
            }
            
            // Respostas gerais estoicas
            const respostasGerais = [
                `Como dizia Marco Aurélio: "Você tem poder sobre sua mente - não sobre eventos externos. Perceba isso, e você encontrará força." O AppEstoicismo te ensina exatamente isso! 🏛️`,
                `Interessante perspectiva! Na filosofia estoica, focamos no que podemos controlar. Como posso te ajudar com isso hoje?`,
                `O estoicismo nos ensina que nossa resposta às situações é mais importante que as situações em si. Quer saber como aplicar isso na prática?`,
                `Baseado no que você disse, o AppEstoicismo tem ferramentas específicas que podem te ajudar. Quer conhecer o método N.E.R.O™?`
            ];
            
            return respostasGerais[Math.floor(Math.random() * respostasGerais.length)];
        }

        addMessage(text, sender) {
            const messagesContainer = document.getElementById('sofiaMessages');
            if (!messagesContainer) return;

            const messageDiv = document.createElement('div');
            const bubbleDiv = document.createElement('div');
            const timeDiv = document.createElement('div');
            
            messageDiv.className = `sofia-message ${sender}`;
            bubbleDiv.className = 'sofia-message-bubble';
            bubbleDiv.innerHTML = text; // innerHTML para permitir HTML nas respostas
            timeDiv.className = 'sofia-message-time';
            timeDiv.textContent = this.getCurrentTime();
            
            messageDiv.appendChild(bubbleDiv);
            messagesContainer.appendChild(messageDiv);
            messagesContainer.appendChild(timeDiv);
            
            this.scrollToBottom();
        }

        showTyping() {
            this.isTyping = true;
            document.getElementById('sofiaTyping')?.classList.add('show');
            const sendBtn = document.getElementById('sofiaSendBtn');
            if (sendBtn) sendBtn.disabled = true;
            this.scrollToBottom();
        }

        hideTyping() {
            this.isTyping = false;
            document.getElementById('sofiaTyping')?.classList.remove('show');
            const sendBtn = document.getElementById('sofiaSendBtn');
            if (sendBtn) sendBtn.disabled = false;
        }

        showNotification() {
            if (this.notificationShown || this.chatOpen) return;
            
            document.getElementById('sofiaNotification')?.classList.add('show');
            this.notificationShown = true;
            
            setTimeout(() => this.hideNotification(), 8000);
        }

        hideNotification() {
            document.getElementById('sofiaNotification')?.classList.remove('show');
        }

        getCurrentTime() {
            return new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

        scrollToBottom() {
            setTimeout(() => {
                const messages = document.getElementById('sofiaMessages');
                if (messages) {
                    messages.scrollTop = messages.scrollHeight;
                }
            }, 100);
        }

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

        hexToRgba(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        // API Pública
        open() {
            if (!this.chatOpen) this.toggleChat();
        }

        close() {
            if (this.chatOpen) this.toggleChat();
        }

        destroy() {
            const container = document.querySelector('.sofia-widget-container');
            if (container) container.remove();
            window.sofiaWidget = null;
        }
    }

    // PRESETS
    const presets = {
        estoic: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica. Como posso te ajudar com o AppEstoicismo hoje? 🏛️',
            avatarUrl: './Sofia_IA.png',
            showAfterSeconds: 3,
            exitIntentEnabled: true
        },
        
        minimal: {
           primaryColor: '#2d3748',
           secondaryColor: '#4a5568',
           welcomeMessage: 'Olá! Como posso ajudar?',
           avatarUrl: './Sofia_IA.png',
           showAfterSeconds: 5,
           exitIntentEnabled: false
       },
       
       modern: {
           primaryColor: '#6366f1',
           secondaryColor: '#8b5cf6',
           welcomeMessage: 'Oi! 👋 Sou sua assistente virtual. Em que posso ajudar?',
           avatarUrl: './Sofia_IA.png',
           showAfterSeconds: 2,
           exitIntentEnabled: true
       }
   };

   // API GLOBAL
   window.SofiaWidget = {
       instance: null,
       presets: presets,
       
       init(config = {}) {
           if (this.instance) {
               console.warn('⚠️ Sofia Widget já foi inicializado');
               return this.instance;
           }
           
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

       open() {
           if (this.instance) this.instance.open();
       },

       close() {
           if (this.instance) this.instance.close();
       },

       destroy() {
           if (this.instance) {
               this.instance.destroy();
               this.instance = null;
               window.sofiaWidget = null;
           }
       }
   };

   // AUTO-INIT SE TIVER CONFIGURAÇÃO GLOBAL
   if (typeof window.sofiaConfig !== 'undefined') {
       window.SofiaWidget.init(window.sofiaConfig);
   }

   console.log('🚀 Sofia Widget V3.1 carregado - VERSÃO CORRIGIDA!');

})();
