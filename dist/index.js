"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var promise_1 = __importDefault(require("mysql2/promise"));
var generative_ai_1 = require("@google/generative-ai");
dotenv_1.default.config();
var app = (0, express_1.default)();
var port = process.env.PORT || 3000;
// --- Database Connection ---
var dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
var connection;
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promise_1.default.createConnection(dbConfig)];
                case 1:
                    connection = _a.sent();
                    console.log('Connected to MySQL Database!');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error connecting to database:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// --- Gemini AI Client ---
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
}
var genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// --- Middleware ---
app.use(express_1.default.json()); // To parse JSON bodies
// --- API Routes ---
// Basic test route
app.get('/api', function (req, res) {
    res.json({ message: 'Welcome to Aiyamiddun Digital API' });
});
// AI Content Generation Route
app.post('/api/generate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var prompt_1, model, result, response, text, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                prompt_1 = req.body.prompt;
                if (!prompt_1) {
                    return [2 /*return*/, res.status(400).json({ error: 'Prompt is required' })];
                }
                model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
                return [4 /*yield*/, model.generateContent(prompt_1)];
            case 1:
                result = _a.sent();
                return [4 /*yield*/, result.response];
            case 2:
                response = _a.sent();
                text = response.text();
                res.json({ generatedText: text });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Error calling Gemini API:', error_2);
                res.status(500).json({ error: 'Failed to generate content' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// --- Auth Routes ---
app.post('/api/auth/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, rows, user, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, password = _a.password;
                if (!username || !password) {
                    return [2 /*return*/, res.status(400).json({ error: 'Username and password are required' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])];
            case 2:
                rows = (_b.sent())[0];
                if (rows.length > 0) {
                    user = rows[0];
                    if (user.disabled) {
                        return [2 /*return*/, res.status(403).json({ error: 'Account disabled' })];
                    }
                    res.json(user);
                }
                else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Login error:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/api/auth/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, username, password, role, existingUsers, result, newUser, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, username = _a.username, password = _a.password, role = _a.role;
                if (!name || !username || !password || !role) {
                    return [2 /*return*/, res.status(400).json({ error: 'All fields are required' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, connection.execute('SELECT * FROM users WHERE username = ?', [username])];
            case 2:
                existingUsers = (_b.sent())[0];
                if (existingUsers.length > 0) {
                    return [2 /*return*/, res.status(409).json({ error: 'Username taken' })];
                }
                return [4 /*yield*/, connection.execute('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)', [name, username, password, role])];
            case 3:
                result = (_b.sent())[0];
                newUser = { id: result.insertId, name: name, username: username, role: role, disabled: false };
                res.status(201).json(newUser);
                return [3 /*break*/, 5];
            case 4:
                error_4 = _b.sent();
                console.error('Registration error:', error_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// --- User Management Routes ---
app.get('/api/users', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, connection.execute('SELECT id, name, username, role, disabled FROM users')];
            case 1:
                rows = (_a.sent())[0];
                res.json(rows);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error fetching users:', error_5);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/users', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, username, password, role, result, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, username = _a.username, password = _a.password, role = _a.role;
                // Simple validation
                if (!name || !username || !password || !role) {
                    return [2 /*return*/, res.status(400).json({ error: 'All user fields are required.' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)', [name, username, password, role])];
            case 2:
                result = (_b.sent())[0];
                res.status(201).json({ id: result.insertId, name: name, username: username, role: role, disabled: false });
                return [3 /*break*/, 4];
            case 3:
                error_6 = _b.sent();
                console.error('Error creating user:', error_6);
                // Check for duplicate username error
                if (error_6.code === 'ER_DUP_ENTRY') {
                    return [2 /*return*/, res.status(409).json({ error: 'Username already exists.' })];
                }
                res.status(500).json({ error: 'Failed to create user.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.put('/api/users/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, name, username, password, role, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                _a = req.body, name = _a.name, username = _a.username, password = _a.password, role = _a.role;
                if (!name || !username || !password || !role) {
                    return [2 /*return*/, res.status(400).json({ error: 'All user fields are required.' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute('UPDATE users SET name = ?, username = ?, password = ?, role = ? WHERE id = ?', [name, username, password, role, id])];
            case 2:
                _b.sent();
                res.json({ message: 'User updated successfully' });
                return [3 /*break*/, 4];
            case 3:
                error_7 = _b.sent();
                console.error("Error updating user ".concat(id, ":"), error_7);
                if (error_7.code === 'ER_DUP_ENTRY') {
                    return [2 /*return*/, res.status(409).json({ error: 'Username already exists.' })];
                }
                res.status(500).json({ error: 'Failed to update user.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.patch('/api/users/:id/toggle-disable', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, rows, currentStatus, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, connection.execute('SELECT disabled FROM users WHERE id = ?', [id])];
            case 2:
                rows = (_a.sent())[0];
                if (rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'User not found' })];
                }
                currentStatus = rows[0].disabled;
                // Toggle the status
                return [4 /*yield*/, connection.execute('UPDATE users SET disabled = ? WHERE id = ?', [!currentStatus, id])];
            case 3:
                // Toggle the status
                _a.sent();
                res.json({ message: "User ".concat(!currentStatus ? 'disabled' : 'enabled', " successfully") });
                return [3 /*break*/, 5];
            case 4:
                error_8 = _a.sent();
                console.error("Error toggling user ".concat(id, " status:"), error_8);
                res.status(500).json({ error: 'Failed to update user status.' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.delete('/api/users/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute('DELETE FROM users WHERE id = ?', [id])];
            case 2:
                result = (_a.sent())[0];
                if (result.affectedRows === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'User not found' })];
                }
                res.status(204).send(); // No content
                return [3 /*break*/, 4];
            case 3:
                error_9 = _a.sent();
                console.error("Error deleting user ".concat(id, ":"), error_9);
                res.status(500).json({ error: 'Failed to delete user.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// --- Question Bank Routes ---
app.get('/api/questions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, classLevel, subject, status, authorUsername, query, params, conditions, rows, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, classLevel = _a.classLevel, subject = _a.subject, status = _a.status, authorUsername = _a.authorUsername;
                query = 'SELECT * FROM questions';
                params = [];
                conditions = [];
                if (classLevel) {
                    conditions.push('classLevel = ?');
                    params.push(classLevel);
                }
                if (subject) {
                    conditions.push('subject = ?');
                    params.push(subject);
                }
                if (status) {
                    conditions.push('status = ?');
                    params.push(status);
                }
                if (authorUsername) {
                    conditions.push('authorUsername = ?');
                    params.push(authorUsername);
                }
                if (conditions.length) {
                    query += ' WHERE ' + conditions.join(' AND ');
                }
                query += ' ORDER BY createdAt DESC';
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute(query, params)];
            case 2:
                rows = (_b.sent())[0];
                res.json(rows);
                return [3 /*break*/, 4];
            case 3:
                error_10 = _b.sent();
                console.error('Error fetching questions:', error_10);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/api/questions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var q, query, result, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                q = req.body;
                // Basic validation
                if (!q.text || !q.classLevel || !q.subject || !q.section) {
                    return [2 /*return*/, res.status(400).json({ error: 'Required question fields are missing.' })];
                }
                query = "\n        INSERT INTO questions \n        (text, category, difficulty, answer, answerDetail, imageUrl, options, status, subject, classLevel, section, marks, authorUsername, authorRole)\n        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute(query, [
                        q.text, q.category, q.difficulty, q.answer,
                        q.answerDetail, q.imageUrl, JSON.stringify(q.options),
                        q.status || 'pending', q.subject, q.classLevel, q.section, q.marks,
                        q.authorUsername, q.authorRole
                    ])];
            case 2:
                result = (_a.sent())[0];
                res.status(201).json(__assign({ id: result.insertId }, q));
                return [3 /*break*/, 4];
            case 3:
                error_11 = _a.sent();
                console.error('Error creating question:', error_11);
                res.status(500).json({ error: 'Failed to create question.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.put('/api/questions/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, q, query, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                q = req.body;
                query = "\n        UPDATE questions SET\n        text = ?, category = ?, difficulty = ?, answer = ?, answerDetail = ?, \n        imageUrl = ?, options = ?, status = ?, subject = ?, classLevel = ?, \n        section = ?, marks = ? WHERE id = ?\n    ";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute(query, [
                        q.text, q.category, q.difficulty, q.answer, q.answerDetail,
                        q.imageUrl, JSON.stringify(q.options), q.status, q.subject,
                        q.classLevel, q.section, q.marks, id
                    ])];
            case 2:
                _a.sent();
                res.json({ message: 'Question updated successfully' });
                return [3 /*break*/, 4];
            case 3:
                error_12 = _a.sent();
                console.error("Error updating question ".concat(id, ":"), error_12);
                res.status(500).json({ error: 'Failed to update question.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.patch('/api/questions/:id/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, status, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                status = req.body.status;
                if (!['approved', 'rejected', 'pending'].includes(status)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid status' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute('UPDATE questions SET status = ? WHERE id = ?', [status, id])];
            case 2:
                _a.sent();
                res.json({ message: "Question status updated to ".concat(status) });
                return [3 /*break*/, 4];
            case 3:
                error_13 = _a.sent();
                console.error("Error updating question ".concat(id, " status:"), error_13);
                res.status(500).json({ error: 'Failed to update status.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.patch('/api/questions/:id/toggle-disable', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, rows, currentStatus, error_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, connection.execute('SELECT disabled FROM questions WHERE id = ?', [id])];
            case 2:
                rows = (_a.sent())[0];
                if (rows.length === 0)
                    return [2 /*return*/, res.status(404).json({ error: 'Question not found' })];
                currentStatus = rows[0].disabled;
                return [4 /*yield*/, connection.execute('UPDATE questions SET disabled = ? WHERE id = ?', [!currentStatus, id])];
            case 3:
                _a.sent();
                res.json({ message: "Question ".concat(!currentStatus ? 'disabled' : 'enabled', " successfully") });
                return [3 /*break*/, 5];
            case 4:
                error_14 = _a.sent();
                console.error("Error toggling question ".concat(id, " status:"), error_14);
                res.status(500).json({ error: 'Failed to update status.' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.delete('/api/questions/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute('DELETE FROM questions WHERE id = ?', [id])];
            case 2:
                result = (_a.sent())[0];
                if (result.affectedRows === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Question not found' })];
                }
                res.status(204).send(); // No content
                return [3 /*break*/, 4];
            case 3:
                error_15 = _a.sent();
                console.error("Error deleting question ".concat(id, ":"), error_15);
                res.status(500).json({ error: 'Failed to delete question.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// --- Exam Management Routes ---
app.get('/api/exams', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, classLevel, subject, query, params, conditions, rows, error_16;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, classLevel = _a.classLevel, subject = _a.subject;
                query = 'SELECT * FROM exams';
                params = [];
                conditions = [];
                if (classLevel) {
                    conditions.push('classLevel = ?');
                    params.push(classLevel);
                }
                if (subject) {
                    conditions.push('subject = ?');
                    params.push(subject);
                }
                if (conditions.length) {
                    query += ' WHERE ' + conditions.join(' AND ');
                }
                query += ' ORDER BY createdAt DESC';
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute(query, params)];
            case 2:
                rows = (_b.sent())[0];
                res.json(rows);
                return [3 /*break*/, 4];
            case 3:
                error_16 = _b.sent();
                console.error('Error fetching exams:', error_16);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/api/exams', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var exam, query, result, error_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                exam = req.body;
                if (!exam.title || !exam.questionsSnapshot) {
                    return [2 /*return*/, res.status(400).json({ error: 'Title and questions are required.' })];
                }
                query = "\n        INSERT INTO exams (title, classLevel, subject, difficulty, duration, scheduledStart, scheduledEnd, isQuiz, questionsSnapshot, createdBy)\n        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute(query, [
                        exam.title, exam.classLevel, exam.subject, exam.difficulty, exam.duration,
                        exam.scheduledStart || null, exam.scheduledEnd || null, exam.isQuiz || false,
                        JSON.stringify(exam.questionsSnapshot), exam.createdBy
                    ])];
            case 2:
                result = (_a.sent())[0];
                res.status(201).json(__assign({ id: result.insertId }, exam));
                return [3 /*break*/, 4];
            case 3:
                error_17 = _a.sent();
                console.error('Error creating exam:', error_17);
                res.status(500).json({ error: 'Failed to create exam.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.delete('/api/exams/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_18;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute('DELETE FROM exams WHERE id = ?', [id])];
            case 2:
                result = (_a.sent())[0];
                if (result.affectedRows === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Exam not found' })];
                }
                res.status(204).send();
                return [3 /*break*/, 4];
            case 3:
                error_18 = _a.sent();
                console.error("Error deleting exam ".concat(id, ":"), error_18);
                res.status(500).json({ error: 'Failed to delete exam.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// --- Student-Facing Exam Routes ---
app.post('/api/exams/:id/submit', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var examId, _a, studentName, studentUsername, answers, examRows, exam, questions, questionsParsed, score_1, total, query, error_19;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                examId = req.params.id;
                _a = req.body, studentName = _a.studentName, studentUsername = _a.studentUsername, answers = _a.answers;
                if (!studentUsername || !answers) {
                    return [2 /*return*/, res.status(400).json({ error: 'Student info and answers are required.' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, connection.execute('SELECT questionsSnapshot FROM exams WHERE id = ?', [examId])];
            case 2:
                examRows = (_b.sent())[0];
                if (examRows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Exam not found' })];
                }
                exam = examRows[0];
                questions = exam.questionsSnapshot;
                questionsParsed = JSON.parse(questions);
                score_1 = 0;
                total = questionsParsed.length;
                questionsParsed.forEach(function (q) {
                    var _a, _b;
                    // Ensure answers are trimmed and compared consistently
                    if ((((_a = answers[q.id]) === null || _a === void 0 ? void 0 : _a.trim()) || '') === (((_b = q.answer) === null || _b === void 0 ? void 0 : _b.trim()) || '')) {
                        score_1++;
                    }
                });
                query = "\n            INSERT INTO quiz_results (examId, studentName, studentUsername, score, total, answers)\n            VALUES (?, ?, ?, ?, ?, ?)\n        ";
                return [4 /*yield*/, connection.execute(query, [
                        examId, studentName, studentUsername, score_1, total, JSON.stringify(answers)
                    ])];
            case 3:
                _b.sent();
                res.status(201).json({ score: score_1, total: total });
                return [3 /*break*/, 5];
            case 4:
                error_19 = _b.sent();
                console.error("Error submitting exam ".concat(examId, ":"), error_19);
                res.status(500).json({ error: 'Failed to submit exam.' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// --- Analytics Route ---
app.get('/api/exams/:id/analytics', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var examId, results, error_20;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                examId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, connection.execute('SELECT studentName, score, total, submittedAt FROM quiz_results WHERE examId = ? ORDER BY score DESC', [examId])];
            case 2:
                results = (_a.sent())[0];
                res.json(results);
                return [3 /*break*/, 4];
            case 3:
                error_20 = _a.sent();
                console.error("Error fetching analytics for exam ".concat(examId, ":"), error_20);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// --- Metadata Routes ---
// Get all metadata at once
app.get('/api/metadata', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, metadata, error_21;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, connection.execute('SELECT setting_key, setting_value FROM metadata')];
            case 1:
                rows = (_a.sent())[0];
                metadata = rows.reduce(function (acc, row) {
                    acc[row.setting_key] = JSON.parse(row.setting_value);
                    return acc;
                }, {});
                res.json(metadata);
                return [3 /*break*/, 3];
            case 2:
                error_21 = _a.sent();
                console.error('Error fetching metadata:', error_21);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Update a specific metadata key
app.put('/api/metadata/:key', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var key, value, query, error_22;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                key = req.params.key;
                value = req.body.value;
                if (!value) {
                    return [2 /*return*/, res.status(400).json({ error: 'A `value` array is required.' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                query = "\n            INSERT INTO metadata (setting_key, setting_value) \n            VALUES (?, ?) \n            ON DUPLICATE KEY UPDATE setting_value = ?;\n        ";
                return [4 /*yield*/, connection.execute(query, [key, JSON.stringify(value), JSON.stringify(value)])];
            case 2:
                _a.sent();
                res.json({ message: "Metadata for '".concat(key, "' updated successfully.") });
                return [3 /*break*/, 4];
            case 3:
                error_22 = _a.sent();
                console.error("Error updating metadata for ".concat(key, ":"), error_22);
                res.status(500).json({ error: 'Failed to update metadata.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// --- Error Handling Middleware ---
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// --- Start Server ---
connectToDatabase().then(function () {
    app.listen(port, function () {
        console.log("Server is running on http://localhost:".concat(port));
    });
});
//# sourceMappingURL=index.js.map