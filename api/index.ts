import usuariosRoutes from "./routes/usuarios"
import livrosRoutes from "./routes/livros"
import loginRoutes from "./routes/login"
import logsRoutes from "./routes/logs"
import express from "express"
import cors from "cors"

const app = express()
const port = 3000
app.use(express.json())
app.use(cors())
app.use("/usuarios", usuariosRoutes)
app.use("/livros", livrosRoutes)
app.use("/login", loginRoutes)
app.use("/logs", logsRoutes)

app.get("/", (req, res) => res.send("API de Biblioteca, Aluisio Pereira"))

app.listen(port, () => console.log(`Servidor rodando na porta: ${port}`))
