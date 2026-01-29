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
        showNotification('Clé API sauvegardée !');
    }
});

// Fermer le modal en cliquant à l'extérieur
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

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
        const apiKey = localStorage.getItem('apifreellm_key') || '';
        
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

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la requête');
        }

        // Ajouter la réponse du bot
        if (data.success) {
            addMessage(data.response, 'bot');
        } else {
            throw new Error('Réponse invalide');
        }

    } catch (error) {
        addMessage(`❌ Erreur : ${error.message}`, 'bot');
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
    content.textContent = text;
    
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
        sendBtn.innerHTML = '<span class="loader">⏳</span>';
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

function showNotification(text) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--success);
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 500;
        z-index: 3000;
        animation: slideDown 0.3s ease;
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}
