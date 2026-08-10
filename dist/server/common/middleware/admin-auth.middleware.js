"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthMiddleware = void 0;
exports.generateAdminToken = generateAdminToken;
exports.verifyAdminToken = verifyAdminToken;
exports.getAdminPassword = getAdminPassword;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const CryptoJS = tslib_1.__importStar(require("crypto-js"));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'training-order-secret';
const TOKEN_EXPIRE_HOURS = 24;
function generateAdminToken() {
    const expiresAt = Date.now() + TOKEN_EXPIRE_HOURS * 60 * 60 * 1000;
    const payload = JSON.stringify({ expiresAt, role: 'admin' });
    const signature = CryptoJS.HmacSHA256(payload, TOKEN_SECRET).toString();
    const tokenData = `${payload}.${signature}`;
    return Buffer.from(tokenData).toString('base64');
}
function verifyAdminToken(token) {
    try {
        const tokenData = Buffer.from(token, 'base64').toString('utf-8');
        const [payloadStr, signature] = tokenData.split('.');
        if (!payloadStr || !signature)
            return false;
        const expectedSignature = CryptoJS.HmacSHA256(payloadStr, TOKEN_SECRET).toString();
        if (signature !== expectedSignature)
            return false;
        const payload = JSON.parse(payloadStr);
        if (!payload.expiresAt || payload.role !== 'admin')
            return false;
        if (Date.now() > payload.expiresAt)
            return false;
        return true;
    }
    catch {
        return false;
    }
}
function getAdminPassword() {
    return ADMIN_PASSWORD;
}
let AdminAuthMiddleware = class AdminAuthMiddleware {
    use(req, res, next) {
        const token = req.headers['x-admin-token'];
        if (!token || !verifyAdminToken(token)) {
            throw new common_1.UnauthorizedException('管理员认证失败');
        }
        next();
    }
};
exports.AdminAuthMiddleware = AdminAuthMiddleware;
exports.AdminAuthMiddleware = AdminAuthMiddleware = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AdminAuthMiddleware);
