require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ================================
// CONFIG API
// ================================
const API_KEY = process.env.APIFREELLM_KEY;

if (!API_KEY) {
    console.error('❌ ERREUR: Variable APIFREELLM_KEY non définie!');
    console.error('💡 Ajoute-la dans Render ou dans .env');
    console.error('   APIFREELLM_KEY=apf_xxxxxxxxx');
}

// ================================
// MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ================================
// ROUTE CHAT API
// ================================
app.post('/api/chat', async (req, res) => {
    try {
        const { message, model } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message requis'
            });
        }

        if (!API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Clé API non configurée sur le serveur'
            });
        }

        console.log('➡️ Requête envoyée à ApiFreeLLM');

        // ✅ CORRECTION ICI : Bonne URL et bon format
        const response = await axios.post(
            'https://apifreellm.com/api/v1/chat',  // ✅ URL correcte
            {
                message: message,  // ✅ Paramètre "message" (pas "messages")
                model: model || 'apifreellm'  // ✅ Modèle par défaut
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`  // ✅ Bearer token
                },
                timeout: 30000
            }
        );

        console.log('✅ Réponse ApiFreeLLM reçue');

        // ✅ La réponse contient directement "response"
        res.json({
            success: true,
            reply: response.data.response,  // ✅ Champ "response" de l'API
            tier: response.data.tier,
            features: response.data.features
        });

    } catch (error) {
        console.error('❌ Erreur ApiFreeLLM:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Limite de débit — veuillez patienter 5 secondes et réessayer.'
            });
        }

        if (error.response?.status === 401) {
            return res.status(401).json({
                success: false,
                error: 'Clé API invalide'
            });
        }

        if (error.response?.status === 400) {
            return res.status(400).json({
                success: false,
                error: 'Requête incorrecte - Paramètres manquants'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erreur lors de la communication avec l\'API',
            details: error.message
        });
    }
});

// ================================
// PAGE PRINCIPALE
// ================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================================
// HEALTH CHECK
// ================================
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        apiConfigured: !!API_KEY,
        timestamp: new Date().toISOString()
    });
});

// ================================
// START SERVER
// ================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🔑 Clé API configurée: ${API_KEY ? 'OUI' : 'NON'}`);
    if (API_KEY) {
        console.log(`   Clé: ${API_KEY.substring(0, 10)}...`);
    }
});
