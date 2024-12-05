import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { register, login, forgotPassword, resetPassword } from './auth';
import { initializeDb } from './database';
import dotenv from 'dotenv';
import { createProjectGroup, createProject, getProjectGroups, getProjects, getSemesters, joinProject, leaveProject, getUserProjects } from './projMgmt';
import { sendStandupsEmail, saveHappiness, createSprints, getHappinessData, getSprints, getCurrentSprint } from './projFeat';
import { ChangeEmail, ChangePassword, addGitHubUsername, getUserGitHubUsername, addURL, getURL, changeURL } from './projConfig';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173' }));

initializeDb().then((db) => {
  console.log("Database initialized, starting server...");

  app.get('/', (req, res) => {
    res.send('Server is running!');
  });

  app.get('/semesters', (req, res) => { getSemesters(req, res, db) });
  app.get('/project-groups', (req, res) => { getProjectGroups(req, res, db) });
  app.get('/projects', (req, res) => { getProjects(req, res, db) });
  app.get('/userProjects', (req, res) => { getUserProjects(req, res, db) });
  app.get('/getHappinessData', (req, res) => { getHappinessData(req, res, db) });
  app.get('/sprints', (req, res) => { getSprints(req, res, db) });
  app.get('/currentSprint', (req, res) => { getCurrentSprint(req, res, db) });
  app.get('/getGitURL', (req, res) => { getURL(req, res, db) });
  app.get('/getUserGitHubUsername', (req, res) => { getUserGitHubUsername(req, res, db) });

  app.post('/register', (req, res) => register(req, res, db));
  app.post('/login', (req, res) => login(req, res, db));
  app.post('/forgotPassword', (req, res) => forgotPassword(req, res, db));
  app.post('/resetPassword', (req, res) => resetPassword(req, res, db));
  app.post('/project-admin/createProjectGroup', (req, res) => createProjectGroup(req, res, db));
  app.post('/project-admin/createProject', (req, res) => createProject(req, res, db));
  app.post('/settings/joinProject', (req, res) => joinProject(req, res, db));
  app.post('/settings/leaveProject', (req, res) => leaveProject(req, res, db));
  app.post('/settings/addGitHubUsername', (req, res) => addGitHubUsername(req, res, db));
  app.post('/projects/sendStandupsEmail', (req, res) => sendStandupsEmail(req, res, db));
  app.post('/happiness/saveHappiness', (req, res) => saveHappiness(req, res, db));
  app.post('/happiness/createSprints', (req, res) => createSprints(req, res, db));
  app.post('/settings/changeEmail', (req, res) => ChangeEmail(req, res, db));
  app.post('/settings/changePassword', (req, res) => ChangePassword(req, res, db));
  app.post('/projConfig/addURL', (req, res) => addURL(req, res, db));
  app.post('/projConfig/changeURL', (req, res) => changeURL(req, res, db));

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Failed to initialize the database:', error);
});
