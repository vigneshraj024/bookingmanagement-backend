"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminById = exports.listAdmins = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const supabase_1 = require("../lib/supabase");
require("dotenv/config");
const login = async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase_1.supabase.from('Admins').select('Id, Name, Email, PasswordHash').eq('Email', email).maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, data.PasswordHash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ sub: data.Id, email: data.Email, name: data.Name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
};
exports.login = login;
const listAdmins = async (_req, res) => {
    const { data, error } = await supabase_1.supabase
        .from('Admins')
        .select('Id, Name, Email, CreatedAt')
        .order('Id', { ascending: true });
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
};
exports.listAdmins = listAdmins;
const getAdminById = async (req, res) => {
    const id = Number(req.params.id);
    const { data, error } = await supabase_1.supabase
        .from('Admins')
        .select('Id, Name, Email, CreatedAt')
        .eq('Id', id)
        .maybeSingle();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ error: 'Admin not found' });
    res.json(data);
};
exports.getAdminById = getAdminById;
