"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var ai_controller_1 = require("../controllers/ai.controller");
var router = (0, express_1.Router)();
router.post('/generate-question', ai_controller_1.generateQuestion);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map