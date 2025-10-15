import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Database } from 'sqlite';
import { CourseController } from './Controllers/CourseController';
import { AuthController } from './Controllers/AuthController';
import { UserController } from './Controllers/UserController';
import { ProjectController } from './Controllers/ProjectController';
import { LegacyController } from './Controllers/LegacyController';

/**
 * Creates and configures an Express application with all routes
 * @param db Database instance to use for all endpoints
 * @returns Configured Express application
 */
export function createApp(db: Database): Application {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

  app.get('/', (req, res) => {
    res.send('Server is running!');
  });

  // Initialize all controllers
  const courseController = new CourseController(db);
  const authController = new AuthController(db);
  const userController = new UserController(db);
  const projectController = new ProjectController(db);
  const legacyController = new LegacyController(db);

  // Register all routes
  courseController.init(app);
  authController.init(app);
  userController.init(app);
  projectController.init(app);
  legacyController.init(app);

  return app;
}
