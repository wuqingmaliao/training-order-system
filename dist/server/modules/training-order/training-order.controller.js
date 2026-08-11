"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingOrderController = void 0;
const tslib_1 = require("tslib");
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const training_order_service_1 = require("./training-order.service");
const jwt_auth_guard_1 = require("../../common/jwt-auth.guard");
let TrainingOrderController = class TrainingOrderController {
    trainingOrderService;
    constructor(trainingOrderService) {
        this.trainingOrderService = trainingOrderService;
    }
    // 创建订单（需要登录）
    async createOrder(body, req) {
        return this.trainingOrderService.createOrder(body, req.user);
    }
    // 导出订单（需要登录）
    async exportOrders(keyword, trainingType, customerSource, contractStatus, userId, startDate, endDate, req) {
        return this.trainingOrderService.exportOrders({
            keyword,
            trainingType,
            customerSource,
            contractStatus,
            userId,
            startDate,
            endDate,
        }, req?.user);
    }
    // 统计（需要登录）
    async getStats(startDate, endDate, userId, req) {
        return this.trainingOrderService.getStats({ startDate, endDate, userId }, req?.user);
    }
    // 获取单个订单详情（需要登录）
    async getOrderDetail(id, req) {
        return this.trainingOrderService.getOrderDetail(id, req.user);
    }
    // 更新订单（需要登录）
    async updateOrder(id, body, req) {
        return this.trainingOrderService.updateOrder(id, body, req.user);
    }
    // 删除订单（需要登录）
    async deleteOrder(id, req) {
        await this.trainingOrderService.deleteOrder(id, req.user);
        return { success: true };
    }
    // 获取订单列表（需要登录）
    async getOrderList(page, pageSize, keyword, trainingType, customerSource, contractStatus, userId, startDate, endDate, req) {
        return this.trainingOrderService.getOrderList({
            page: parseInt(page, 10) || 1,
            pageSize: parseInt(pageSize, 10) || 20,
            keyword,
            trainingType,
            customerSource,
            contractStatus,
            userId,
            startDate,
            endDate,
        }, req?.user);
    }
};
exports.TrainingOrderController = TrainingOrderController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 201, type: Object }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "createOrder", null);
tslib_1.__decorate([
    (0, common_1.Get)('export/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200, type: Object }),
    tslib_1.__param(0, (0, common_1.Query)('keyword')),
    tslib_1.__param(1, (0, common_1.Query)('trainingType')),
    tslib_1.__param(2, (0, common_1.Query)('customerSource')),
    tslib_1.__param(3, (0, common_1.Query)('contractStatus')),
    tslib_1.__param(4, (0, common_1.Query)('userId')),
    tslib_1.__param(5, (0, common_1.Query)('startDate')),
    tslib_1.__param(6, (0, common_1.Query)('endDate')),
    tslib_1.__param(7, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, String, String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "exportOrders", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200, type: Object }),
    tslib_1.__param(0, (0, common_1.Query)('startDate')),
    tslib_1.__param(1, (0, common_1.Query)('endDate')),
    tslib_1.__param(2, (0, common_1.Query)('userId')),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "getStats", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200, type: Object }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "getOrderDetail", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200, type: Object }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "updateOrder", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "deleteOrder", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200, type: Object }),
    tslib_1.__param(0, (0, common_1.Query)('page')),
    tslib_1.__param(1, (0, common_1.Query)('pageSize')),
    tslib_1.__param(2, (0, common_1.Query)('keyword')),
    tslib_1.__param(3, (0, common_1.Query)('trainingType')),
    tslib_1.__param(4, (0, common_1.Query)('customerSource')),
    tslib_1.__param(5, (0, common_1.Query)('contractStatus')),
    tslib_1.__param(6, (0, common_1.Query)('userId')),
    tslib_1.__param(7, (0, common_1.Query)('startDate')),
    tslib_1.__param(8, (0, common_1.Query)('endDate')),
    tslib_1.__param(9, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "getOrderList", null);
exports.TrainingOrderController = TrainingOrderController = tslib_1.__decorate([
    (0, common_1.Controller)('api/training-orders'),
    tslib_1.__metadata("design:paramtypes", [training_order_service_1.TrainingOrderService])
], TrainingOrderController);
