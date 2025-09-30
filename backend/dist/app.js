"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const bookingroutes_1 = __importDefault(require("./Routes/bookingroutes"));
const authroutes_1 = __importDefault(require("./Routes/authroutes"));
const auth_1 = require("./middleware/auth");
require("dotenv/config");
exports.app = (0, express_1.default)();
// Security & Middleware
exports.app.use((0, helmet_1.default)());
// Allow all origins in Functions; keep credentials support
exports.app.use((0, cors_1.default)({ origin: true, credentials: true }));
exports.app.use(express_1.default.json());
// Routes
exports.app.use('/api/auth', authroutes_1.default); // Public (login/register)
exports.app.use('/api/bookings', auth_1.auth, bookingroutes_1.default); // Protected (requires login)
exports.app.get('/health', (_req, res) => res.json({ ok: true }));
exports.default = exports.app;
