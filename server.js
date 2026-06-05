const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let velas = [];

// POST - recebe nova vela da extensão
app.post('/api/nova-vela', (req, res) => {
    const { painel, multiplicador, rodada, timestamp, soma, fonte } = req.body;
    
    const novaVela = {
        id: Date.now(),
        painel: painel || 1,
        multiplicador: parseFloat(multiplicador),
        rodada: rodada || String(Date.now()),
        timestamp: timestamp || new Date().toLocaleTimeString('pt-BR'),
        soma: soma || 0,
        fonte: fonte || 'extensao',
        created_at: new Date().toISOString()
    };
    
    velas.push(novaVela);
    
    // Mantém só as últimas 2000 velas
    if (velas.length > 2000) velas.shift();
    
    console.log(`📊 Vela recebida: ${novaVela.multiplicador}x - Painel ${novaVela.painel} - Rodada ${novaVela.rodada}`);
    res.json({ ok: true, id: novaVela.id, total: velas.length });
});

// GET - consulta velas
app.get('/api/velas', (req, res) => {
    const { painel, limit = 100 } = req.query;
    let resultado = [...velas];
    
    if (painel) {
        resultado = resultado.filter(v => v.painel == painel);
    }
    
    resultado = resultado.slice(-parseInt(limit));
    res.json(resultado);
});

// GET - status do servidor
app.get('/api/status', (req, res) => {
    const ultimaVela = velas.length > 0 ? velas[velas.length - 1] : null;
    res.json({ 
        status: 'online',
        uptime: process.uptime(),
        total_velas: velas.length,
        ultima_vela: ultimaVela,
        versao: '1.0.0'
    });
});

// GET - estatísticas rápidas
app.get('/api/stats', (req, res) => {
    const ultimas100 = velas.slice(-100);
    const acima10x = ultimas100.filter(v => v.multiplicador >= 10).length;
    const acima50x = ultimas100.filter(v => v.multiplicador >= 50).length;
    
    res.json({
        total_velas: velas.length,
        ultimas100_velas: ultimas100.length,
        acima_10x: acima10x,
        acima_50x: acima50x,
        taxa_10x: (acima10x / Math.max(1, ultimas100.length) * 100).toFixed(1) + '%'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Aviator Trader rodando na porta ${PORT}`);
    console.log(`📍 Endpoints disponiveis:`);
    console.log(`   GET  /api/status`);
    console.log(`   GET  /api/velas?painel=1&limit=100`);
    console.log(`   GET  /api/stats`);
    console.log(`   POST /api/nova-vela`);
});
