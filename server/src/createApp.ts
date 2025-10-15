import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Database } from 'sqlite';
import { ObjectHandler } from './ObjectHandler';
import { CourseController } from './CourseController';
import {
  register, login, forgotPassword, resetPassword, confirmEmail, sendConfirmationEmail, checkOwnership
} from './auth';
import {
  editProject, getProjects,
  joinProject, leaveProject, getUserProjects, getUsersByStatus,
  updateUserStatus, updateAllConfirmedUsers,
  getEnrolledCourses,
  getRoleForProject,
  getUsers,
  getCourseForProject
} from './projectManagement';
import {
  sendStandupEmails, saveHappinessMetric, createSprints, getProjectHappinessMetrics, getSprints,
  getProjectCurrentSprint
} from './projectFeatures';
import {
  changeEmail, changePassword, setUserGitHubUsername, getUserGitHubUsername, setUserProjectURL,
  getUserProjectURL, getUserRole, updateUserRole
} from './userConfig';

/**
 * Creates and configures an Express application with all routes
 * @param db Database instance to use for all endpoints
 * @returns Configured Express application
 */
export function createApp(db: Database): Application {
  const app = express();
  const oh = new ObjectHandler();
  const course = new CourseController(db);

  app.use(bodyParser.json());
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

  app.get('/', (req, res) => {
    res.send('Server is running!');
  });

  // course endpoints
  course.init(app);

  // courseProject endpoints
  app.get('/courseProject', (req, res) => { getProjects(req, res, db) });
  app.get('/courseProject/course', (req, res) => getCourseForProject(req, res, db));
  app.get('/courseProject/user/role', (req, res) => getRoleForProject(req, res, db));
  app.put('/courseProject', (req, res) => { editProject(req, res, db); });
  app.get('/courseProject/happiness', (req, res) => { getProjectHappinessMetrics(req, res, db) });
  app.post('/courseProject/happiness', (req, res) => saveHappinessMetric(req, res, db));
  app.post('/courseProject/sprints', (req, res) => createSprints(req, res, db));
  app.post('/courseProject/standupsEmail', (req, res) => sendStandupEmails(req, res, db));
  app.get('/courseProject/currentSprint', (req, res) => { getProjectCurrentSprint(req, res, db) });
  app.get('/courseProject/sprints', (req, res) => { getSprints(req, res, db) });

  // user endpoints
  app.post('/user', (req, res) => register(req, res, db));
  app.get('/user/courses', (req, res) => getEnrolledCourses(req, res, db));
  app.get('/getUsers', (req, res) => { getUsers(req, res, db) });
  app.get('/user/project/url', (req, res) => { getUserProjectURL(req, res, db) });
  app.post('/user/password/forgotMail', (req, res) => forgotPassword(req, res, db));
  app.post('/user/password/reset', (req, res) => resetPassword(req, res, db));
  app.post('/user/password/change', (req, res) => changePassword(req, res, db));
  app.get('/user/projects', (req, res) => { getUserProjects(req, res, db) });
  app.post('/user/project/url', (req, res) => setUserProjectURL(req, res, db));
  app.get('/user/githubUsername', (req, res) => { getUserGitHubUsername(req, res, db) });
  app.post('/user/confirmation/email', (req, res) => confirmEmail(req, res, db));
  app.post('/user/status', checkOwnership(db, oh), (req, res) => { updateUserStatus(req, res, db); });
  app.post('/user/confirmation/trigger', (req, res) => sendConfirmationEmail(req, res, db))
  app.post('/user/status/all', (req, res) => updateAllConfirmedUsers(req, res, db));
  app.post('/user/mail', (req, res) => changeEmail(req, res, db));
  app.post('/user/project', (req, res) => joinProject(req, res, db));
  app.delete('/user/project', (req, res) => leaveProject(req, res, db));
  app.post('/user/githubUsername', (req, res) => setUserGitHubUsername(req, res, db));
  app.get('/user/status', (req, res) => { getUsersByStatus(req, res, db) });
  app.get('/user/role', (req, res) => { getUserRole(req, res, db) });
  app.post('/user/role', (req, res) => { updateUserRole(req, res, db) });

  // Legacy endpoints
  app.post('/projConfig/changeURL', (req, res) => setUserProjectURL(req, res, db));
  app.post('/projConfig/leaveProject', (req, res) => leaveProject(req, res, db));
  app.post('/session', (req, res) => login(req, res, db));

  return app;
}
