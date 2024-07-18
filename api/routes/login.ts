import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()
const router = Router()

router.post("/", async (req, res) => {
  const { email, senha } = req.body

  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) return res.status(400).json({ erro: mensaPadrao })

  try {
    const usuario = await prisma.usuario.findFirst({ where: { email } })

    if (usuario == null) return res.status(400).json({ erro: mensaPadrao })

    if (bcrypt.compareSync(senha, usuario.senha)) {
      const token = jwt.sign(
        {
          userLogadoId: usuario.id,
          userLogadoNome: usuario.nome,
        },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      )

      return res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        token,
      })
    } else {
      await prisma.log.create({
        data: {
          descricao: "Tentativa de Acesso Inválida",
          complemento: `Funcionário: ${usuario.email}`,
          usuarioId: usuario.id,
        },
      })

      return res.status(400).json({ erro: mensaPadrao })
    }
  } catch (error) {
    return res.status(400).json(error)
  }
})

export default router
