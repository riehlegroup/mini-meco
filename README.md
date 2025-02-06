# Winter 2024/25

See https://github.com/riehlegroup/mini-meco/wiki/How-to-contribute-to-Mini-Meco

----

Start of original documentation

# Mini-Meco Documentation

##### MASTER PROJECT

Friedrich-Alexander-Universität Erlangen-Nürnberg <br>
Faculty of Engineering, Department Computer Science <br>
Professorship for Open Source Software

Supervisor:<br>
Dr. Stefan BUCHNER, M.Sc.<br>
Prof. Dr. Dirk Riehle, M.B.A.


# Overview

Mini Meco is a software application designed to support teams using agile methodologies by providing simple tools for managing their projects. This application
is particularly relevant for courses such as AMOS (Agile Methods and Open Source), where students learn about agile methods and their applications. Furthermore, Mini Meco serves as a practical teaching example in the ADAP (Advanced Design and Programming) course, where it helps to illustrate advanced
design principles and programming practices. By integrating Mini Meco into these courses, students gain hands-on experience with agile tools and techniques,
enhancing their understanding of both agile methodologies and software design.


## Contents

- [1 Introduction](#1-introduction)
   - [1.1 Overview of the Application](#11-overview-of-the-application)
   - [1.2 Purpose and Goals](#12-purpose-and-goals)
   - [1.3 Features and Functionalities](#13-features-and-functionalities)
   - [1.4 Target Audience](#14-target-audience)
- [2 Getting Started](#2-getting-started)
   - [2.1 Prerequisites](#21-prerequisites)
   - [2.2 Installation Instructions](#22-installation-instructions)
   - [2.3 Setup and Configuration](#23-setup-and-configuration)
      - [2.3.1 Default User Credentials](#231-default-user-credentials)
   - [2.4 Running the Application Locally](#24-running-the-application-locally)
- [3 Architecture and Design](#3-architecture-and-design)
   - [3.1 Architecture Overview](#31-architecture-overview)
   - [3.2 Key Components](#32-key-components)
   - [3.3 Technology Stack](#33-technology-stack)
   - [3.4 Database Design](#34-database-design)
      - [3.4.1 Users Table](#341-users-table)
      - [3.4.2 Project Table](#342-project-table)
      - [3.4.3 Project Group Table](#343-project-group-table)
      - [3.4.4 User Projects Table](#344-user-projects-table)
      - [3.4.5 Sprints Table](#345-sprints-table)
      - [3.4.6 Happiness Table](#346-happiness-table)
      - [3.4.7 Entity-Relationship Diagram](#347-entity-relationship-diagram)
- [4 Codebase Overview](#4-codebase-overview)
   - [4.1 Repository Structure and Layout](#41-repository-structure-and-layout)
   - [4.2 Naming Conventions](#42-naming-conventions)
   - [4.3 Key Files and Directories](#43-key-files-and-directories)
- [5 API Documentation](#5-api-documentation)
   - [5.1 Overview of the API](#51-overview-of-the-api)
   - [5.2 Endpoints](#52-endpoints)
      - [5.2.1 Authentication Routes](#521-authentication-routes)
      - [5.2.2 Project Management Routes](#522-project-management-routes)
      - [5.2.3 Project Features Routes](#523-project-features-routes)
      - [5.2.4 Project Configuration Routes](#524-project-configuration-routes)
      - [5.2.5 Additional Routes](#525-additional-routes)
   - [5.3 Error Handling](#53-error-handling)
- [6 User Guides](#6-user-guides)
   - [6.1 Instructions for Using the Application](#61-instructions-for-using-the-application)
      - [6.1.1 Authentication](#611-authentication)
      - [6.1.2 Project Management](#612-project-management)
      - [6.1.3 Project Features](#613-project-features)
      - [6.1.4 Project Configuration](#614-project-configuration)
   - [6.2 Troubleshooting Tips](#62-troubleshooting-tips)
- [7 Development Guide](#7-development-guide)
   - [7.1 Setting Up the Development Environment](#71-setting-up-the-development-environment)
   - [7.2 Coding Standards and Best Practices](#72-coding-standards-and-best-practices)
   - [7.3 Testing](#73-testing)
   - [7.4 Debugging and Logging](#74-debugging-and-logging)
   - [7.5 Deployment Process](#75-deployment-process)
- [Appendices](#appendices)
   - [A Resources and Further Reading](#a-resources-and-further-reading)
   - [B Changelog](#b-changelog)



## 1 Introduction

### 1.1 Overview of the Application

Mini Meco is a software application designed to assist teams in implementing agile methodologies by offering straightforward tools for managing their projects.
It provides a practical solution for teams looking to streamline their workflow and improve project management through agile practices.

### 1.2 Purpose and Goals

The primary purpose of Mini Meco is to support agile teams with simple and effective project management tools, making it easier to adopt and execute agile
methodologies. Additionally, Mini Meco is used in educational settings to achieve two key goals: Firstly, it is integrated into the Agile Methods and Open Source
(AMOS) course to teach students about agile methods and their practical applications. Secondly, it serves as a teaching example in the Advanced Design
and Programming (ADAP) course, demonstrating advanced design principles and programming practices.

### 1.3 Features and Functionalities

- User authentication and authorization: Secure login and access control for users
- Project and project group management: Create, edit, and delete projects and project groups
- Join and leave projects: Ability for users to join or leave projects as needed
- Agile tools and metrics: Includes features like standup emails, happiness graphs, and code activity tracking
- User lifecycle management: Manage the user status throughout the project lifecycle
- Project configuration: Customize project settings to fit specific needs
- Data persistence: Utilizes SQLite for reliable and efficient data storage
- Application Programming Interface (API) for backend communication: Facilitates seamless integration and communication between the frontend and backend

### 1.4 Target Audience

Mini Meco is designed for several key audiences. It is ideal for agile teams in need of straightforward project management tools to facilitate agile practices. Addi-
tionally, it is targeted at students and educators in courses such as AMOS and ADAP, who require practical examples and tools to enhance their understanding of agile methodologies, software design, and programming. These audiences benefit from Mini Meco’s user-friendly interface and educational features, which support both learning and practical application.


## 2 Getting Started

### 2.1 Prerequisites

- Node.js (version v20.13.1 or higher)
- NPM (version 8.3.0 or higher)
- SQLite (version 3.45.3 or higher)
- A code editor (e.g., VSCode)

### 2.2 Installation Instructions

1. Clone the Repository
```
 git clone https://github.com/shumancheng/Mini-Meco.git
```
```
 cd Mini-Meco
```
2. Install Dependencies
```
 npm run install-all
```

### 2.3 Setup and Configuration

Environment Variables

1. Create a .env file in the server directory with the following:
```
EMAIL_USER_FAU=your_FAU_Email
EMAIL_PASS_FAU=your_FAU_Password
```
2. Create a .env file in the client directory with the following:
```
VITE_GITHUB_TOKEN=your_secret_token
```
Check GitHub documentation on Authentication for more information on generating a personal access token. <br>
You can find this in the section Account security under Manage personal access tokens <br>
[https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#personal-access-tokens-classic].

#### 2.3.1 Default User Credentials

Upon initializing the database, a default administrative user is created with the following credentials:

- Username: admin
- Email: sys@admin.org
- Password: helloworld<br>
Note: Upon first login, it is highly recommended to navigate to the settings page and change the password for security reasons.

### 2.4 Running the Application Locally

1. To run the project, use the following command:
```
npm run dev
```
This command will start both the frontend and backend development servers concurrently.<br>
2. Open your browser and navigate to [http://localhost:5173.](http://localhost:5173.)


## 3 Architecture and Design

### 3.1 Architecture Overview

- Frontend: Built with React and TypeScript, the frontend application interacts with the backend through REST APIs.
- Backend: The backend is a Node.js server that provides RESTful services and handling logic.
- Database: SQLite is used for data storage, leveraging SQL for querying and data manipulation.

### 3.2 Key Components

- React components: Reusable UI components such as buttons, input forms, and Drop-down list.
- The API layer: Handles HTTP requests and responses between the client and server.
- Middleware: Custom middleware for handling authentication and error logging.
- Database models: Represents entities like User, Project, etc., and provides CRUD operations.

### 3.3 Technology Stack

- Frontend: React, TypeScript
- Backend: Node.js, Express.js, TypeScript
- Database: SQLite
- Tools: Prettier, Cypress
- Frontend styling: CSS Modules, shadcn, Bootstrap, Tailwind

### 3.4 Database Design

The database for this application is powered by SQLite and follows a relational data model. The following tables represent the entities and relationships in the system.


#### 3.4.1 Users Table

Table Name: users <br>
Description: This table stores user account information, including credentials, statuses, and profile details.

| Column               | Type     | Constraints                    | Description                         |
|----------------------|----------|---------------------------------|-------------------------------------|
| id                   | INTEGER  | PRIMARY KEY, AUTOINCREMENT      | Unique identifier for each user     |
| name                 | TEXT     |                                 | Name of the user                    |
| githubUsername       | TEXT     |                                 | GitHub username of the user         |
| email                | TEXT     | UNIQUE, NOT NULL                | User’s email address                |
| status               | TEXT     | DEFAULT "unconfirmed", NOT NULL | Account status ("unconfirmed", etc.)|
| password             | TEXT     |                                 | Hashed password for authentication  |
| resetPasswordToken   | TEXT     |                                 | Token for resetting the password    |
| resetPasswordExpire  | INTEGER  |                                 | Expiry time for the password reset  |
| confirmEmailToken    | TEXT     |                                 | Token for confirming email address  |
| confirmEmailExpire   | INTEGER  |                                 | Expiry time for the confirmation token|


#### 3.4.2 Project Table

Table Name: project<br>
Description: This table stores information about the projects.

| Column              | Type     | Constraints               | Description               |
|---------------------|----------|---------------------------|---------------------------|
| id                  | INTEGER  | PRIMARY KEY, AUTOINCREMENT| Unique identifier for each project|
| projectName         | TEXT     |                           | Name of the project        |
| projectGroupName    | TEXT     |                           | Group name associated with the project|


#### 3.4.3 Project Group Table

Table Name: projectGroup<br>
Description: This table stores information about project groups for different semesters.

| Column              | Type     | Constraints               | Description               |
|---------------------|----------|---------------------------|---------------------------|
| id                  | INTEGER  | PRIMARY KEY, AUTOINCREMENT| Unique identifier for each project group|
| semester            | TEXT     |                           | Semester in which the group is active |
| projectGroupName    | TEXT     | UNIQUE                    | Name of the project group  |


#### 3.4.4 User Projects Table

Table Name: user_projects<br>
Description: This table maps users to projects, allowing a user to participate in multiple projects.

| Column              | Type     | Constraints                           | Description               |
|---------------------|----------|---------------------------------------|---------------------------|
| userEmail           | TEXT     | PRIMARY KEY, FOREIGN KEY (users.email)| Email of the user, linking to the users table |
| projectName         | TEXT     | PRIMARY KEY                           | Name of the project        |
| url                 | TEXT     |                                       | URL associated with the project |


#### 3.4.5 Sprints Table

Table Name: sprints<br>
Description:This table stores information about the sprints for project groups.

| Column              | Type     | Constraints               | Description               |
|---------------------|----------|---------------------------|---------------------------|
| id                  | INTEGER  | PRIMARY KEY, AUTOINCREMENT| Unique identifier for each sprint |
| projectGroupName    | TEXT     | NOT NULL                  | Group name associated with the sprint |
| sprintName          | TEXT     | NOT NULL                  | Name of the sprint         |
| endDate             | DATETIME | NOT NULL                  | End date of the sprint     |


#### 3.4.6 Happiness Table

Table Name: happiness<br>
Description:This table records the happiness levels of users during sprints.


| Column              | Type     | Constraints               | Description               |
|---------------------|----------|---------------------------|---------------------------|
| id                  | INTEGER  | PRIMARY KEY, AUTOINCREMENT| Unique identifier for each happiness record |
| projectGroupName    | TEXT     |                           | Group name associated with the happiness rating |
| projectName         | TEXT     |                           | Project name associated with the happiness rating |
| userEmail           | TEXT     |                           | Email of the user who provided the rating |
| happiness           | INTEGER  |                           | User’s happiness rating    |
| sprintName          | TEXT     |                           | Sprint associated with the rating |
| timestamp           | DATETIME | DEFAULT CURRENT_TIMESTAMP | Time when the rating was recorded |

#### 3.4.7 Entity-Relationship Diagram

The following diagram illustrates the relationships between the tables in the database schema.

<img width="709" alt="ER-Diagram" src="https://github.com/user-attachments/assets/32a7bc59-d335-42c2-86bf-4ff25521cd26">


## 4 Codebase Overview

### 4.1 Repository Structure and Layout

```plaintext
mini-meco
|-- client
|   |-- cypress
|   |-- public
|   |-- src
|   |   |-- assets
|   |   |-- components
|   |   |-- lib
|   |   |-- screens
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |-- index.html
|   |-- package.json
|   |-- postcss.config.js
|   |-- taiwind.config.js
|   |-- tsconfig.json
|   |-- vite.config.ts
|-- server
|   |-- src
|   |   |-- auth.ts
|   |   |-- database.ts
|   |   |-- projConfig.ts
|   |   |-- projFeat.ts
|   |   |-- projMgmt.ts
|   |   |-- server.ts
|   |-- myDatabase.db
|   |-- package.json
|   |-- tsconfig.json
|-- README.md
|-- package.json
```

Note: The structure shown above includes only the most important files and directories relevant to the project. Not all files are listed here.


### 4.2 Naming Conventions

1. File and folder naming
    - Use PascalCase for React components and TypeScript files: the first letter of each word capitalized.<br>
          - Example: Dashboard.tsx, ProjectAdmin.tsx
    - Use camelCase for utility files: starting with a lowercase letter.<br>
           - Example: projFeat.ts, projMgmt.ts
2. Variable and function naming
    - Use camelCase for variables and functions: starting with a lowercase letter.<br>
          - Example: sendConfirmationEmail(), handleNavigation()
    - Use descriptive names: Variable and function names should be meaningful, avoiding abbreviations unless they are widely accepted.<br>
          - Example: fetchProjectGroups() instead of fpg()
3. React components
    - Use App.tsx for component entry files: If a component is in its own folder, use App.tsx to export it, so that imports are cleaner.<br>
          - Example: import Dashboard from "./components/Dashboard";
4. CSS files
    - All the stylesheets match their component/file<br>
           - Example: LoginScreen.css is the stylesheet for LoginScreen.tsx
5. Test Files
    - Name test files after the component or function they test, with a Test.cy.ts suffix.<br>
          - Example: standupsTest.cy.ts, authTest.cy.ts
6. API Routes and Endpoints
    - Use camelCase for URL paths<br>
           - Example: /api/saveHappiness or /api/user/githubUsername


### 4.3 Key Files and Directories

- /client/src/App.tsx: Defines frontend API endpoints
- /client/src/components: Contains page-level components corresponding to different routes and rusable React components.
- /server/src/server.ts: Defines API endpoints and route handlers.
- /server/src/database.ts: Contains database tables.
- /server/src: Contains logic for handling HTTP requests.


## 5 API Documentation


This chapter outlines the API used in the project, providing details about the backend services, routes, and expected inputs and outputs. The backend server
is built using Node.js and Express, and the frontend is developed using React with TypeScript. The frontend typically runs at http://localhost:5173, and the
backend runs at http://localhost:3000.

### 5.1 Overview of the API

The backend API consists of multiple routes for authentication, project manage-
ment, configuration, and other features like sending emails, managing sprints, and
saving user happiness data. The API follows RESTful principles and supports
both GET and POST HTTP methods for interacting with resources.
Base URL
For all API requests, the base URL is:
```
http :// localhost :3000
```
### 5.2 Endpoints

#### 5.2.1 Authentication Routes


POST /user
Registers a new user to the system.

- Request Body:
```
{
    "name": "Test_User",
    "email": "test@fau.de",
    "password ": "password123"
}
```
- Response:
    - 200 OK: Registration successful.
    - 400 Bad Request: Validation errors or user already exists.
 
      
POST /session<br>
Logs a user into the system.
- Request Body:
```
{
    "email": "test@fau.de",
    "password ": "password123"
}
```
- Response:
    - 200 OK: User logged in successfully, returns a session token.
    - 401 Unauthorized: Incorrect credentials.

  
POST /user/password/forgotMail<br>
Initiates the password reset process by sending a password reset email.
- Request Body:
```
{
    "email": "test@fau.de"
}
```
- Response:
    - 200 OK: Password reset email sent.
    - 404 Not Found: User not found.

  
POST /user/password<br>
Resets the password for a user.
- Request Body:
```
{
    "token": "reset -token",
    "newPassword ": "newPassword123"
}
```
- Response:
    - 200 OK: Password reset successful.
    - 400 Bad Request: Invalid token or other validation errors.
  

POST /confirmEmail<br>
Confirms a user’s email after registration.

- Request Body:
```
{
    "token": "confirmation -token"
}
```
- Response:
    - 200 OK: Email confirmed successfully.
    - 400 Bad Request: Invalid or expired token.
 
      
POST /user/confirmation/trigger<br>
Resends the email confirmation link to a user.
- Request Body:
```
{
    "email": "test@fau.de"
}
```
- Response:
    - 200 OK: Confirmation email sent.
    - 404 Not Found: User not found.

#### 5.2.2 Project Management Routes

GET /semesters
Fetches available semesters for projects

- Response:
    - 200 OK: Returns a list of semesters.
    - 500 Internal Server Error: Database connection or query failure.
 
      
GET /course<br>
Fetches all project groups.
- Response:
    - 200 OK: Returns a list of project groups.
    - 500 Internal Server Error: Database failure.

  
GET /courseProject<br>
Fetches all projects.

- Response:
    - 200 OK: Returns a list of projects.
    - 500 Internal Server Error: Database failure.
 
      
POST /course<br>
Creates a new project group.
- Request Body:
```
{
    "semester ": "SS24",
    "projectGroupName ": "AMOS24"
}
```
- Response:
    - 201 Created: Project group created successfully.
    - 400 Bad Request: Invalid input data.

  
POST /courseProject<br>
Creates a new project under a project group.
- Request Body:
```
{
    "projectGroupName ": "AMOS24",
    "projectName ": "Example Project"
}
```
- Response:
    - 201 Created: Project created successfully.
    - 400 Bad Request: Invalid input data.


PUT /course<br>
Edits an existing project group.
- Request Body:
```
{
    "projectGroupName ": "AMOS24",
    "newSemester ": "WS2425",
    "newProjectGroupName ": "AMOS25"
}
```
- Response:
    - 200 OK: Project group updated.
    - 400 Bad Request: Validation errors.


PUT /courseProject<br>
Edits an existing project group.

- Request Body:
```
{
    "projectName ": "Example Project",
    "newProjectName ": "Cool Project",
    "newProjectGroupName ": "AMOS25"
}
```
- Response:
    - 200 OK: Project updated successfully.
    - 400 Bad Request: Validation errors.
 
  
GET /user/projects<br>
Fetches all projects associated with the current user.
- Response:
    - 200 OK: List of user-specific projects.
    - 500 Internal Server Error: Database error.

#### 5.2.3 Project Features Routes

POST /project/standupsEmail<br>
Sends a standups reminder email.

- Request Body:
```
{
    "projectName ": "Example Project",
    "userName ": "Test_User",
    "doneText ": "Finish Dashboard UI",
    "plansText ": "Update Database",
    "challengesText ": "Implement backend logic"
}
```
- Response:
    - 200 OK: Email sent successfully.
    - 500 Internal Server Error: Failure sending the email.
 

POST /courseProject/happiness<br>
Saves the happiness rating of a user.
- Request Body:
```
{
    "projectName ": "Example Project",
    "userEmail ": "test@fau.de",
    "happiness ": "2",
    "sprintName ": "sprint3"
}
```
- Response:
    - 200 OK: Happiness rating saved.
    - 400 Bad Request: Validation errors.


GET /courseProject/happiness<br>
Fetches happiness data for analysis.
- Response:
    - 200 OK: Returns happiness data.
    - 500 Internal Server Error: Database failure.

#### 5.2.4 Project Configuration Routes

POST /user/githubUsername<br>
Sets a GitHub username for a user profile.

- Request Body:
```
{
    "email": "test@fau.de",
    "newGithubUsername ": "test -Github"
}
```
- Response:
    - 200 OK: GitHub username added.
    - 400 Bad Request: Validation errors.
 
      
POST /user/{userMail}/email<br>
Changes the user’s email.
- Request Body:
```
{
    "oldEmail ": "test@fau.de",
    "newEmail ": "newTest@fau.de"
}
```
- Response:
    - 200 OK: Email updated.
    - 400 Bad Request: Validation errors.

  
POST /user/{userMail}/password<br>
Changes the user’s password.
- Request Body:
```
 {
    "email": "test@fau.de",
    "password ": "newPassword123"
}
```
- Response:
    - 200 OK: Password updated.
    - 400 Bad Request: Invalid old password or validation errors.

#### 5.2.5 Additional Routes

POST /user/status
Updates the status of a user.

- Request Body:
```
{
    "email": "test@fau.de",
    "status ": "confirmed"
}
```
- Response:
    - 200 OK: User status updated.
    - 400 Bad Request: Validation errors.
 
  
GET /user/status<br>
Fetches the current status of a user.
- Response:
    - 200 OK: User status data returned.
    - 500 Internal Server Error: Database error.

### 5.3 Error Handling

For all endpoints, common error responses include:

- 400 Bad Request: The request was invalid due to missing or invalid data.
- 500 Internal Server Error: There was a server-side error, likely due to database or application logic issues.


## 6 User Guides

### 6.1 Instructions for Using the Application

#### 6.1.1 Authentication

Registration and Log In

1. Register an Account: Navigate to the registration page, fill out the form, and click "Sign Up."
2. Email Validation: You will receive an email for "email confirmation." Check your inbox (and spam folder). Click the link to validate your email.
3. Log In: Use your credentials to log in.

Forgot Password

1. Click the Link: On the login page, click the "Forgot Password?" link.
2. Provide Email: You will be redirected to the "Forgot Password" page. Enter your email address.
3. Reset Password Email: Check your inbox for a reset password link.
4. Log In: Use your new credentials to log in.

#### 6.1.2 Project Management

Creating a Project Group

1. Navigate to the Project Admin Page: Click on the "Project Admin" link.
2. Create a Project Group: Click the "Add" button in the upper-right corner of the Project Group list. Fill out the form and click "Create."
3. View a Project Group: Select the semester from the dropdown menu to view the project groups under that semester.

Creating a Project

1. Navigate to the Project Admin Page: Click on the "Project Admin" link.
2. Create a Project: Click the "Add" button in the upper-right corner of the Project List. Fill out the form and click "Create."
3. View a Project: Select the project group from the dropdown menu to see the associated projects.

Editing a Project Group
1. Navigate to the Project Admin Page: Click on the "Project Admin" link.
2. Select a Project Group: Choose the semester from the dropdown menu to view the project groups.
3. Edit a Project Group: Click the "Edit" button next to the project group you wish to modify, make changes, and confirm.

Editing a Project

1. Navigate to the Project Admin Page: Click on the "Project Admin" link.
2. Select a Project: Choose the project group from the dropdown menu to view the projects.
3. Edit a Project: Click the "Edit" button next to the project you wish to modify, make changes, and confirm.

Joining a Project

1. Navigate to the Settings Page: Click on the "Settings" link.
2. Select a Project: From the dropdown menu under Project Lists, select the project group containing the project you wish to join.
3. Join a Project: Click the "Join" button next to the project, fill out the form, and confirm.

Leaving a Project
1. Navigate to the Settings Page: Click on the "Settings" link.
2. Select a Project: From the dropdown menu under Project Lists, select the project group containing the project you wish to leave.
3. Leave a Project: Click the "Leave" button next to the project, fill out the form, and confirm.


#### 6.1.3 Project Features

Sending a Standup Email

1. Select a Project: Choose the project you have joined from the "Projects" category on the dashboard.
2. Navigate to the Standups Page: Click on the "Standups" link.
3. Write the Content: Enter your updates for "Done," "Plans," and "Challenges."
4. Send the Standup Email: Click the "Send Email" button at the bottom of the page.

Creating a Sprint
1. Select a Project: Choose the project from the "Projects" category on the dashboard.
2. Navigate to the Happiness Page: Click on the "Happiness" link.
3. Open the Admin Tab: Select "Admin" from the tab options.
4. Select a Project Group: Use the dropdown menu above the calendar to select the project group.
5. Create a Sprint: Click on a date in the calendar, choose the time, and click the "Save" button.

Entering Happiness Index
1. Select a Project: Choose the project from the "Projects" category on the dashboard.
2. Navigate to the Happiness Page: Click on the "Happiness" link.
3. Open the User Tab: Select "User" from the tab options.
4. Select Happiness Index: Move the slider to your desired happiness level and click "Confirm."

Displaying Happiness Graph
1. Select a Project: Choose the project from the "Projects" category on the dashboard.
2. Navigate to the Happiness Page: Click on the "Happiness" link.
3. Open the Display Tab: Select "Display" from the tab options to view the happiness graph.

Displaying Code Activity Graph

1. Select a Project: Choose the project from the "Projects" category on thedashboard.
2. Navigate to the Code Activity Page: Click on the "Code Activity"link to view the graph.

#### 6.1.4 Project Configuration

Changing Email

1. Navigate to the Settings Page: Click on the "Settings" link.
2. Change Email: Click the "Edit" button next to the email field, update your email, and click "Change."

Changing Password
1. Navigate to the Settings Page: Click on the "Settings" link.
2. Change Password: Click the "Edit" button next to the password field, enter your new password, and click "Change."

Adding or Changing GitHub Username
1. Navigate to the Settings Page: Click on the "Settings" link.
2. Add or Change GitHub Username: Click the "Edit" button next to the GitHub username field, enter your username, and click "Save."

Adding or Changing GitHub URL
1. Navigate to the Project Config Page: Click on the "Project Config" link.
2. Select a Project: Choose the project from the dropdown menu.
3. Add or Change GitHub URL: Click the "Edit" button next to the GitHub URL field, enter the new URL, and click "Change."

### 6.2 Troubleshooting Tips

- Cannot Log In: Ensure your username and password are correct. If you forgot your password, use the "Forgot Password" link to reset it.
- Did Not Receive Email Confirmation: Check your spam/junk folder. If you still don’t see it, contact the system administrator to resend the email.
- Code Activity Graph Not Displaying: Ensure that your project has a GitHub URL configured, and that you have added your GitHub username on the settings page.


## 7 Development Guide

### 7.1 Setting Up the Development Environment

1. Clone the Repository: Follow the instructions in the Getting Started section.
2. Environment Variables: Set up your .env file as described earlier.
3. Run Development Servers: Start the backend and frontend as described.

### 7.2 Coding Standards and Best Practices

1. Use TypeScript for type safety and clarity.
2. Use Prettier for code formatting.
3. Write end-to-end tests using Cypress.

### 7.3 Testing

End-to-end Tests: Run with "npx cypress run" and "npx cypress open" in the
client directory.

### 7.4 Debugging and Logging

- Client-Side Debugging: Use the browser’s developer tools for inspecting components and network requests.
- Server-Side Debugging: Use console.log() for quick debugging or attach a debugger to the Node.js process.

### 7.5 Deployment Process

1. Install Dependencies: This command will install all the necessary depend-
    encies for both the client and server.
```
npm run install -all
```
2. Build Project: This command will compile the TypeScript code and build
    both the client and server projects.
```
npm run build -all
```
3. Run Development Servers: This command will start both the frontend and
    backend servers in development mode using concurrently.
```
npm run dev
```
4. Run Production Servers: This command will start both the frontend and
    backend servers in production mode using concurrently.
```
npm start
```


## Appendices


### A Resources and Further Reading

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [GitHub Documentation](https://docs.github.com/en)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)



### B Changelog

- v1.0.0: Initial release


