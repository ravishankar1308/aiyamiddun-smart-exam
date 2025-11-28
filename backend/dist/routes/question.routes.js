"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var question_controller_1 = require("../controllers/question.controller");
var router = (0, express_1.Router)();
router.get('/', question_controller_1.getAllQuestions);
router.post('/', question_controller_1.createQuestion);
router.put('/:id', question_controller_1.updateQuestion);
router.patch('/:id/status', question_controller_1.updateQuestionStatus);
router.patch('/:id/toggle-disable', question_controller_1.toggleQuestionDisable);
router.delete('/:id', question_controller_1.deleteQuestion);
exports.default = router;
//# sourceMappingURL=question.routes.js.map