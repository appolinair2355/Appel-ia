require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Route API pour chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, model } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false,
                error: 'Message requis',
                details: 'Le champ message est obligatoire dans la requête'
            });
        }

        const apiKey = process.env.APIFREELLM_KEY;
        
        if (!apiKey) {
            console.error('❌ ERREUR: Clé API non configurée dans les variables d\'environnement');
            return res.status(500).json({ 
                success: false,
                error: 'Clé API non configurée',
                details: 'La variable d\'environnement APIFREELLM_KEY n\'est pas définie. Vérifiez votre configuration Render.com'
            });
        }

        console.log('🔑 Clé API trouvée:', apiKey.substring(0, 10) + '...');
        console.log('📤 Envoi de la requête à apifreellm...');
        console.log('📝 Message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

        const response = await axios.post('https://apifreellm.com/api/v1/chat', {
            message: message,
            model: model || 'apifreellm'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            timeout: 30000
        });

        console.log('✅ Réponse reçue:', response.data);
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ ERREUR COMPLÈTE:', error);
        
        // Erreur de réponse de l'API apifreellm
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Data:', error.response.data);
            console.error('📋 Headers:', error.response.headers);
            
            return res.status(error.response.status).json({ 
                success: false,
                error: 'Erreur API apifreellm',
                status: error.response.status,
                details: error.response.data,
                message: getErrorMessage(error.response.status, error.response.data)
            });
        }
        
        // Erreur de connexion
        if (error.request) {
            console.error('🌐 Pas de réponse reçue:', error.request);
            return res.status(503).json({ 
                success: false,
                error: 'Service indisponible',
                details: 'Impossible de contacter l\'API apifreellm. Vérifiez votre connexion internet.'
            });
        }
        
        // Autre erreur
        console.error('⚠️ Erreur interne:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Erreur interne du serveur',
            details: error.message
        });
    }
});

function getErrorMessage(status, data) {
    switch(status) {
        case 429:
            return 'Limite de débit atteinte. Veuillez patienter 5 secondes avant de réessayer.';
        case 401:
            return 'Clé API invalide. Vérifiez votre clé API dans les paramètres.';
        case 400:
            return 'Requête incorrecte: ' + (data?.error || 'Paramètres manquants');
        case 403:
            return 'Accès interdit. Votre clé API n\'a pas les permissions nécessaires.';
        case 404:
            return 'Endpoint non trouvé. L\'API a peut-être changé.';
        case 500:
            return 'Erreur serveur chez apifreellm. Réessayez plus tard.';
        default:
            return `Erreur ${status}: ${JSON.stringify(data)}`;
    }
}

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        apiKeyConfigured: !!process.env.APIFREELLM_KEY,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Koussossou AI démarré sur le port ${PORT}`);
    console.log(`🔧 Clé API configurée: ${process.env.APIFREELLM_KEY ? 'OUI' : 'NON'}`);
    if (process.env.APIFREELLM_KEY) {
        console.log(`🔑 Début de la clé: ${process.env.APIFREELLM_KEY.substring(0, 15)}...`);
    }
});
