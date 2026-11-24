// Conexão com o Neon (Postgres). Roda SOMENTE no servidor (Vercel ou server.js local).
// A URL do banco vem da variável de ambiente DATABASE_URL — nunca escreva a senha no código.
const { neon } = require('@neondatabase/serverless')

let sql = null

function obterConexao() {
    if (!process.env.DATABASE_URL) {
        throw new Error('Variável de ambiente DATABASE_URL não configurada')
    }
    if (!sql) sql = neon(process.env.DATABASE_URL)
    return sql
}

// Executa uma query com parâmetros ($1, $2...) e devolve o array de linhas.
// Em caso de erro, devolve null (e registra no log do servidor).
async function executarQuery(querySQL, parametros = []) {
    try {
        return await obterConexao().query(querySQL, parametros)
    } catch (erro) {
        console.error('Falha ao comunicar com o banco de dados:', erro.message)
        return null
    }
}

module.exports = { executarQuery }
