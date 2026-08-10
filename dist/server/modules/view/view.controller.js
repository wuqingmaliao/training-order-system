"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewController = void 0;
const tslib_1 = require("tslib");
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
let ViewController = class ViewController {
    async render() {
        return {
            __platform__: JSON.stringify({}),
        };
    }
};
exports.ViewController = ViewController;
tslib_1.__decorate([
    (0, common_1.Get)(['/', '*']),
    (0, common_1.Render)('index'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], ViewController.prototype, "render", null);
exports.ViewController = ViewController = tslib_1.__decorate([
    (0, common_1.Controller)()
], ViewController);
