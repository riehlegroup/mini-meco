import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { register, login, forgotPassword, resetPassword, confirmEmail, sendConfirmationEmail } from './auth';
import { initializeDB } from './databaseInitializer';
import dotenv from 'dotenv';
import { createProjectGroup, createProject, editProjectGroup, editProject,getProjectGroups, getProjects, getSemesters, joinProject, leaveProject, getUserProjects, getUserProjectGroups, getUsersByStatus, updateUserStatus, updateAllConfirmedUsers } from './projectManagement';
import { sendStandupsEmail, saveHappinessMetric, createSprints, getProjectHappinessMetrics, getSprints, getProjectCurrentSprint, getProjectURL } from './projectFeatures';
import { changeEmail, changePassword, setUserGitHubUsername, getUserGitHubUsername, setUserProjectURL, getUserProjectURL, changeUserProjectURL } from './userConfig';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173' }));

initializeDB().then((db) => {
  console.log("Database initialized, starting server...");

  app.get('/', (req, res) => {
    res.send('Server is running!');
  });

  app.get('/semesters', (req, res) => { getSemesters(req, res, db) });
  app.get('/project-groups', (req, res) => { getProjectGroups(req, res, db) });
  app.get('/projects', (req, res) => { getProjects(req, res, db) });
  app.get('/userProjects', (req, res) => { getUserProjects(req, res, db) });
  app.get('/getHappinessData', (req, res) => { getProjectHappinessMetrics(req, res, db) });
  app.get('/sprints', (req, res) => { getSprints(req, res, db) });
  app.get('/currentSprint', (req, res) => { getProjectCurrentSprint(req, res, db) });
  app.get('/getGitURL', (req, res) => { getUserProjectURL(req, res, db) });
  app.get('/getUserGitHubUsername', (req, res) => { getUserGitHubUsername(req, res, db) });
  app.get('/getUserProjectGroups', (req, res) => { getUserProjectGroups(req, res, db) });
  app.get('/getProjectGitHubURL', (req, res) => { getProjectURL(req, res, db) });
  app.get('/getUserStatus', (req, res) => { getUsersByStatus(req, res, db) });


  app.post('/register', (req, res) => register(req, res, db));
  app.post('/login', (req, res) => login(req, res, db));
  app.post('/forgotPassword', (req, res) => forgotPassword(req, res, db));
  app.post('/resetPassword', (req, res) => resetPassword(req, res, db));
  app.post('/project-admin/createProjectGroup', (req, res) => createProjectGroup(req, res, db));
  app.post('/project-admin/createProject', (req, res) => createProject(req, res, db));
  app.post('/project-admin/editProjectGroup', (req, res) => editProjectGroup(req, res, db));
  app.post('/project-admin/editProject', (req, res) => editProject(req, res, db));
  app.post('/settings/joinProject', (req, res) => joinProject(req, res, db));
  app.post('/settings/leaveProject', (req, res) => leaveProject(req, res, db));
  app.post('/settings/addGitHubUsername', (req, res) => setUserGitHubUsername(req, res, db));
  app.post('/projects/sendStandupsEmail', (req, res) => sendStandupsEmail(req, res, db));
  app.post('/happiness/saveHappiness', (req, res) => saveHappinessMetric(req, res, db));
  app.post('/happiness/createSprints', (req, res) => createSprints(req, res, db));
  app.post('/settings/changeEmail', (req, res) => changeEmail(req, res, db));
  app.post('/settings/changePassword', (req, res) => changePassword(req, res, db));
  app.post('/projConfig/addURL', (req, res) => setUserProjectURL(req, res, db));
  app.post('/projConfig/changeURL', (req, res) => changeUserProjectURL(req, res, db));
  app.post('/confirmEmail', (req, res) => confirmEmail(req, res, db));
  app.post('/updateUserStatus', (req, res) => updateUserStatus(req, res, db));
  app.post('/sendConfirmationEmail', (req, res) => sendConfirmationEmail(req, res, db))
  app.post('/updateAllConfirmedUsers', (req, res) => updateAllConfirmedUsers(req, res, db));

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Failed to initialize the database:', error);
});
