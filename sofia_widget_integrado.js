/**
 * Sofia Widget - Versão 4.0 - IA Avançada Completa
 * Integração com toda a inteligência da Sofia
 */

(function() {
    'use strict';

    const API_URL = "https://sofia-api-backend-production.up.railway.app/chat";
    
    const defaultConfig = {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        position: 'bottom-right',
        welcomeMessage: 'Olá! Sou a Sofia, sua consultora estoica inteligente. Como posso te ajudar hoje?',
        showAfterSeconds: 2,
        analytics: true,
        debug: false
    };

    class SofiaWidgetAvancado {
        constructor(config = {}) {
            this.config = { ...defaultConfig, ...config };
            this.chatOpen = false;
            this.isTyping = false;
            this.messageCount = 0;
            this.sessaoId = this.gerarSessaoId();
            this.contextoCompleto = "";
            this.analiseAtual = null;
            this.probabilidadeConversao = 0;
            this.faseAtual = "INICIAL";
            this.personaDetectada = null;
            this.temperaturaLead = "FRIO";
            
            this.init();
        }

        init() {
            this.log('🧠 Inicializando Sofia Widget Avançado...');
            this.injectStyles();
            this.createHTML();
            this.bindEvents();
            this.startBehaviors();
            this.iniciarConversa();
        }

        gerarSessaoId() {
            return 'sessao_' + Math.random().toString(36).substr(2, 9);
        }

        log(message, type = 'info') {
            if (this.config.debug) {
                console.log(`[Sofia Widget ${type.toUpperCase()}]:`, message);
            }
        }

        async iniciarConversa() {
            this.log('🚀 Iniciando conversa com Sofia...');
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        mensagem: '',
                        sessao_id: this.sessaoId,
                        contexto: '',
                        tipo: 'inicializacao'
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    this.log('✅ Sofia conectada e pronta!', 'success');
                    this.atualizarStatus('🟢 Sofia Online');
                    
                    // Se a API retornar dados de análise, processar
                    if (data.analise) {
                        this.processarAnalise(data.analise);
                    }
                } else {
                    throw new Error(`Status ${response.status}`);
                }
            } catch (error) {
                this.log(`❌ Erro na conexão: ${error.message}`, 'error');
                this.atualizarStatus('🔴 Sofia Offline');
            }
        }

        // [... resto do código de estilos e HTML similar ao anterior ...]

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

                .sofia-bubble.quente {
                    animation: sofia-pulse-rapido 1s infinite;
                    box-shadow: 0 8px 25px rgba(255, 165, 0, 0.6);
                }

                .sofia-bubble.muito-quente {
                    animation: sofia-pulse-urgente 0.5s infinite;
                    box-shadow: 0 8px 25px rgba(255, 0, 0, 0.8);
                }

                @keyframes sofia-pulse {
                    0%, 100% { box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
                }

                @keyframes sofia-pulse-rapido {
                    0%, 100% { box-shadow: 0 8px 25px rgba(255, 165, 0, 0.6); }
                    50% { box-shadow: 0 8px 25px rgba(255, 165, 0, 0.9); }
                }

                @keyframes sofia-pulse-urgente {
                    0%, 100% { box-shadow: 0 8px 25px rgba(255, 0, 0, 0.8); }
                    50% { box-shadow: 0 8px 25px rgba(255, 0, 0, 1); }
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
                    position: relative;
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

                .sofia-analytics-mini {
                    position: absolute;
                    top: 5px;
                    right: 50px;
                    font-size: 10px;
                    opacity: 0.7;
                    text-align: right;
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

                .sofia-status-dot.frio { background: #6c757d; }
                .sofia-status-dot.morno { background: #ffc107; }
                .sofia-status-dot.quente { background: #fd7e14; }
                .sofia-status-dot.muito-quente { background: #dc3545; animation: sofia-blink 0.5s infinite; }

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

                .sofia-message-analytics {
                    font-size: 10px;
                    opacity: 0.6;
                    margin: 5px 10px 0;
                    color: #666;
                    display: ${this.config.debug ? 'block' : 'none'};
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

                .sofia-probabilidade-conversao {
                    position: absolute;
                    bottom: -20px;
                    right: 20px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                    display: ${this.config.debug ? 'block' : 'none'};
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
                <div class="sofia-bubble" id="sofiaBubble">
                    <div class="sofia-avatar">S</div>
                    <div class="sofia-probabilidade-conversao" id="sofiaProbabilidade">
                        0%
                    </div>
                </div>

                <div class="sofia-chat-window" id="sofiaChatWindow">
                    <div class="sofia-chat-header">
                        <div class="sofia-header-info">
                            <h3>Sofia</h3>
                            <p><span class="sofia-status-dot" id="sofiaStatusDot"></span>Consultora Estoica IA • <span id="sofiaStatus">Inicializando...</span></p>
                        </div>
                        <div class="sofia-analytics-mini" id="sofiaAnalyticsMini">
                            Fase: <span id="sofiaFase">INICIAL</span><br>
                            Temp: <span id="sofiaTemp">FRIO</span><br>
                            Prob: <span id="sofiaProb">0%</span>
                        </div>
                        <button class="sofia-close-chat">✕</button>
                    </div>

                    <div class="sofia-chat-messages" id="sofiaChatMessages">
                        <div class="sofia-message sofia">
                            <div class="sofia-message-content">${this.config.welcomeMessage}</div>
                        </div>

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
            document.getElementById('sofiaBubble')?.addEventListener('click', () => this.toggleChat());
            document.querySelector('.sofia-close-chat')?.addEventListener('click', () => this.toggleChat());
            document.getElementById('sofiaSendButton')?.addEventListener('click', () => this.sendMessage());
            
            document.getElementById('sofiaChatInput')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        startBehaviors() {
            setTimeout(() => {
                document.getElementById('sofiaBubble')?.classList.add('show');
            }, this.config.showAfterSeconds * 1000);
        }

        toggleChat() {
            const chatWindow = document.getElementById('sofiaChatWindow');
            this.chatOpen = !this.chatOpen;

            if (this.chatOpen) {
                chatWindow?.classList.add('open');
                setTimeout(() => {
                    document.getElementById('sofiaChatInput')?.focus();
                }, 300);

                if (this.config.analytics) this.trackEvent('chat_opened');
            } else {
                chatWindow?.classList.remove('open');
                if (this.config.analytics) this.trackEvent('chat_closed');
            }
        }

        async sendMessage() {
            const input = document.getElementById('sofiaChatInput');
            const message = input?.value.trim();

            if (message && !this.isTyping) {
                this.addMessage(message, 'user');
                input.value = '';
                this.messageCount++;

                await this.callSofiaAdvancedAPI(message);
            }
        }

        async callSofiaAdvancedAPI(userMessage) {
            this.log('🧠 Enviando para Sofia IA Avançada...');
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
                        sessao_id: this.sessaoId,
                        contexto: this.contextoCompleto,
                        fase_atual: this.faseAtual,
                        persona_detectada: this.personaDetectada,
                        temperatura_lead: this.temperaturaLead
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    this.log('📊 Dados recebidos da Sofia:', data);
                    
                    const reply = data.resposta || 'Resposta recebida!';
                    
                    // Processar análise avançada se disponível
                    if (data.analise) {
                        this.processarAnalise(data.analise);
                    }
                    
                    // Atualizar estatísticas
                    if (data.stats) {
                        this.atualizarEstatisticas(data.stats);
                    }
                    
                    // Simular tempo de digitação baseado no tamanho da resposta
                    const tempoDigitacao = Math.min(reply.length * 30, 3000);
                    
                    setTimeout(() => {
                        this.addMessage(reply, 'sofia');
                        this.hideTyping();
                        
                        // Adicionar analytics se disponível
                        if (data.analise) {
                            this.adicionarAnalyticsMessage(data.analise);
                        }
                        
                        this.log('✅ Resposta da Sofia exibida com sucesso!');
                    }, tempoDigitacao);

                } else {
                    throw new Error(`HTTP ${response.status}`);
                }

            } catch (error) {
                this.log(`❌ Erro na API: ${error.message}`, 'error');
                
                setTimeout(() => {
                    this.addMessage(
                        'Desculpe, tive uma dificuldade técnica. Pode repetir sua mensagem?',
                        'sofia'
                    );
                    this.hideTyping();
                }, 1000);
            }

            // Atualizar contexto
            this.contextoCompleto += `\nUsuário: ${userMessage}`;
            if (this.contextoCompleto.length > 2000) {
                this.contextoCompleto = this.contextoCompleto.slice(-1500);
            }
        }

        processarAnalise(analise) {
            this.log('📊 Processando análise avançada:', analise);
            
            this.analiseAtual = analise;
            this.faseAtual = analise.fase || this.faseAtual;
            this.personaDetectada = analise.persona || this.personaDetectada;
            this.temperaturaLead = analise.temperatura || this.temperaturaLead;
            this.probabilidadeConversao = analise.probabilidade_conversao || 0;
            
            // Atualizar interface visual
            this.atualizarInterfaceAnalytics();
            
            // Verificar se foi venda
            if (analise.venda_realizada) {
                this.celebrarVenda();
            }
        }

        atualizarInterfaceAnalytics() {
            // Atualizar dot de status baseado na temperatura
            const statusDot = document.getElementById('sofiaStatusDot');
            if (statusDot) {
                statusDot.className = `sofia-status-dot ${this.temperaturaLead.toLowerCase().replace('_', '-')}`;
            }
            
            // Atualizar bubble baseado na temperatura
            const bubble = document.getElementById('sofiaBubble');
            if (bubble) {
                bubble.className = 'sofia-bubble show';
                if (this.temperaturaLead === 'QUENTE') {
                    bubble.classList.add('quente');
                } else if (this.temperaturaLead === 'MUITO_QUENTE') {
                    bubble.classList.add('muito-quente');
                }
            }
            
            // Atualizar analytics mini
            const faseEl = document.getElementById('sofiaFase');
            const tempEl = document.getElementById('sofiaTemp');
            const probEl = document.getElementById('sofiaProb');
            const probabilidadeEl = document.getElementById('sofiaProbabilidade');
            
            if (faseEl) faseEl.textContent = this.faseAtual;
            if (tempEl) tempEl.textContent = this.temperaturaLead;
            if (probEl) probEl.textContent = `${this.probabilidadeConversao}%`;
            if (probabilidadeEl) probabilidadeEl.textContent = `${this.probabilidadeConversao}%`;
        }

        celebrarVenda() {
            this.log('🎉 VENDA REALIZADA!');
            
            // Efeito visual de comemoração
            const bubble = document.getElementById('sofiaBubble');
            if (bubble) {
                bubble.style.animation = 'sofia-pulse-urgente 0.3s infinite';
                setTimeout(() => {
                    bubble.style.animation = '';
                }, 3000);
            }
            
            // Confetti effect (opcional)
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }

        addMessage(content, sender = 'sofia') {
            const messages = document.getElementById('sofiaChatMessages');
            if (!messages) return;

            const time = new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const msgDiv = document.createElement('div');
            msgDiv.className = `sofia-message ${sender}`;
            msgDiv.innerHTML = `<div class="sofia-message-content">${this.escapeHtml(content)}</div>`;

            messages.appendChild(msgDiv);
            
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 100);
        }

        adicionarAnalyticsMessage(analise) {
            if (!this.config.debug) return;
            
            const messages = document.getElementById('sofiaChatMessages');
            if (!messages) return;
            
            const analyticsDiv = document.createElement('div');
            analyticsDiv.className = 'sofia-message-analytics';
            analyticsDiv.innerHTML = `
                📊 Fase: ${analise.fase} | Persona: ${analise.persona} | 
                Temp: ${analise.temperatura} | Prob: ${analise.probabilidade_conversao}% |
                Técnicas: ${analise.tecnicas?.join(', ') || 'Nenhuma'}
                ${analise.venda_realizada ? ' | 🎉 VENDA!' : ''}
            `;
            
            messages.appendChild(analyticsDiv);
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        showTyping() {
            this.isTyping = true;
            document.getElementById('sofiaTypingIndicator')?.classList.add('show');
            document.getElementById('sofiaSendButton').disabled = true;
        }

        hideTyping() {
            this.isTyping = false;
            document.getElementById('sofiaTypingIndicator')?.classList.remove('show');
            document.getElementById('sofiaSendButton').disabled = false;
        }

        atualizarStatus(status) {
            const statusEl = document.getElementById('sofiaStatus');
            if (statusEl) {
                statusEl.textContent = status;
            }
        }

        atualizarEstatisticas(stats) {
            this.log(`💰 Stats atualizadas: ${stats.vendas_fechadas} vendas, R$ ${stats.revenue_total}`);
        }

        trackEvent(eventName, properties = {}) {
            if (this.config.analytics) {
                this.log(`📈 Event: ${eventName}`, 'analytics');
                
                // Enviar para analytics externos se disponível
                if (typeof gtag !== 'undefined') {
                    gtag('event', eventName, {
                        event_category: 'sofia_widget_avancado',
                        fase_atual: this.faseAtual,
                        temperatura_lead: this.temperaturaLead,
                        probabilidade_conversao: this.probabilidadeConversao,
                        ...properties
                    });
                }
            }
        }

        // Métodos públicos
       open() {
           if (!this.chatOpen) this.toggleChat();
       }

       close() {
           if (this.chatOpen) this.toggleChat();
       }

       getAnalytics() {
           return {
               sessaoId: this.sessaoId,
               messageCount: this.messageCount,
               faseAtual: this.faseAtual,
               personaDetectada: this.personaDetectada,
               temperaturaLead: this.temperaturaLead,
               probabilidadeConversao: this.probabilidadeConversao,
               analiseCompleta: this.analiseAtual
           };
       }

       enableDebugMode() {
           this.config.debug = true;
           document.getElementById('sofiaProbabilidade').style.display = 'block';
           document.querySelectorAll('.sofia-message-analytics').forEach(el => {
               el.style.display = 'block';
           });
           this.log('🔧 Modo debug ativado');
       }

       disableDebugMode() {
           this.config.debug = false;
           document.getElementById('sofiaProbabilidade').style.display = 'none';
           document.querySelectorAll('.sofia-message-analytics').forEach(el => {
               el.style.display = 'none';
           });
           this.log('🔧 Modo debug desativado');
       }

       forcarFase(novaFase) {
           this.faseAtual = novaFase;
           this.atualizarInterfaceAnalytics();
           this.log(`🎯 Fase forçada para: ${novaFase}`);
       }

       simularVenda() {
           this.celebrarVenda();
           this.log('🎉 Venda simulada!');
       }

       resetarSessao() {
           this.sessaoId = this.gerarSessaoId();
           this.contextoCompleto = "";
           this.messageCount = 0;
           this.faseAtual = "INICIAL";
           this.personaDetectada = null;
           this.temperaturaLead = "FRIO";
           this.probabilidadeConversao = 0;
           this.analiseAtual = null;
           
           this.atualizarInterfaceAnalytics();
           this.log('🔄 Sessão resetada');
       }

       adicionarMensagemProgramatica(mensagem, tipo = 'sofia') {
           this.addMessage(mensagem, tipo);
       }

       obterEstadoCompleto() {
           return {
               config: this.config,
               analytics: this.getAnalytics(),
               contexto: this.contextoCompleto,
               chatAberto: this.chatOpen,
               digitando: this.isTyping,
               timestamp: new Date().toISOString()
           };
       }
   }

   // Sistema de inicialização global avançado
   window.SofiaWidget = {
       instance: null,
       versao: '4.0',
       
       init: function(config = {}) {
           console.log(`🧠 Iniciando Sofia Widget v${this.versao} - IA Avançada...`);
           
           if (this.instance) {
               console.warn('⚠️ Sofia Widget já foi inicializado! Use destroy() primeiro.');
               return this.instance;
           }

           // Aguardar DOM estar pronto
           if (document.readyState === 'loading') {
               document.addEventListener('DOMContentLoaded', () => {
                   this.instance = new SofiaWidgetAvancado(config);
                   window.sofiaWidget = this.instance;
                   console.log('✅ Sofia Widget Avançado carregado após DOM ready!');
               });
           } else {
               this.instance = new SofiaWidgetAvancado(config);
               window.sofiaWidget = this.instance;
               console.log('✅ Sofia Widget Avançado carregado imediatamente!');
           }

           return this.instance;
       },

       // Métodos de controle
       open: function() {
           if (this.instance) this.instance.open();
       },

       close: function() {
           if (this.instance) this.instance.close();
       },

       getAnalytics: function() {
           return this.instance ? this.instance.getAnalytics() : null;
       },

       enableDebug: function() {
           if (this.instance) this.instance.enableDebugMode();
       },

       disableDebug: function() {
           if (this.instance) this.instance.disableDebugMode();
       },

       // Métodos de teste
       test: {
           forcarFase: function(fase) {
               if (window.SofiaWidget.instance) {
                   window.SofiaWidget.instance.forcarFase(fase);
               }
           },
           
           simularVenda: function() {
               if (window.SofiaWidget.instance) {
                   window.SofiaWidget.instance.simularVenda();
               }
           },
           
           resetarSessao: function() {
               if (window.SofiaWidget.instance) {
                   window.SofiaWidget.instance.resetarSessao();
               }
           },

           adicionarMensagem: function(mensagem, tipo = 'sofia') {
               if (window.SofiaWidget.instance) {
                   window.SofiaWidget.instance.adicionarMensagemProgramatica(mensagem, tipo);
               }
           },

           obterEstado: function() {
               return window.SofiaWidget.instance ? 
                   window.SofiaWidget.instance.obterEstadoCompleto() : null;
           }
       },

       // Configurações predefinidas para diferentes cenários
       presets: {
           // Configuração padrão para produção
           producao: {
               primaryColor: '#667eea',
               secondaryColor: '#764ba2',
               position: 'bottom-right',
               showAfterSeconds: 3,
               analytics: true,
               debug: false
           },

           // Configuração para desenvolvimento/teste
           desenvolvimento: {
               primaryColor: '#667eea',
               secondaryColor: '#764ba2',
               position: 'bottom-right',
               showAfterSeconds: 1,
               analytics: true,
               debug: true
           },

           // Configuração minimalista
           minimalista: {
               primaryColor: '#2d3748',
               secondaryColor: '#4a5568',
               position: 'bottom-right',
               showAfterSeconds: 5,
               analytics: false,
               debug: false
           },

           // Configuração para mobile
           mobile: {
               primaryColor: '#667eea',
               secondaryColor: '#764ba2',
               position: 'bottom-right',
               showAfterSeconds: 2,
               analytics: true,
               debug: false
           },

           // Configuração para landing page de alta conversão
           conversao: {
               primaryColor: '#dc3545',
               secondaryColor: '#fd7e14',
               position: 'bottom-right',
               showAfterSeconds: 1,
               analytics: true,
               debug: false,
               welcomeMessage: '🎯 Olá! Vou te ajudar a transformar sua vida com o estoicismo. Qual é seu maior desafio hoje?'
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
               if (window.location.hostname === 'localhost') return 'desenvolvimento';
               return 'producao';
           },

           detectarPagina: function() {
               const url = window.location.href.toLowerCase();
               if (url.includes('landing') || url.includes('vendas')) return 'conversao';
               if (url.includes('sobre') || url.includes('contato')) return 'minimalista';
               return 'producao';
           }
       },

       // Integração com analytics externos
       analytics: {
           track: function(evento, propriedades = {}) {
               const analytics = window.SofiaWidget.getAnalytics();
               
               // Google Analytics 4
               if (typeof gtag !== 'undefined') {
                   gtag('event', evento, {
                       event_category: 'sofia_widget_avancado',
                       event_label: 'user_interaction',
                       fase_conversa: analytics?.faseAtual,
                       temperatura_lead: analytics?.temperaturaLead,
                       probabilidade_conversao: analytics?.probabilidadeConversao,
                       ...propriedades
                   });
               }
               
               // Facebook Pixel
               if (typeof fbq !== 'undefined') {
                   fbq('trackCustom', `SofiaWidget_${evento}`, {
                       fase: analytics?.faseAtual,
                       temperatura: analytics?.temperaturaLead,
                       probabilidade: analytics?.probabilidadeConversao,
                       ...propriedades
                   });
               }

               // Hotjar
               if (typeof hj !== 'undefined') {
                   hj('event', `sofia_${evento}`);
               }

               console.log('📊 Sofia Analytics:', evento, propriedades);
           },

           configurarGoals: function() {
               // Configurar goals automaticamente baseado nas fases
               const fases = ['INICIAL', 'RAPPORT', 'QUALIFICACAO', 'PROBLEMATIZACAO', 'APRESENTACAO', 'OBJECOES', 'FECHAMENTO'];
               
               fases.forEach(fase => {
                   this.track(`goal_fase_${fase.toLowerCase()}`);
               });
           }
       },

       // Sistema de A/B testing
       abTest: {
           variantes: {
               'controle': 'producao',
               'agressiva': 'conversao',
               'sutil': 'minimalista'
           },

           obterVariante: function() {
               // Verificar se já tem variante salva
               let variante = localStorage.getItem('sofia_ab_variante');
               
               if (!variante) {
                   // Distribuir aleatoriamente
                   const variantes = Object.keys(this.variantes);
                   variante = variantes[Math.floor(Math.random() * variantes.length)];
                   localStorage.setItem('sofia_ab_variante', variante);
               }
               
               return variante;
           },

           iniciarComVariante: function() {
               const variante = this.obterVariante();
               const preset = this.variantes[variante];
               
               console.log(`🧪 A/B Test - Variante: ${variante} (${preset})`);
               
               window.SofiaWidget.init(window.SofiaWidget.presets[preset]);
               window.SofiaWidget.analytics.track('ab_test_iniciado', { variante, preset });
               
               return variante;
           }
       },

       destroy: function() {
           if (this.instance) {
               try {
                   // Remover elementos DOM
                   const container = document.querySelector('.sofia-widget-container');
                   if (container) container.remove();
                   
                   // Remover estilos
                   const styles = document.querySelector('style[data-sofia-widget]');
                   if (styles) styles.remove();

                   // Limpar referências
                   this.instance = null;
                   window.sofiaWidget = null;

                   console.log('✅ Sofia Widget removido com sucesso');
               } catch (error) {
                   console.error('❌ Erro ao remover Sofia Widget:', error);
               }
           }
       },

       // Informações da versão
       info: function() {
           console.log(`
🧠 Sofia Widget v${this.versao} - IA Avançada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Funcionalidades:
✅ Integração com Gemini 1.5 Flash
✅ Análise de conversas em tempo real
✅ Classificação automática de leads
✅ Detecção de personas
✅ Cálculo de probabilidade de conversão
✅ Sistema de fases de vendas
✅ Analytics avançado
✅ A/B Testing integrado
✅ Detecção automática de intenção de compra
✅ Link de pagamento automático
✅ Modo debug completo

🎯 Presets disponíveis: ${Object.keys(this.presets).join(', ')}

🧪 Comandos de teste:
- SofiaWidget.enableDebug()
- SofiaWidget.test.forcarFase('FECHAMENTO')
- SofiaWidget.test.simularVenda()
- SofiaWidget.getAnalytics()

📊 Analytics integrado com GA4, Facebook Pixel, Hotjar
           `);
       }
   };

   // Auto-inicialização inteligente
   if (typeof window.sofiaConfig !== 'undefined') {
       console.log('🔧 Usando configuração global personalizada:', window.sofiaConfig);
       window.SofiaWidget.init(window.sofiaConfig);
   } else if (typeof window.sofiaAutoInit !== 'undefined' && window.sofiaAutoInit) {
       // Auto-detecção do melhor preset
       const presetRecomendado = window.SofiaWidget.utils.getRecommendedPreset();
       console.log(`🤖 Auto-inicializando com preset recomendado: ${presetRecomendado}`);
       window.SofiaWidget.init(window.SofiaWidget.presets[presetRecomendado]);
   } else if (typeof window.sofiaABTest !== 'undefined' && window.sofiaABTest) {
       // Inicializar com A/B testing
       window.SofiaWidget.abTest.iniciarComVariante();
   }

})();

// Inicialização padrão se nenhuma config específica foi definida
if (typeof window.sofiaConfig === 'undefined' && 
   typeof window.sofiaAutoInit === 'undefined' && 
   typeof window.sofiaABTest === 'undefined') {
   
   console.log('🚀 Inicializando Sofia Widget com configuração padrão...');
   SofiaWidget.init(SofiaWidget.presets.producao);
}

// Mostrar informações da versão no console
SofiaWidget.info();

// ====================================================================
// EXPORTAÇÃO PARA MÓDULOS (se necessário)
// ====================================================================
if (typeof module !== 'undefined' && module.exports) {
   module.exports = window.SofiaWidget;
}

// ====================================================================
// DOCUMENTAÇÃO DE USO E EXEMPLOS
// ====================================================================

/*

// ============================================
// EXEMPLOS DE USO - SOFIA WIDGET v4.0
// ============================================

// =============================================
// 1. INICIALIZAÇÃO BÁSICA
// =============================================

// Usar preset padrão
SofiaWidget.init();

// Usar preset específico
SofiaWidget.init(SofiaWidget.presets.conversao);

// Configuração personalizada
SofiaWidget.init({
   primaryColor: '#667eea',
   secondaryColor: '#764ba2',
   position: 'bottom-right',
   showAfterSeconds: 2,
   analytics: true,
   debug: true,
   welcomeMessage: 'Olá! Sou a Sofia IA. Como posso transformar sua vida hoje?'
});

// =============================================
// 2. CONTROLE PROGRAMÁTICO
// =============================================

// Abrir/fechar chat
SofiaWidget.open();
SofiaWidget.close();

// Ativar modo debug
SofiaWidget.enableDebug();

// Ver analytics em tempo real
console.log(SofiaWidget.getAnalytics());

// Obter estado completo
console.log(SofiaWidget.test.obterEstado());

// =============================================
// 3. CONFIGURAÇÃO VIA HTML
// =============================================

// Configuração personalizada
<script>
window.sofiaConfig = {
   primaryColor: '#dc3545',
   debug: true,
   welcomeMessage: 'Olá! Pronto para transformar sua vida?'
};
</script>

// Auto-inicialização inteligente
<script>
window.sofiaAutoInit = true; // Detecta automaticamente o melhor preset
</script>

// A/B Testing automático
<script>
window.sofiaABTest = true; // Distribui automaticamente entre variantes
</script>

// =============================================
// 4. COMANDOS DE TESTE E DEBUG
// =============================================

// Ativar modo debug
SofiaWidget.enableDebug();

// Forçar fase específica
SofiaWidget.test.forcarFase('FECHAMENTO');

// Simular venda
SofiaWidget.test.simularVenda();

// Adicionar mensagem programática
SofiaWidget.test.adicionarMensagem('Esta é uma mensagem de teste', 'sofia');

// Resetar sessão
SofiaWidget.test.resetarSessao();

// Ver analytics completo
console.table(SofiaWidget.getAnalytics());

// =============================================
// 5. INTEGRAÇÃO COM ANALYTICS
// =============================================

// Tracking manual de eventos
SofiaWidget.analytics.track('usuario_interessado', {
   pagina: 'landing',
   origem: 'google_ads'
});

// Configurar goals automaticamente
SofiaWidget.analytics.configurarGoals();

// =============================================
// 6. A/B TESTING
// =============================================

// Iniciar teste automático
const variante = SofiaWidget.abTest.iniciarComVariante();
console.log('Variante ativa:', variante);

// Variantes disponíveis:
// - 'controle': Configuração padrão
// - 'agressiva': Foco em conversão
// - 'sutil': Abordagem minimalista

// =============================================
// 7. DETECÇÃO AUTOMÁTICA
// =============================================

// Detectar dispositivo
if (SofiaWidget.utils.isMobile()) {
   SofiaWidget.init(SofiaWidget.presets.mobile);
}

// Detectar tipo de página
const preset = SofiaWidget.utils.detectarPagina();
SofiaWidget.init(SofiaWidget.presets[preset]);

// =============================================
// 8. INTEGRAÇÃO AVANÇADA
// =============================================

// Escutar eventos do widget
document.addEventListener('sofia_fase_mudou', (e) => {
   console.log('Nova fase:', e.detail.fase);
   console.log('Probabilidade:', e.detail.probabilidade);
});

// Integração com outros sistemas
function integrarComCRM() {
   const analytics = SofiaWidget.getAnalytics();
   
   if (analytics.temperaturaLead === 'MUITO_QUENTE') {
       // Notificar vendedor
       enviarNotificacaoVendedor(analytics);
   }
}

// =============================================
// 9. MONITORAMENTO E MÉTRICAS
// =============================================

// Dashboard em tempo real
setInterval(() => {
   const estado = SofiaWidget.test.obterEstado();
   console.log('Estado atual:', estado.analytics);
}, 30000);

// Alertas baseados em performance
function configurarAlertas() {
   const analytics = SofiaWidget.getAnalytics();
   
   if (analytics.probabilidadeConversao > 70) {
       console.log('🔥 Lead muito quente detectado!');
       // Trigger para ação imediata
   }
}

// =============================================
// 10. PERSONALIZAÇÃO AVANÇADA
// =============================================

// CSS personalizado
<style>
.sofia-bubble.muito-quente {
   animation: pulse-urgente 0.3s infinite !important;
   box-shadow: 0 0 30px rgba(255, 0, 0, 0.8) !important;
}

.sofia-chat-header {
   background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
}
</style>

// JavaScript personalizado
window.addEventListener('load', () => {
   // Configuração específica baseada no usuário
   const userType = detectUserType();
   const config = getConfigForUserType(userType);
   
   SofiaWidget.init(config);
});

*/
