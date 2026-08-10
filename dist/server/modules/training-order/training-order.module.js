"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingOrderModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const admin_auth_middleware_1 = require("../../common/middleware/admin-auth.middleware");
const training_order_controller_1 = require("./training-order.controller");
const admin_auth_controller_1 = require("./admin-auth.controller");
const training_order_service_1 = require("./training-order.service");
const sqlite_module_1 = require("../../database/sqlite.module");
let TrainingOrderModule = class TrainingOrderModule {
    configure(consumer) {
        consumer
            .apply(admin_auth_middleware_1.AdminAuthMiddleware)
            .exclude({ path: 'api/training-orders', method: common_1.RequestMethod.POST }, { path: 'api/admin/login', method: common_1.RequestMethod.POST })
            .forRoutes('api/training-orders', 'api/admin');
    }
};
exports.TrainingOrderModule = TrainingOrderModule;
exports.TrainingOrderModule = TrainingOrderModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [sqlite_module_1.SqliteDatabaseModule],
        controllers: [training_order_controller_1.TrainingOrderController, admin_auth_controller_1.AdminAuthController],
        providers: [training_order_service_1.TrainingOrderService],
    })
], TrainingOrderModule);
