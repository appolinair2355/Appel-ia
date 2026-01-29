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
            return res.status(400).json({ error: 'Message requis' });
        }

        const apiKey = process.env.APIFREELLM_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Clé API non configurée' });
        }

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

        res.json(response.data);
        
    } catch (error) {
        console.error('Erreur API:', error.response?.data || error.message);
        
        if (error.response?.status === 429) {
            return res.status(429).json({ 
                error: 'Limite de débit atteinte. Veuillez patienter 5 secondes.' 
            });
        }
        
        if (error.response?.status === 401) {
            return res.status(401).json({ 
                error: 'Clé API invalide' 
            });
        }
        
        res.status(500).json({ 
            error: 'Erreur lors de la communication avec l\'API' 
        });
    }
});

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Koussossou AI démarré sur le port ${PORT}`);
});
  
