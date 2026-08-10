"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const express = tslib_1.__importStar(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const hbs_1 = require("hbs");
const app_module_1 = require("./app.module");
function findClientDir() {
    const candidates = [
        (0, path_1.join)(process.cwd(), 'dist', 'client'), // Render: 项目根目录/dist/client
        (0, path_1.join)(process.cwd(), 'client'), // 本地: dist/client (从dist启动时)
        (0, path_1.join)(__dirname, '..', 'client'), // 相对编译输出
        (0, path_1.join)(__dirname, '..', '..', 'client'), // 备用
    ];
    for (const dir of candidates) {
        // 必须同时有 index.html 和 assets 目录，才是构建后的静态文件目录
        const hasIndex = fs.existsSync((0, path_1.join)(dir, 'index.html'));
        const hasAssets = fs.existsSync((0, path_1.join)(dir, 'assets'));
        if (hasIndex && hasAssets) {
            return dir;
        }
    }
    // 默认返回 dist/client
    return (0, path_1.join)(process.cwd(), 'dist', 'client');
}
function findDataDir() {
    const candidates = [
        (0, path_1.join)(process.cwd(), 'data'),
        (0, path_1.join)(process.cwd(), 'dist', 'data'),
        (0, path_1.join)(__dirname, '..', 'data'),
    ];
    for (const dir of candidates) {
        if (fs.existsSync(dir)) {
            return dir;
        }
    }
    return (0, path_1.join)(process.cwd(), 'data');
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        abortOnError: false,
    });
    const logger = new common_1.Logger('Bootstrap');
    const port = Number(process.env.PORT || process.env.SERVER_PORT || '3000');
    const host = process.env.SERVER_HOST || '0.0.0.0';
    // 启用CORS
    app.enableCors();
    const clientDir = findClientDir();
    logger.log(`静态文件目录: ${clientDir}`);
    // 服务静态资源
    app.use('/assets', express.static((0, path_1.join)(clientDir, 'assets')));
    app.use(express.static(clientDir, {
        index: false,
    }));
    // 注册视图引擎
    app.setBaseViewsDir(clientDir);
    app.setViewEngine('html');
    app.engine('html', hbs_1.__express);
    await app.listen(port, host);
    logger.log(`Server running on ${host}:${port}`);
    logger.log(`订单填写: http://localhost:${port}`);
    logger.log(`管理后台: http://localhost:${port}/admin/login`);
}
bootstrap();
