"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingOrderModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const training_order_controller_1 = require("./training-order.controller");
const admin_auth_controller_1 = require("./admin-auth.controller");
const training_order_service_1 = require("./training-order.service");
const database_module_1 = require("../../database/database.module");
let TrainingOrderModule = class TrainingOrderModule {
};
exports.TrainingOrderModule = TrainingOrderModule;
exports.TrainingOrderModule = TrainingOrderModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseRootModule],
        controllers: [training_order_controller_1.TrainingOrderController, admin_auth_controller_1.AdminAuthController],
        providers: [training_order_service_1.TrainingOrderService],
    })
], TrainingOrderModule);
