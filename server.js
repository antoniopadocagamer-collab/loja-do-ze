// Servidor LOCAL (npm start). Na Vercel este arquivo não é usado:
// lá, a pasta public/ vira site estático e api/ vira funções serverless.
const http = require('http')
const fs = require('fs')
const path = require('path')

try { process.loadEnvFile(path.join(__dirname, '.env')) } catch { /* sem .env local */ }

const handlerCategorias = require('./api/categorias')

const PORTA = process.env.PORT || 3000
const PUBLICO = path.join(__dirname, 'public')
const TIPOS = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.ico': 'image/x-icon',
    '.png': 'image/png'
}

function lerCorpo(req) {
    return new Promise((resolve) => {
        let corpo = ''
        req.on('data', p => corpo += p)
        req.on('end', () => {
            try { resolve(JSON.parse(corpo || '{}')) } catch { resolve({}) }
        })
    })
}

const servidor = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)

    if (url.pathname === '/api/categorias') {
        // Adapta req/res para o mesmo formato usado pela Vercel
        req.query = Object.fromEntries(url.searchParams)
        req.body = await lerCorpo(req)
        res.status = (codigo) => { res.statusCode = codigo; return res }
        res.json = (dados) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(dados))
        }
        return handlerCategorias(req, res)
    }

    const nome = url.pathname === '/' ? '/index.html' : url.pathname
    const arquivo = path.normalize(path.join(PUBLICO, nome))
    if (!arquivo.startsWith(PUBLICO) || !fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        return res.end('Página não encontrada')
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' })
    fs.createReadStream(arquivo).pipe(res)
})

servidor.listen(PORTA, () => {
    console.log(`Loja do Zé rodando em http://localhost:${PORTA}`)
})
