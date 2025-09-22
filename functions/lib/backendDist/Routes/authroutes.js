"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authcontroller_1 = require("../Controller/authcontroller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/login', authcontroller_1.login);
router.get('/admins', auth_1.auth, authcontroller_1.listAdmins);
router.get('/admins/:id', auth_1.auth, authcontroller_1.getAdminById);
exports.default = router;
