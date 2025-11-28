"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var user_controller_1 = require("../controllers/user.controller");
var router = (0, express_1.Router)();
router.get('/', user_controller_1.getAllUsers);
router.post('/', user_controller_1.createUser);
router.put('/:id', user_controller_1.updateUser);
router.patch('/:id/toggle-disable', user_controller_1.toggleUserStatus);
router.delete('/:id', user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map