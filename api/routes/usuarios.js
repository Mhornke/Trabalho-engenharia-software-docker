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
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield prisma.usuario.findMany();
        return res.status(200).json(usuarios);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}));
function validaSenha(senha) {
    const mensa = [];
    if (senha.length < 8) {
        mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres");
    }
    let pequenas = 0;
    let grandes = 0;
    let numeros = 0;
    let simbolos = 0;
    for (const letra of senha) {
        if (/[a-z]/.test(letra))
            pequenas++;
        else if (/[A-Z]/.test(letra))
            grandes++;
        else if (/[0-9]/.test(letra))
            numeros++;
        else
            simbolos++;
    }
    if (pequenas == 0 || grandes == 0 || numeros == 0 || simbolos == 0) {
        mensa.push("Erro... senha deve possuir letras minúsculas, maiúsculas, números e símbolos");
    }
    return mensa;
}
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha)
        return res.status(400).json({ erro: "Informe nome, email e senha" });
    const usuarioExiste = yield prisma.usuario.findFirst({ where: { email } });
    if (usuarioExiste)
        return res
            .status(400)
            .json({ erro: "Usuário já cadastrado com este email" });
    const erros = validaSenha(senha);
    if (erros.length > 0)
        return res.status(400).json({ erro: erros.join("; ") });
    const salt = bcrypt_1.default.genSaltSync(12);
    const hash = bcrypt_1.default.hashSync(senha, salt);
    try {
        const usuario = yield prisma.usuario.create({
            data: { nome, email, senha: hash },
        });
        return res.status(201).json(usuario);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}));
// Implementar rotina de alteração de senha do usuário, validando a senha atual e criptografando a nova senha.
router.put("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, senhaAtual, novaSenha } = req.body;
    if (!email || !senhaAtual || !novaSenha)
        return res
            .status(400)
            .json({ erro: "Informe email, senhaAtual e novaSenha" });
    const usuario = yield prisma.usuario.findFirst({ where: { email } });
    if (!usuario)
        return res.status(400).json({ erro: "Usuário não encontrado" });
    if (!bcrypt_1.default.compareSync(senhaAtual, usuario.senha))
        return res.status(400).json({ erro: "Senha atual inválida" });
    const erros = validaSenha(novaSenha);
    if (erros.length > 0)
        return res.status(400).json({ erro: erros.join("; ") });
    const salt = bcrypt_1.default.genSaltSync(12);
    const hash = bcrypt_1.default.hashSync(novaSenha, salt);
    try {
        const returnUsuario = yield prisma.usuario.update({
            where: { id: usuario.id },
            data: { senha: hash },
        });
        return res.status(200).json(returnUsuario);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}));
exports.default = router;
