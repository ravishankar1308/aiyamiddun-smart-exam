"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var exam_controller_1 = require("../controllers/exam.controller");
var router = (0, express_1.Router)();
router.get('/', exam_controller_1.getAllExams);
router.post('/', exam_controller_1.createExam);
router.delete('/:id', exam_controller_1.deleteExam);
router.post('/:id/submit', exam_controller_1.submitExam);
router.get('/:id/analytics', exam_controller_1.getExamAnalytics);
exports.default = router;
//# sourceMappingURL=exam.routes.js.map