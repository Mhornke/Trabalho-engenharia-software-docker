import { verificaToken } from "../middewares/verificaToken"
import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()

async function main() {
  prisma.$use(async (params, next) => {
    if (params.model == "Livro") {
      if (params.action == "delete") {
        params.action = "update"
        params.args["data"] = { deleted: true }
      }
    }
    return next(params)
  })
}

main()

const router = Router()

router.get("/", async (req, res) => {
  try {
    const livros = await prisma.livro.findMany({
      where: { deleted: false },
    })
    return res.status(200).json(livros)
  } catch (error) {
    return res.status(400).json(error)
  }
})

router.post("/", verificaToken, async (req: any, res) => {
  const { titulo, autor, paginas, usuarioId, preco } = req.body
  const { userLogadoId } = req

  if (!titulo || !autor || !paginas || !usuarioId || !preco)
    return res.status(400).json({
      erro: "Informe titulo, autor, paginas, usuarioId, preco, genero e emprestado",
    })

  try {
    const livro = await prisma.livro.create({
      data: {
        titulo,
        autor,
        paginas,
        preco,
        usuario: { connect: { id: usuarioId } },
      },
    })

    await prisma.log.create({
      data: {
        descricao: "Livro criado",
        complemento: `Livro ${titulo} criado pelo usuário ${userLogadoId}`,
        usuario: { connect: { id: userLogadoId } },
      },
    })

    return res.status(201).json(livro)
  } catch (error) {
    return res.status(400).json(error)
  }
})

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const livro = await prisma.livro.delete({
      where: { id: Number(id) },
    })

    return res.status(200).json(livro)
  } catch (error) {
    return res.status(400).json(error)
  }
})

router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params
  const { titulo, autor, paginas, preco, genero, emprestado, usuarioId } =
    req.body

  if (!titulo || !autor || !paginas || !preco || !usuarioId)
    return res.status(400).json({
      erro: "Informe titulo, autor, paginas, preco, genero e usuarioId",
    })

  try {
    const livro = await prisma.livro.update({
      where: { id: Number(id) },
      data: {
        titulo,
        autor,
        paginas,
        preco,
        genero,
        emprestado,
        usuario: { connect: { id: usuarioId } },
      },
    })

    await prisma.log.create({
      data: {
        descricao: "Livro atualizado",
        complemento: `Livro ${titulo} atualizado`,
        usuario: { connect: { id: usuarioId } },
      },
    })

    return res.status(200).json(livro)
  } catch (error) {
    return res.status(400).json(error)
  }
})

export default router
