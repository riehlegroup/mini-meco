"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./auth");
const database_1 = require("./database");
const dotenv_1 = __importDefault(require("dotenv"));
const projMgmt_1 = require("./projMgmt");
const projFeat_1 = require("./projFeat");
const projConfig_1 = require("./projConfig");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
(0, database_1.initializeDb)().then((db) => {
    console.log("Database initialized, starting server...");
    app.get('/', (req, res) => {
        res.send('Server is running!');
    });
    app.get('/semesters', (req, res) => { (0, projMgmt_1.getSemesters)(req, res, db); });
    app.get('/project-groups', (req, res) => { (0, projMgmt_1.getProjectGroups)(req, res, db); });
    app.get('/projects', (req, res) => { (0, projMgmt_1.getProjects)(req, res, db); });
    app.get('/userProjects', (req, res) => { (0, projMgmt_1.getUserProjects)(req, res, db); });
    app.get('/getHappinessData', (req, res) => { (0, projFeat_1.getHappinessData)(req, res, db); });
    app.get('/sprints', (req, res) => { (0, projFeat_1.getSprints)(req, res, db); });
    app.get('/currentSprint', (req, res) => { (0, projFeat_1.getCurrentSprint)(req, res, db); });
    app.get('/getGitURL', (req, res) => { (0, projConfig_1.getURL)(req, res, db); });
    app.get('/getUserGitHubUsername', (req, res) => { (0, projConfig_1.getUserGitHubUsername)(req, res, db); });
    app.post('/register', (req, res) => (0, auth_1.register)(req, res, db));
    app.post('/login', (req, res) => (0, auth_1.login)(req, res, db));
    app.post('/forgotPassword', (req, res) => (0, auth_1.forgotPassword)(req, res, db));
    app.post('/resetPassword', (req, res) => (0, auth_1.resetPassword)(req, res, db));
    app.post('/project-admin/createProjectGroup', (req, res) => (0, projMgmt_1.createProjectGroup)(req, res, db));
    app.post('/project-admin/createProject', (req, res) => (0, projMgmt_1.createProject)(req, res, db));
    app.post('/settings/joinProject', (req, res) => (0, projMgmt_1.joinProject)(req, res, db));
    app.post('/settings/leaveProject', (req, res) => (0, projMgmt_1.leaveProject)(req, res, db));
    app.post('/settings/addGitHubUsername', (req, res) => (0, projConfig_1.addGitHubUsername)(req, res, db));
    app.post('/projects/sendStandupsEmail', (req, res) => (0, projFeat_1.sendStandupsEmail)(req, res, db));
    app.post('/happiness/saveHappiness', (req, res) => (0, projFeat_1.saveHappiness)(req, res, db));
    app.post('/happiness/createSprints', (req, res) => (0, projFeat_1.createSprints)(req, res, db));
    app.post('/settings/changeEmail', (req, res) => (0, projConfig_1.ChangeEmail)(req, res, db));
    app.post('/settings/changePassword', (req, res) => (0, projConfig_1.ChangePassword)(req, res, db));
    app.post('/projConfig/addURL', (req, res) => (0, projConfig_1.addURL)(req, res, db));
    app.post('/projConfig/changeURL', (req, res) => (0, projConfig_1.changeURL)(req, res, db));
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Failed to initialize the database:', error);
});
