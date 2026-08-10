"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingOrderController = void 0;
const tslib_1 = require("tslib");
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const training_order_service_1 = require("./training-order.service");
let TrainingOrderController = class TrainingOrderController {
    trainingOrderService;
    constructor(trainingOrderService) {
        this.trainingOrderService = trainingOrderService;
    }
    async createOrder(body) {
        return this.trainingOrderService.createOrder(body);
    }
    async exportOrders(keyword, trainingType, customerSource, contractStatus) {
        return this.trainingOrderService.exportOrders({
            keyword,
            trainingType,
            customerSource,
            contractStatus,
        });
    }
    async getOrderDetail(id) {
        return this.trainingOrderService.getOrderDetail(id);
    }
    async getOrderList(page, pageSize, keyword, trainingType, customerSource, contractStatus) {
        return this.trainingOrderService.getOrderList({
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            keyword,
            trainingType,
            customerSource,
            contractStatus,
        });
    }
};
exports.TrainingOrderController = TrainingOrderController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: Object }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "createOrder", null);
tslib_1.__decorate([
    (0, common_1.Get)('export/all'),
    openapi.ApiResponse({ status: 200, type: Object }),
    tslib_1.__param(0, (0, common_1.Query)('keyword')),
    tslib_1.__param(1, (0, common_1.Query)('trainingType')),
    tslib_1.__param(2, (0, common_1.Query)('customerSource')),
    tslib_1.__param(3, (0, common_1.Query)('contractStatus')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "exportOrders", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "getOrderDetail", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: Object }),
    tslib_1.__param(0, (0, common_1.Query)('page')),
    tslib_1.__param(1, (0, common_1.Query)('pageSize')),
    tslib_1.__param(2, (0, common_1.Query)('keyword')),
    tslib_1.__param(3, (0, common_1.Query)('trainingType')),
    tslib_1.__param(4, (0, common_1.Query)('customerSource')),
    tslib_1.__param(5, (0, common_1.Query)('contractStatus')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], TrainingOrderController.prototype, "getOrderList", null);
exports.TrainingOrderController = TrainingOrderController = tslib_1.__decorate([
    (0, common_1.Controller)('api/training-orders'),
    tslib_1.__metadata("design:paramtypes", [training_order_service_1.TrainingOrderService])
], TrainingOrderController);
