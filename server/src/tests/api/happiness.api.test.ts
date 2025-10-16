import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { Database } from 'sqlite';
import { createTestDb, seedDatabase } from './helpers/testDb';
import { validHappinessMetric, validStandup, validSprints } from './helpers/fixtures';
import { Application } from 'express';
import { createApp } from '../../createApp';

describe('Happiness & Sprint API', () => {
  let db: Database;
  let app: Application;

  beforeEach(async () => {
    db = await createTestDb();
    app = createApp(db);
  });

  describe('POST /courseProject/happiness', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should save happiness metric with valid data', async () => {
      const metric = validHappinessMetric();
      const response = await request(app)
        .post('/courseProject/happiness')
        .send(metric)
        .expect(200);

      expect(response.body.message).toBe('Happiness updated successfully');

      const saved = await db.get(
        'SELECT * FROM happiness WHERE userId = 2 AND projectId = 1'
      );
      expect(saved).toBeDefined();
      expect(saved.happiness).toBe(4);
    });

    it('should accept missing projectName (inserts null)', async () => {
      // API doesn't validate missing fields, allows null inserts
      const response = await request(app)
        .post('/courseProject/happiness')
        .send({
          userEmail: 'test@test.com',
          happiness: 4,
          sprintName: 'sprint0'
        })
        .expect(200);

      expect(response.body.message).toBe('Happiness updated successfully');
    });

    it('should accept missing userEmail (inserts null)', async () => {
      const response = await request(app)
        .post('/courseProject/happiness')
        .send({
          projectName: 'Test Project',
          happiness: 4,
          sprintName: 'sprint0'
        })
        .expect(200);

      expect(response.body.message).toBe('Happiness updated successfully');
    });

    it('should accept missing happiness value (inserts null)', async () => {
      const response = await request(app)
        .post('/courseProject/happiness')
        .send({
          projectName: 'Test Project',
          userEmail: 'test@test.com',
          sprintName: 'sprint0'
        })
        .expect(200);

      expect(response.body.message).toBe('Happiness updated successfully');
    });

    it('should accept missing sprintName (inserts null)', async () => {
      const response = await request(app)
        .post('/courseProject/happiness')
        .send({
          projectName: 'Test Project',
          userEmail: 'test@test.com',
          happiness: 4
        })
        .expect(200);

      expect(response.body.message).toBe('Happiness updated successfully');
    });

    it('should store timestamp automatically', async () => {
      const metric = validHappinessMetric();
      const beforeTime = new Date().toISOString();

      await request(app)
        .post('/courseProject/happiness')
        .send(metric)
        .expect(200);

      const saved = await db.get(
        'SELECT * FROM happiness WHERE userId = 2 AND projectId = 1'
      );
      expect(saved.timestamp).toBeDefined();
      expect(new Date(saved.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime()
      );
    });

    it('should allow multiple happiness entries for same user/project', async () => {
      const metric = validHappinessMetric();

      await request(app)
        .post('/courseProject/happiness')
        .send(metric)
        .expect(200);

      await request(app)
        .post('/courseProject/happiness')
        .send({ ...metric, happiness: 5 })
        .expect(200);

      const entries = await db.all(
        'SELECT * FROM happiness WHERE userId = 2 AND projectId = 1'
      );
      expect(entries.length).toBe(2);
    });
  });

  describe('GET /courseProject/happiness', () => {
    beforeEach(async () => {
      await seedDatabase(db);
      // Add some happiness data
      await request(app)
        .post('/courseProject/happiness')
        .send(validHappinessMetric())
        .expect(200);
    });

    it('should return happiness data for valid project', async () => {
      const response = await request(app)
        .get('/courseProject/happiness')
        .query({ projectName: 'Test Project' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return empty array for project with no data', async () => {
      await request(app)
        .post('/courseProject')
        .send({ courseId: 1, projectName: 'Empty Project' })
        .expect(201);

      const response = await request(app)
        .get('/courseProject/happiness')
        .query({ projectName: 'Empty Project' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should include sprint and user info', async () => {
      const response = await request(app)
        .get('/courseProject/happiness')
        .query({ projectName: 'Test Project' })
        .expect(200);

      const entry = response.body[0];
      expect(entry).toHaveProperty('sprintName');
      expect(entry).toHaveProperty('userEmail');
      expect(entry).toHaveProperty('happiness');
      expect(entry).toHaveProperty('timestamp');
    });

    it('should return data sorted by sprint and timestamp', async () => {
      // Add another sprint
      await db.run(
        'INSERT INTO sprints (courseId, sprintName, endDate) VALUES (?, ?, ?)',
        [1, 'sprint1', '2025-01-15']
      );

      // Add happiness for new sprint
      await request(app)
        .post('/courseProject/happiness')
        .send({
          projectName: 'Test Project',
          userEmail: 'test@test.com',
          happiness: 5,
          sprintName: 'sprint1'
        })
        .expect(200);

      const response = await request(app)
        .get('/courseProject/happiness')
        .query({ projectName: 'Test Project' })
        .expect(200);

      expect(response.body.length).toBe(2);
      // Should be sorted
      expect(response.body[0].sprintName).toBe('sprint0');
      expect(response.body[1].sprintName).toBe('sprint1');
    });
  });

  describe('POST /courseProject/sprints', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should create sprints with valid data', async () => {
      const sprints = validSprints();
      const response = await request(app)
        .post('/courseProject/sprints')
        .send(sprints)
        .expect(201);

      expect(response.body.message).toBe('Sprints created successfully');

      const allSprints = await db.all(
        'SELECT * FROM sprints WHERE courseId = 1'
      );
      // Should have original sprint + 3 new ones
      expect(allSprints.length).toBe(4);
    });

    it('should reject missing courseName', async () => {
      const response = await request(app)
        .post('/courseProject/sprints')
        .send({ dates: ['2025-01-15'] })
        .expect(400);

      expect(response.body.message).toBe('Course name is required');
    });

    it('should reject missing dates', async () => {
      const response = await request(app)
        .post('/courseProject/sprints')
        .send({ courseName: 'Test Course' })
        .expect(400);

      expect(response.body.message).toBe('Dates array is required');
    });

    it('should reject non-existent course', async () => {
      const response = await request(app)
        .post('/courseProject/sprints')
        .send({ courseName: 'Non-Existent', dates: ['2025-01-15'] })
        .expect(404);

      expect(response.body.message).toBe('Course not found');
    });

    it('should auto-increment sprint names', async () => {
      await request(app)
        .post('/courseProject/sprints')
        .send({ courseName: 'Test Course', dates: ['2025-01-15', '2025-01-31'] })
        .expect(201);

      const sprints = await db.all(
        'SELECT sprintName FROM sprints WHERE courseId = 1 ORDER BY sprintName'
      );
      expect(sprints[0].sprintName).toBe('sprint0');
      expect(sprints[1].sprintName).toBe('sprint1');
      expect(sprints[2].sprintName).toBe('sprint2');
    });

    it('should continue numbering from existing sprints', async () => {
      // First batch
      await request(app)
        .post('/courseProject/sprints')
        .send({ courseName: 'Test Course', dates: ['2025-01-15'] })
        .expect(201);

      // Second batch
      await request(app)
        .post('/courseProject/sprints')
        .send({ courseName: 'Test Course', dates: ['2025-02-15'] })
        .expect(201);

      const lastSprint = await db.get(
        'SELECT sprintName FROM sprints WHERE courseId = 1 ORDER BY id DESC LIMIT 1'
      );
      expect(lastSprint.sprintName).toBe('sprint2');
    });

    it('should create multiple sprints in one call', async () => {
      const beforeCount = await db.get('SELECT COUNT(*) as count FROM sprints WHERE courseId = 1');

      await request(app)
        .post('/courseProject/sprints')
        .send({
          courseName: 'Test Course',
          dates: ['2025-01-15', '2025-02-15', '2025-03-15']
        })
        .expect(201);

      const afterCount = await db.get('SELECT COUNT(*) as count FROM sprints WHERE courseId = 1');
      expect(afterCount.count).toBe(beforeCount.count + 3);
    });
  });

  describe('GET /courseProject/sprints', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should return sprints for valid course', async () => {
      const response = await request(app)
        .get('/courseProject/sprints')
        .query({ courseName: 'Test Course' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return empty array for course with no sprints', async () => {
      await request(app)
        .post('/course')
        .send({ courseName: 'Empty Course', semester: 'SS2025' })
        .expect(201);

      const response = await request(app)
        .get('/courseProject/sprints')
        .query({ courseName: 'Empty Course' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return sprints sorted by endDate ascending', async () => {
      await db.run(
        'INSERT INTO sprints (courseId, sprintName, endDate) VALUES (?, ?, ?)',
        [1, 'sprint1', '2025-03-31']
      );
      await db.run(
        'INSERT INTO sprints (courseId, sprintName, endDate) VALUES (?, ?, ?)',
        [1, 'sprint2', '2025-01-15']
      );

      const response = await request(app)
        .get('/courseProject/sprints')
        .query({ courseName: 'Test Course' })
        .expect(200);

      expect(response.body.length).toBe(3);
      // Check sorted
      for (let i = 0; i < response.body.length - 1; i++) {
        expect(new Date(response.body[i].endDate).getTime())
          .toBeLessThanOrEqual(new Date(response.body[i + 1].endDate).getTime());
      }
    });

    it('should include all sprint fields', async () => {
      const response = await request(app)
        .get('/courseProject/sprints')
        .query({ courseName: 'Test Course' })
        .expect(200);

      const sprint = response.body[0];
      expect(sprint).toHaveProperty('id');
      expect(sprint).toHaveProperty('courseId');
      expect(sprint).toHaveProperty('sprintName');
      expect(sprint).toHaveProperty('endDate');
    });
  });

  describe('POST /courseProject/standupsEmail', () => {
    beforeEach(async () => {
      await seedDatabase(db);
    });

    it('should send standup email with valid data', async () => {
      const standup = validStandup();
      const response = await request(app)
        .post('/courseProject/standupsEmail')
        .send(standup)
        .expect(200);

      expect(response.body.message).toBe('Standup email sent successfully');
    });

    it('should reject missing projectName', async () => {
      const response = await request(app)
        .post('/courseProject/standupsEmail')
        .send({
          userName: 'testuser',
          doneText: 'Done',
          plansText: 'Plans',
          challengesText: 'Challenges'
        })
        .expect(400);

      expect(response.body.message).toContain('No members in the project group');
    });

    it('should reject project with no members', async () => {
      await request(app)
        .post('/courseProject')
        .send({ courseId: 1, projectName: 'Empty Project' })
        .expect(201);

      const response = await request(app)
        .post('/courseProject/standupsEmail')
        .send({
          projectName: 'Empty Project',
          userName: 'testuser',
          doneText: 'Done',
          plansText: 'Plans',
          challengesText: 'Challenges'
        })
        .expect(400);

      expect(response.body.message).toBe('No members in the project group');
    });

    it('should work with all required fields', async () => {
      const response = await request(app)
        .post('/courseProject/standupsEmail')
        .send({
          projectName: 'Test Project',
          userName: 'testuser',
          doneText: 'Completed tasks',
          plansText: 'Future plans',
          challengesText: 'Current challenges'
        })
        .expect(200);

      expect(response.body.message).toBe('Standup email sent successfully');
    });
  });
});
