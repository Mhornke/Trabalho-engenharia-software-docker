import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany()
    return res.status(200).json(usuarios)
  } catch (error) {
    return res.status(400).json(error)
  }
})

function validaSenha(senha: string) {
  const mensa: string[] = []

  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0

  for (const letra of senha) {
    if (/[a-z]/.test(letra)) pequenas++
    else if (/[A-Z]/.test(letra)) grandes++
    else if (/[0-9]/.test(letra)) numeros++
    else simbolos++
  }

  if (pequenas == 0 || grandes == 0 || numeros == 0 || simbolos == 0) {
    mensa.push(
      "Erro... senha deve possuir letras minúsculas, maiúsculas, números e símbolos"
    )
  }

  return mensa
}

router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body

  if (!nome || !email || !senha)
    return res.status(400).json({ erro: "Informe nome, email e senha" })

  const usuarioExiste = await prisma.usuario.findFirst({ where: { email } })
  if (usuarioExiste)
    return res
      .status(400)
      .json({ erro: "Usuário já cadastrado com este email" })

  const erros = validaSenha(senha)
  if (erros.length > 0) return res.status(400).json({ erro: erros.join("; ") })

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(senha, salt)

  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash },
    })
    return res.status(201).json(usuario)
  } catch (error) {
    return res.status(400).json(error)
  }
})

// Implementar rotina de alteração de senha do usuário, validando a senha atual e criptografando a nova senha.

router.put("/", async (req, res) => {
  const { email, senhaAtual, novaSenha } = req.body

  if (!email || !senhaAtual || !novaSenha)
    return res
      .status(400)
      .json({ erro: "Informe email, senhaAtual e novaSenha" })

  const usuario = await prisma.usuario.findFirst({ where: { email } })
  if (!usuario) return res.status(400).json({ erro: "Usuário não encontrado" })

  if (!bcrypt.compareSync(senhaAtual, usuario.senha))
    return res.status(400).json({ erro: "Senha atual inválida" })

  const erros = validaSenha(novaSenha)
  if (erros.length > 0) return res.status(400).json({ erro: erros.join("; ") })

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(novaSenha, salt)

  try {
    const returnUsuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: hash },
    })
    return res.status(200).json(returnUsuario)
  } catch (error) {
    return res.status(400).json(error)
  }
})

export default router
