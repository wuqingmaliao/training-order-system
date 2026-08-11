"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const exception_filter_1 = require("./common/filters/exception.filter");
const training_order_module_1 = require("./modules/training-order/training-order.module");
const user_module_1 = require("./modules/user/user.module");
const view_module_1 = require("./modules/view/view.module");
// Vercel 环境下不需要 ViewModule（前端由 Vercel 静态文件服务处理）
const isVercel = !!process.env.VERCEL || !!process.env.DATABASE_URL;
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            training_order_module_1.TrainingOrderModule,
            user_module_1.UserModule,
            ...(isVercel ? [] : [view_module_1.ViewModule]),
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: exception_filter_1.GlobalExceptionFilter,
            },
        ],
    })
], AppModule);
