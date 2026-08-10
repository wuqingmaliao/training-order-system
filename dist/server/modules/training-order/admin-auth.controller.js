"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const tslib_1 = require("tslib");
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const admin_auth_middleware_1 = require("../../common/middleware/admin-auth.middleware");
let AdminAuthController = class AdminAuthController {
    login(body) {
        const { password } = body;
        if (password !== (0, admin_auth_middleware_1.getAdminPassword)()) {
            throw new common_1.UnauthorizedException('密码错误');
        }
        const token = (0, admin_auth_middleware_1.generateAdminToken)();
        return { success: true, token };
    }
};
exports.AdminAuthController = AdminAuthController;
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    openapi.ApiResponse({ status: 201, type: Object }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Object)
], AdminAuthController.prototype, "login", null);
exports.AdminAuthController = AdminAuthController = tslib_1.__decorate([
    (0, common_1.Controller)('api/admin')
], AdminAuthController);
