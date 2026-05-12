# Leave Booking Management API

## Overview

This project is a REST API for managing employee leave requests. It allows users to request leave, managers to approve or reject leave, and administrators to manage users, roles and manager relationships. 

The API was developed using TypeScript, Express, TypeORM and MySQL.

## Features

- JWT authentication
- Role-based authorisation
- User management
- Role management
- Manager/employee relationships
- Leave request creation
- Leave approval and rejection
- Leave cancellation
- Annual leave balance checking
- Overlapping leave validation
- Unit testing using Jest
- API testing using Postman


## Project Structure

src
├── controllers
├── entity
├── helpers
├── middleware
├── routes
├── types
├── data_source.ts
├── index.ts
├── userDTOToken.ts
└── server.ts

tests
├── Entities
├── Helpers
└── mocks

## Running the API

Start the development server with: npm run dev. Ensure that the SQL database is running beforehand (XAMPP used for this)

Use the http://localhost:8900

To run tests use npm test

Users must login first to recieve a JWT token, which they will use to verify their role. This role will allow access to different endpoints.