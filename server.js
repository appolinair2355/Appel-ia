require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ================================
// DEBUG - Affiche toutes les variables
// ================================
console.log('=== DEBUG ENVIRONMENT ===');
console.log('PORT:', process.env.PORT);
console.log('APIFREELLM_KEY existe?:', !!process.env.APIFREELLM_KEY);
console.log('APIFREELLM_KEY valeur:', process.env.APIFREELLM_KEY ? process.env.APIFREELLM_KEY.substring(0, 15) + '...' : 'NON DÉFINIE');
console.log('Toutes les vars:', Object.keys(process.env).filter(k => k.includes('API')));
console.log('========================');

const API_KEY = process.env.APIFREELLM_KEY;

// ... reste du code inchangé
