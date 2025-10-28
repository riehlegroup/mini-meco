/**
 * Test data fixtures for API tests
 */

export const validUser = () => ({
  name: 'Valid User',
  email: 'valid@example.com',
  password: 'ValidPass123!',
});

export const validCourse = () => ({
  courseName: 'Software Engineering',
  semester: 'WS2024',
});

export const validProject = () => ({
  projectName: 'New Project',
  courseName: 'Test Course',
  courseId: 1,
});

export const weakPasswords = [
  'short',        // Too short
  'alllowercase', // No uppercase, no numbers
  'ALLUPPERCASE', // No lowercase, no numbers
  'NoNumbers',    // No numbers
  '12345678',     // No letters
];

export const invalidEmails = [
  'notanemail',
  'missing@domain',
  '@nodomain.com',
  'spaces in@email.com',
  '',
];

export const validHappinessMetric = () => ({
  projectName: 'Test Project',
  userEmail: 'test@test.com',
  happiness: 4,
  submissionDateId: 1,
});

export const validStandup = () => ({
  projectName: 'Test Project',
  userName: 'testuser',
  doneText: 'Completed authentication',
  plansText: 'Will work on API tests',
  challengesText: 'Need more test coverage',
});
