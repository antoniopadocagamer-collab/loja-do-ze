// Este arquivo roda no NAVEGADOR. Ele não fala com o Neon:
// só chama a rota /api/categorias (função serverless na Vercel / server.js local).

const lista = document.getElementById('lista-categorias')
const formulario = document.getElementById('form-categoria')
const campoDescricao = document.getElementById('descricao')
const mensagem = document.getElementById('mensagem')

let categorias = []
let idEmEdicao = null

function mostrarMensagem(texto, tipo = 'sucesso') {
    mensagem.textContent = texto
    mensagem.className = `mensagem-${tipo}`
}

async function chamarApi(url, opcoes) {
    const resposta = await fetch(url, opcoes)
    let dados = null
    try { dados = await resposta.json() } catch { /* resposta sem JSON */ }
    if (!resposta.ok) throw new Error((dados && dados.erro) || `Erro HTTP ${resposta.status}`)
    return dados
}

async function carregarCategorias() {
    lista.innerHTML = '<li class="lista-vazia">Carregando...</li>'
    try {
        categorias = await chamarApi('/api/categorias')
        renderizarLista()
    } catch (erro) {
        lista.innerHTML = ''
        mostrarMensagem(`Erro: ${erro.message}`, 'erro')
    }
}

function renderizarLista() {
    lista.innerHTML = ''
    if (categorias.length === 0) {
        lista.innerHTML = '<li class="lista-vazia">Nenhuma categoria cadastrada!</li>'
        return
    }
    for (const categoria of categorias) {
        lista.appendChild(
            categoria.id_categoria === idEmEdicao
                ? criarItemEdicao(categoria)
                : criarItemVisualizacao(categoria)
        )
    }
}

function criarItemVisualizacao(categoria) {
    const item = document.createElement('li')

    const info = document.createElement('span')
    const id = document.createElement('span')
    id.className = 'categoria-id'
    id.textContent = `#${categoria.id_categoria}`
    info.append(id, categoria.descricao)

    const btnEditar = document.createElement('button')
    btnEditar.textContent = 'Editar'
    btnEditar.className = 'btn-editar'
    btnEditar.addEventListener('click', () => {
        idEmEdicao = categoria.id_categoria
        renderizarLista()
    })

    const btnExcluir = document.createElement('button')
    btnExcluir.textContent = 'Excluir'
    btnExcluir.className = 'btn-excluir'
    btnExcluir.addEventListener('click', () => excluirCategoria(categoria))

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'
    acoes.append(btnEditar, btnExcluir)

    item.append(info, acoes)
    return item
}

function criarItemEdicao(categoria) {
    const item = document.createElement('li')

    const input = document.createElement('input')
    input.type = 'text'
    input.value = categoria.descricao
    input.className = 'input-edicao'

    const btnSalvar = document.createElement('button')
    btnSalvar.textContent = 'Salvar'
    btnSalvar.className = 'btn-salvar'
    btnSalvar.addEventListener('click', () => salvarEdicao(categoria, input.value))

    const btnCancelar = document.createElement('button')
    btnCancelar.textContent = 'Cancelar'
    btnCancelar.className = 'btn-cancelar'
    btnCancelar.addEventListener('click', () => {
        idEmEdicao = null
        renderizarLista()
    })

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'
    acoes.append(btnSalvar, btnCancelar)

    item.append(input, acoes)
    setTimeout(() => input.focus(), 0)
    return item
}

async function salvarEdicao(categoria, novaDescricao) {
    try {
        await chamarApi(`/api/categorias?id=${categoria.id_categoria}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: novaDescricao })
        })
        idEmEdicao = null
        mostrarMensagem('Categoria atualizada!')
        await carregarCategorias()
    } catch (erro) {
        mostrarMensagem(`Erro: ${erro.message}`, 'erro')
    }
}

async function excluirCategoria(categoria) {
    if (!confirm(`Excluir a categoria "${categoria.descricao}"?`)) return
    try {
        await chamarApi(`/api/categorias?id=${categoria.id_categoria}`, { method: 'DELETE' })
        mostrarMensagem('Categoria excluída!')
        await carregarCategorias()
    } catch (erro) {
        mostrarMensagem(`Erro: ${erro.message}`, 'erro')
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    try {
        const dados = await chamarApi('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: campoDescricao.value })
        })
        mostrarMensagem(`Categoria "${dados.descricao}" cadastrada!`)
        campoDescricao.value = ''
        await carregarCategorias()
    } catch (erro) {
        mostrarMensagem(`Erro: ${erro.message}`, 'erro')
    }
})

carregarCategorias()
