"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, senha } = req.body;
    const mensaPadrao = "Login ou senha incorretos";
    if (!email || !senha)
        return res.status(400).json({ erro: mensaPadrao });
    try {
        const usuario = yield prisma.usuario.findFirst({ where: { email } });
        if (usuario == null)
            return res.status(400).json({ erro: mensaPadrao });
        if (bcrypt_1.default.compareSync(senha, usuario.senha)) {
            const token = jsonwebtoken_1.default.sign({
                userLogadoId: usuario.id,
                userLogadoNome: usuario.nome,
            }, process.env.JWT_KEY, { expiresIn: "1h" });
            return res.status(200).json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                token,
            });
        }
        else {
            yield prisma.log.create({
                data: {
                    descricao: "Tentativa de Acesso Inválida",
                    complemento: `Funcionário: ${usuario.email}`,
                    usuarioId: usuario.id,
                },
            });
            return res.status(400).json({ erro: mensaPadrao });
        }
    }
    catch (error) {
        return res.status(400).json(error);
    }
}));
exports.default = router;
