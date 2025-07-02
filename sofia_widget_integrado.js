/**
 * Sofia Widget - Versão FUNCIONAL SIMPLES
 * Foco: FUNCIONAR sem travar
 */

(function() {
    'use strict';

    const API_URL = "https://sofia-api-backend-production.up.railway.app/chat";
    
    class SofiaWidgetSimples {
        constructor() {
            this.chatOpen = false;
            this.isTyping = false;
            
            console.log('🧠 Iniciando Sofia Widget Simples...');
            this.init();
        }

        init() {
            this.criarEstilos();
            this.criarHTML();
            this.vincularEventos();
            this.mostrarBubble();
            console.log('✅ Sofia Widget inicializado!');
        }

        criarEstilos() {
            const css = `
                .sofia-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .sofia-bubble {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    opacity: 0;
                    transform: scale(0.8);
                    transition: all 0.3s ease;
                }

                .sofia-bubble.show {
                    opacity: 1;
                    transform: scale(1);
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
                    font-size: 20px;
                    font-weight: bold;
                    color: #667eea;
                }

                .sofia-chat {
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
                    z-index: 999997;
                }

                .sofia-chat.open {
                    display: flex;
                }

                .sofia-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 20px 20px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .sofia-header h3 {
                    margin: 0;
                    font-size: 18px;
                }

                .sofia-header p {
                    margin: 5px 0 0 0;
                    font-size: 12px;
                    opacity: 0.8;
                }

                .sofia-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                }

                .sofia-close:hover {
                    background: rgba(255,255,255,0.1);
                }

                .sofia-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: #f8f9fa;
                }

                .sofia-message {
                    margin-bottom: 15px;
                    display: flex;
                }

                .sofia-message.user {
                    justify-content: flex-end;
                }

                .sofia-message-text {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    word-wrap: break-word;
                    line-height: 1.4;
                    font-size: 14px;
                }

                .sofia-message.sofia .sofia-message-text {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-bottom-left-radius: 6px;
                }

                .sofia-message.user .sofia-message-text {
                    background: #e9ecef;
                    color: #333;
                    border-bottom-right-radius: 6px;
                }

                .sofia-typing {
                    display: none;
                    margin-bottom: 15px;
                }

                .sofia-typing.show {
                    display: block;
                }

                .sofia-typing-dots {
                    background: #667eea;
                    padding: 12px 16px;
                    border-radius: 18px;
                    border-bottom-left-radius: 6px;
                    display: inline-block;
                }

                .sofia-typing-dots span {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: white;
                    margin: 0 2px;
                    animation: typing 1.4s infinite;
                }

                .sofia-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
                .sofia-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-8px); opacity: 1; }
                }

                .sofia-input-area {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    gap: 12px;
                    border-radius: 0 0 20px 20px;
                }

                .sofia-input {
                    flex: 1;
                    padding: 14px 18px;
                    border: 2px solid #e9ecef;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    background: #f8f9fa;
                }

                .sofia-input:focus {
                    border-color: #667eea;
                    background: white;
                }

                .sofia-send {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    font-size: 18px;
                }

                .sofia-send:hover {
                    transform: scale(1.05);
                }

                .sofia-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                @media (max-width: 480px) {
                    .sofia-chat {
                        width: calc(100vw - 20px) !important;
                        height: calc(100vh - 40px) !important;
                        bottom: 10px !important;
                        right: 10px !important;
                        left: 10px !important;
                    }
                }
            `;

            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        }

        criarHTML() {
            const container = document.createElement('div');
            container.className = 'sofia-container';
            container.innerHTML = `
                <div class="sofia-bubble" id="sofiaBubble">
                    <div class="sofia-avatar">S</div>
                </div>

                <div class="sofia-chat" id="sofiaChat">
                    <div class="sofia-header">
                        <div>
                            <h3>Sofia</h3>
                            <p>Consultora Estoica • Online</p>
                        </div>
                        <button class="sofia-close" id="sofiaClose">✕</button>
                    </div>

                    <div class="sofia-messages" id="sofiaMessages">
                        <div class="sofia-message sofia">
                            <div class="sofia-message-text">Olá! Sou a Sofia, sua consultora estoica. Como posso te ajudar hoje? 😊</div>
                        </div>

                        <div class="sofia-typing" id="sofiaTyping">
                            <div class="sofia-typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>

                    <div class="sofia-input-area">
                        <input 
                            type="text" 
                            class="sofia-input" 
                            id="sofiaInput" 
                            placeholder="Digite sua mensagem..."
                        >
                        <button class="sofia-send" id="sofiaSend">➤</button>
                    </div>
                </div>
            `;

            document.body.appendChild(container);
        }

        vincularEventos() {
            // Bubble click
            const bubble = document.getElementById('sofiaBubble');
            bubble.addEventListener('click', () => {
                console.log('🖱️ Bubble clicado!');
                this.toggleChat();
            });

            // Close button
            const closeBtn = document.getElementById('sofiaClose');
            closeBtn.addEventListener('click', () => {
                console.log('❌ Fechar clicado!');
                this.toggleChat();
            });

            // Send button
            const sendBtn = document.getElementById('sofiaSend');
            sendBtn.addEventListener('click', () => {
                console.log('📤 Enviar clicado!');
                this.enviarMensagem();
            });

            // Enter key
            const input = document.getElementById('sofiaInput');
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('⌨️ Enter pressionado!');
                    this.enviarMensagem();
                }
            });

            console.log('✅ Eventos vinculados!');
        }

        mostrarBubble() {
            setTimeout(() => {
                const bubble = document.getElementById('sofiaBubble');
                bubble.classList.add('show');
                console.log('✅ Bubble exibido!');
            }, 2000);
        }

        toggleChat() {
            const chat = document.getElementById('sofiaChat');
            
            this.chatOpen = !this.chatOpen;
            console.log(`💬 Chat ${this.chatOpen ? 'aberto' : 'fechado'}`);

            if (this.chatOpen) {
                chat.classList.add('open');
                setTimeout(() => {
                    document.getElementById('sofiaInput').focus();
                }, 300);
            } else {
                chat.classList.remove('open');
            }
        }

        enviarMensagem() {
            const input = document.getElementById('sofiaInput');
            const mensagem = input.value.trim();

            if (mensagem && !this.isTyping) {
                console.log('📝 Enviando mensagem:', mensagem);
                this.adicionarMensagem(mensagem, 'user');
                input.value = '';
                this.chamarAPI(mensagem);
            }
        }

        async chamarAPI(mensagem) {
            console.log('🚀 Chamando API Sofia...');
            this.mostrarTyping();

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mensagem: mensagem })
                });

                console.log('📡 Resposta da API - Status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('📄 Dados:', data);
                    
                    const resposta = data.resposta || 'Resposta recebida!';
                    
                    setTimeout(() => {
                        this.adicionarMensagem(resposta, 'sofia');
                        this.esconderTyping();
                        console.log('✅ Resposta exibida!');
                    }, 1500);

                } else {
                    throw new Error(`HTTP ${response.status}`);
                }

            } catch (error) {
                console.error('❌ Erro na API:', error);
                
                setTimeout(() => {
                    this.adicionarMensagem(
                        'Desculpe, tive um problema técnico. Pode repetir?',
                        'sofia'
                    );
                    this.esconderTyping();
                }, 1000);
            }
        }

        adicionarMensagem(texto, tipo) {
            const messages = document.getElementById('sofiaMessages');
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `sofia-message ${tipo}`;
            messageDiv.innerHTML = `<div class="sofia-message-text">${this.escaparHTML(texto)}</div>`;

            messages.appendChild(messageDiv);
            
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 100);

            console.log(`💬 Mensagem adicionada (${tipo}):`, texto);
        }

        mostrarTyping() {
            this.isTyping = true;
            document.getElementById('sofiaTyping').classList.add('show');
            document.getElementById('sofiaSend').disabled = true;
            console.log('⌨️ Mostrando typing...');
        }

        esconderTyping() {
            this.isTyping = false;
            document.getElementById('sofiaTyping').classList.remove('show');
            document.getElementById('sofiaSend').disabled = false;
            console.log('✋ Escondendo typing...');
        }

        escaparHTML(texto) {
            const div = document.createElement('div');
            div.textContent = texto;
            return div.innerHTML;
        }
    }

    // Inicialização global simples
    window.SofiaWidget = {
        instance: null,
        
        init: function() {
            console.log('🚀 Inicializando Sofia Widget...');
            
            if (this.instance) {
                console.warn('⚠️ Sofia já foi inicializada!');
                return;
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.instance = new SofiaWidgetSimples();
                    window.sofiaWidget = this.instance;
                });
            } else {
                this.instance = new SofiaWidgetSimples();
                window.sofiaWidget = this.instance;
            }
        },

        open: function() {
            if (this.instance && !this.instance.chatOpen) {
                this.instance.toggleChat();
            }
        },

        close: function() {
            if (this.instance && this.instance.chatOpen) {
                this.instance.toggleChat();
            }
        }
    };

    // Auto-inicializar
    SofiaWidget.init();

})();

console.log('✅ Sofia Widget carregado com sucesso!');
