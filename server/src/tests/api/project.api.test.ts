import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { Database } from 'sqlite';
import { createTestDb, seedDatabase } from './helpers/testDb';
import { Application } from 'express';
import { createApp } from '../../createApp';

describe('Project Management API', () => {
  let db: Database;
  let app: Application;

  beforeEach(async () => {
    db = await createTestDb();
    app = createApp(db);
  });

  describe('GET /courseProject', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should return projects for valid courseName', async () => {
      const response = await request(app)
        .get('/courseProject')
        .query({ courseName: 'Test Course' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should reject missing courseName', async () => {
      const response = await request(app)
        .get('/courseProject')
        .expect(400);

      expect(response.body.message).toBe('Course id is required');
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/courseProject')
        .query({ courseName: 'Non-Existent Course' })
        .expect(404);

      expect(response.body.message).toBe('Course not found');
    });

    it('should return projects with correct structure', async () => {
      const response = await request(app)
        .get('/courseProject')
        .query({ courseName: 'Test Course' })
        .expect(200);

      const project = response.body[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('projectName');
      expect(project).toHaveProperty('courseId');
    });
  });

  describe('PUT /courseProject (edit project)', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should edit project with valid data', async () => {
      const response = await request(app)
        .put('/courseProject')
        .send({
          projectName: 'Test Project',
          newProjectName: 'Updated Project',
          newCourseName: 'Test Course'
        })
        .expect(201);

      expect(response.body.message).toBe('Project edited successfully');

      const project = await db.get('SELECT * FROM projects WHERE projectName = ?', ['Updated Project']);
      expect(project).toBeDefined();
    });

    it('should reject missing newCourseName', async () => {
      const response = await request(app)
        .put('/courseProject')
        .send({ projectName: 'Test Project', newProjectName: 'Updated' })
        .expect(400);

      expect(response.body.message).toBe('Please fill in project group name and project name');
    });

    it('should reject missing newProjectName', async () => {
      const response = await request(app)
        .put('/courseProject')
        .send({ projectName: 'Test Project', newCourseName: 'Test Course' })
        .expect(400);

      expect(response.body.message).toBe('Please fill in project group name and project name');
    });
  });

  describe('GET /courseProject/course', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should return course for valid projectName', async () => {
      const response = await request(app)
        .get('/courseProject/course')
        .query({ projectName: 'Test Project' })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.courseName).toBe('Test Course');
    });

    it('should reject missing projectName', async () => {
      const response = await request(app)
        .get('/courseProject/course')
        .expect(400);

      expect(response.body.message).toBe('Project name is required');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/courseProject/course')
        .query({ projectName: 'Non-Existent' })
        .expect(404);

      expect(response.body.message).toBe('Course not found for this project');
    });
  });

  describe('GET /courseProject/user/role', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should return role for valid project and user', async () => {
      const response = await request(app)
        .get('/courseProject/user/role')
        .query({ projectName: 'Test Project', email: 'test@test.com' })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.role).toBe('Developer');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .get('/courseProject/user/role')
        .query({ projectName: 'Test Project' })
        .expect(400);

      expect(response.body.message).toBe('User email is required');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .get('/courseProject/user/role')
        .query({ projectName: 'Test Project', email: 'notanemail' })
        .expect(400);

      expect(response.body.message).toBe('Invalid email address');
    });

    it('should reject missing projectName', async () => {
      const response = await request(app)
        .get('/courseProject/user/role')
        .query({ email: 'test@test.com' })
        .expect(400);

      expect(response.body.message).toBe('Project name and user email are required');
    });

    it('should return 404 for non-member user', async () => {
      const response = await request(app)
        .get('/courseProject/user/role')
        .query({ projectName: 'Test Project', email: 'admin@test.com' })
        .expect(404);

      expect(response.body.message).toBe('Role not found');
    });
  });

  describe('POST /user/project (join project)', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should join project with valid data', async () => {
      const response = await request(app)
        .post('/user/project')
        .send({
          projectName: 'Test Project',
          memberEmail: 'admin@test.com',
          memberRole: 'Tester'
        })
        .expect(201);

      expect(response.body.message).toBe('Joined project successfully');

      const membership = await db.get(
        'SELECT * FROM user_projects WHERE userId = 1 AND projectId = 1'
      );
      expect(membership).toBeDefined();
      expect(membership.role).toBe('Tester');
    });

    it('should reject missing memberEmail', async () => {
      const response = await request(app)
        .post('/user/project')
        .send({ projectName: 'Test Project', memberRole: 'Tester' })
        .expect(400);

      expect(response.body.message).toBe('User email is required');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/user/project')
        .send({
          projectName: 'Test Project',
          memberEmail: 'notanemail',
          memberRole: 'Tester'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid email address');
    });

    it('should reject missing memberRole', async () => {
      const response = await request(app)
        .post('/user/project')
        .send({ projectName: 'Test Project', memberEmail: 'admin@test.com' })
        .expect(400);

      expect(response.body.message).toBe('Please fill in your role');
    });

    it('should reject if user already joined', async () => {
      const response = await request(app)
        .post('/user/project')
        .send({
          projectName: 'Test Project',
          memberEmail: 'test@test.com',
          memberRole: 'Developer'
        })
        .expect(400);

      expect(response.body.message).toBe('You have already joined this project');
    });

    it('should reject non-existent project', async () => {
      const response = await request(app)
        .post('/user/project')
        .send({
          projectName: 'Non-Existent',
          memberEmail: 'admin@test.com',
          memberRole: 'Tester'
        })
        .expect(404);

      expect(response.body.message).toBe('Project not found');
    });
  });

  describe('DELETE /user/project (leave project)', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should leave project successfully', async () => {
      const response = await request(app)
        .delete('/user/project')
        .send({ projectName: 'Test Project', userEmail: 'test@test.com' })
        .expect(200);

      expect(response.body.message).toBe('Left project successfully');

      const membership = await db.get(
        'SELECT * FROM user_projects WHERE userId = 2 AND projectId = 1'
      );
      expect(membership).toBeUndefined();
    });

    it('should reject if user is not a member', async () => {
      const response = await request(app)
        .delete('/user/project')
        .send({ projectName: 'Test Project', userEmail: 'admin@test.com' })
        .expect(400);

      expect(response.body.message).toBe('You are not a member of this project');
    });

    it('should reject non-existent project', async () => {
      const response = await request(app)
        .delete('/user/project')
        .send({ projectName: 'Non-Existent', userEmail: 'test@test.com' })
        .expect(404);

      expect(response.body.message).toBe('Project not found');
    });
  });

  describe('POST /projConfig/leaveProject (legacy)', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should leave project successfully', async () => {
      const response = await request(app)
        .post('/projConfig/leaveProject')
        .send({ projectName: 'Test Project', userEmail: 'test@test.com' })
        .expect(200);

      expect(response.body.message).toBe('Left project successfully');
    });
  });

  describe('GET /user/projects', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should return projects for valid user', async () => {
      const response = await request(app)
        .get('/user/projects')
        .query({ userEmail: 'test@test.com' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('projectName');
    });

    it('should reject missing userEmail', async () => {
      const response = await request(app)
        .get('/user/projects')
        .expect(400);

      expect(response.body.message).toBe('User email is required');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .get('/user/projects')
        .query({ userEmail: 'notanemail' })
        .expect(400);

      expect(response.body.message).toBe('Invalid email address');
    });

    it('should return empty array for user with no projects', async () => {
      const response = await request(app)
        .get('/user/projects')
        .query({ userEmail: 'admin@test.com' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return multiple projects for user in multiple projects', async () => {
      // Add user to another project
      await request(app)
        .post('/courseProject')
        .send({ courseId: 1, projectName: 'Project 2' })
        .expect(201);

      await request(app)
        .post('/user/project')
        .send({
          projectName: 'Project 2',
          memberEmail: 'test@test.com',
          memberRole: 'Tester'
        })
        .expect(201);

      const response = await request(app)
        .get('/user/projects')
        .query({ userEmail: 'test@test.com' })
        .expect(200);

      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /user/courses', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should return enrolled courses for valid user', async () => {
      const response = await request(app)
        .get('/user/courses')
        .query({ userEmail: 'test@test.com' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('courseName');
    });

    it('should reject missing userEmail', async () => {
      const response = await request(app)
        .get('/user/courses')
        .expect(400);

      expect(response.body.message).toBe('User email is required');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .get('/user/courses')
        .query({ userEmail: 'notanemail' })
        .expect(400);

      expect(response.body.message).toBe('Invalid email address');
    });

    it('should return empty array for user with no courses', async () => {
      const response = await request(app)
        .get('/user/courses')
        .query({ userEmail: 'admin@test.com' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /courseProject/currentSprint', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should return sprints for valid project', async () => {
      const response = await request(app)
        .get('/courseProject/currentSprint')
        .query({ projectName: 'Test Project' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return sprints from course for new project', async () => {
      await request(app)
        .post('/courseProject')
        .send({ courseId: 1, projectName: 'Project Without Own Sprints' })
        .expect(201);

      const response = await request(app)
        .get('/courseProject/currentSprint')
        .query({ projectName: 'Project Without Own Sprints' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should return sprints from the course, not empty
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return sprints sorted by endDate', async () => {
      // Add more sprints
      await db.run(
        'INSERT INTO sprints (courseId, sprintName, endDate) VALUES (?, ?, ?)',
        [1, 'sprint1', '2025-01-15']
      );
      await db.run(
        'INSERT INTO sprints (courseId, sprintName, endDate) VALUES (?, ?, ?)',
        [1, 'sprint2', '2025-01-31']
      );

      const response = await request(app)
        .get('/courseProject/currentSprint')
        .query({ projectName: 'Test Project' })
        .expect(200);

      expect(response.body.length).toBe(3);
      // Check they are sorted
      expect(new Date(response.body[0].endDate).getTime())
        .toBeLessThanOrEqual(new Date(response.body[1].endDate).getTime());
    });
  });
});
