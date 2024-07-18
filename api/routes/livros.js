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
Object.defineProperty(exports, "__esModule", { value: true });
const verificaToken_1 = require("../middewares/verificaToken");
const client_1 = require("@prisma/client");
const express_1 = require("express");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        prisma.$use((params, next) => __awaiter(this, void 0, void 0, function* () {
            if (params.model == "Livro") {
                if (params.action == "delete") {
                    params.action = "update";
                    params.args["data"] = { deleted: true };
                }
            }
            return next(params);
        }));
    });
}
main();
const router = (0, express_1.Router)();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const livros = yield prisma.livro.findMany({
            where: { deleted: false },
        });
        return res.status(200).json(livros);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}));
router.post("/", verificaToken_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { titulo, autor, paginas, usuarioId, preco } = req.body;
    const { userLogadoId } = req;
    if (!titulo || !autor || !paginas || !usuarioId || !preco)
        return res.status(400).json({
            erro: "Informe titulo, autor, paginas, usuarioId, preco, genero e emprestado",
        });
    try {
        const livro = yield prisma.livro.create({
            data: {
                titulo,
                autor,
                paginas,
                preco,
                usuario: { connect: { id: usuarioId } },
            },
        });
        yield prisma.log.create({
            data: {
                descricao: "Livro criado",
                complemento: `Livro ${titulo} criado pelo usuário ${userLogadoId}`,
                usuario: { connect: { id: userLogadoId } },
            },
        });
        return res.status(201).json(livro);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}));
router.delete("/:id", verificaToken_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const livro = yield prisma.livro.delete({
            where: { id: Number(id) },
        });
        return res.status(200).json(livro);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}));
router.put("/:id", verificaToken_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { titulo, autor, paginas, preco, genero, emprestado, usuarioId } = req.body;
    if (!titulo || !autor || !paginas || !preco || !usuarioId)
        return res.status(400).json({
            erro: "Informe titulo, autor, paginas, preco, genero e usuarioId",
        });
    try {
        const livro = yield prisma.livro.update({
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
        });
        yield prisma.log.create({
            data: {
                descricao: "Livro atualizado",
                complemento: `Livro ${titulo} atualizado`,
                usuario: { connect: { id: usuarioId } },
            },
        });
        return res.status(200).json(livro);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}));
exports.default = router;
