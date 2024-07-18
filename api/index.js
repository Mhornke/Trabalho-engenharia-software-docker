"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const livros_1 = __importDefault(require("./routes/livros"));
const login_1 = __importDefault(require("./routes/login"));
const logs_1 = __importDefault(require("./routes/logs"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/usuarios", usuarios_1.default);
app.use("/livros", livros_1.default);
app.use("/login", login_1.default);
app.use("/logs", logs_1.default);
app.get("/", (req, res) => res.send("API de Biblioteca, Aluisio Pereira"));
app.listen(port, () => console.log(`Servidor rodando na porta: ${port}`));
