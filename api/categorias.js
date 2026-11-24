// Função serverless da Vercel: /api/categorias
//   GET                       -> lista categorias
//   POST   {descricao}        -> cria
//   PUT    ?id=1 {descricao}  -> edita
//   DELETE ?id=1              -> exclui
const { executarQuery } = require('../lib/db')

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const linhas = await executarQuery('SELECT * FROM categoria ORDER BY id_categoria')
            if (linhas === null) return res.status(500).json({ erro: 'Falha ao consultar o banco' })
            return res.status(200).json(linhas)
        }

        if (req.method === 'POST') {
            const descricao = String((req.body && req.body.descricao) || '').trim()
            if (!descricao) return res.status(400).json({ erro: 'Informe a descrição' })

            const linhas = await executarQuery(
                'INSERT INTO categoria (descricao) VALUES ($1) RETURNING *',
                [descricao]
            )
            if (linhas === null) return res.status(500).json({ erro: 'Falha ao inserir no banco' })
            return res.status(201).json(linhas[0])
        }

        if (req.method === 'PUT') {
            const id = Number(req.query && req.query.id)
            const descricao = String((req.body && req.body.descricao) || '').trim()
            if (!Number.isInteger(id)) return res.status(400).json({ erro: 'ID inválido' })
            if (!descricao) return res.status(400).json({ erro: 'Informe a descrição' })

            const linhas = await executarQuery(
                'UPDATE categoria SET descricao = $1 WHERE id_categoria = $2 RETURNING *',
                [descricao, id]
            )
            if (linhas === null) return res.status(500).json({ erro: 'Falha ao atualizar no banco' })
            if (linhas.length === 0) return res.status(404).json({ erro: 'Categoria não encontrada' })
            return res.status(200).json(linhas[0])
        }

        if (req.method === 'DELETE') {
            const id = Number(req.query && req.query.id)
            if (!Number.isInteger(id)) return res.status(400).json({ erro: 'ID inválido' })

            const linhas = await executarQuery(
                'DELETE FROM categoria WHERE id_categoria = $1 RETURNING *',
                [id]
            )
            if (linhas === null) return res.status(500).json({ erro: 'Falha ao excluir no banco' })
            if (linhas.length === 0) return res.status(404).json({ erro: 'Categoria não encontrada' })
            return res.status(200).json(linhas[0])
        }

        res.setHeader('Allow', 'GET, POST, PUT, DELETE')
        return res.status(405).json({ erro: 'Método não permitido' })
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ erro: 'Erro interno do servidor' })
    }
}
