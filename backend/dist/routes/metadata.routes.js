"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var metadata_controller_1 = require("../controllers/metadata.controller");
var router = (0, express_1.Router)();
router.get('/', metadata_controller_1.getMetadata);
exports.default = router;
//# sourceMappingURL=metadata.routes.js.map