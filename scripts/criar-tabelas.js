// Cria as tabelas no Neon: npm run db:setup  (precisa do DATABASE_URL no .env)
const fs = require('fs')
const path = require('path')
try { process.loadEnvFile(path.join(__dirname, '..', '.env')) } catch { }
const { neon } = require('@neondatabase/serverless')

async function main() {
    if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL no .env')
    const sql = neon(process.env.DATABASE_URL)
    const script = fs.readFileSync(path.join(__dirname, '..', 'Quantum_db.SQL'), 'utf8')
    const comandos = script.split(';').map(c => c.trim()).filter(Boolean)
    for (const comando of comandos) await sql.query(comando)

    const categorias = ['Eletronicos', 'Biblioteca', 'Moveis', 'Roupas']
    for (const descricao of categorias) {
        await sql.query('INSERT INTO categoria (descricao) VALUES ($1)', [descricao])
    }
    console.log('Tabelas criadas e categorias de exemplo inseridas.')
}
main().catch(e => { console.error(e.message); process.exit(1) })
