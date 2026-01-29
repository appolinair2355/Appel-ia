// Éléments DOM
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesList = document.getElementById('messagesList');
const progressContainer = document.getElementById('progressContainer');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const saveSettings = document.getElementById('saveSettings');
const apiKeyInput = document.getElementById('apiKeyInput');

let isLoading = false;

// Charger la clé API sauvegardée
const savedKey = localStorage.getItem('apifreellm_key');
if (savedKey) {
    apiKeyInput.value = savedKey;
}

// Vérifier la santé du serveur au démarrage
checkServerHealth();

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

saveSettings.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('apifreellm_key', key);
        settingsModal.style.display = 'none';
        showNotification('Clé API sauvegardée localement !');
    }
});

// Fermer le modal en cliquant à l'extérieur
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

async function checkServerHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('🩺 Santé du serveur:', data);
        
        if (!data.apiKeyConfigured) {
            showNotification('⚠️ Clé API non configurée sur le serveur', 'warning');
        }
    } catch (error) {
        console.error('❌ Impossible de contacter le serveur:', error);
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isLoading) return;

    // Masquer l'écran de bienvenue et afficher le chat
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'flex';

    // Ajouter le message utilisateur
    addMessage(message, 'user');
    messageInput.value = '';
    
    // Activer le chargement
    setLoading(true);

    try {
        console.log('📤 Envoi de la requête au serveur...');
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                model: 'apifreellm'
            })
        });

        const data = await response.json();
        console.log('📥 Réponse du serveur:', data);

        if (!response.ok || !data.success) {
            // Construire un message d'erreur détaillé
            let errorMsg = data.message || data.error || 'Erreur inconnue';
            
            if (data.status === 401) {
                errorMsg += '\n\n💡 Solution: Vérifiez que la variable d\'environnement APIFREELLM_KEY est bien configurée dans Render.com avec votre clé API valide.';
            } else if (data.status === 429) {
                errorMsg += '\n\n⏳ Attendez 5 secondes avant de réessayer.';
            } else if (!data.apiKeyConfigured) {
                errorMsg += '\n\n🔧 Le serveur n\'a pas de clé API configurée.';
            }
            
            throw new Error(errorMsg);
        }

        // Ajouter la réponse du bot
        if (data.response) {
            addMessage(data.response, 'bot');
        } else {
            throw new Error('Réponse vide de l\'API');
        }

    } catch (error) {
        console.error('❌ Erreur complète:', error);
        addMessage(`❌ **Erreur:**\n${error.message}`, 'bot');
    } finally {
        setLoading(false);
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const header = document.createElement('div');
    header.className = 'message-header';
    header.textContent = sender === 'user' ? 'Vous' : 'Koussossou';
    
    const content = document.createElement('div');
    // Gérer les sauts de ligne
    content.innerHTML = text.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(header);
    messageDiv.appendChild(content);
    messagesList.appendChild(messageDiv);
    
    // Scroll vers le bas
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function setLoading(loading) {
    isLoading = loading;
    
    if (loading) {
        progressContainer.style.display = 'flex';
        sendBtn.classList.add('loading');
        sendBtn.innerHTML = '<span style="font-size: 18px;">⏳</span>';
        messageInput.disabled = true;
    } else {
        progressContainer.style.display = 'none';
        sendBtn.classList.remove('loading');
        sendBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
        `;
        messageInput.disabled = false;
        messageInput.focus();
    }
}

function showNotification(text, type = 'success') {
    const notif = document.createElement('div');
    const bgColor = type === 'warning' ? '#f59e0b' : '#10b981';
    
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 500;
        z-index: 3000;
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(-50%) translateY(-20px)';
        notif.style.transition = 'all 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
}
