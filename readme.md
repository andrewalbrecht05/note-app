# 📝 Notenizer

**Notenizer** is a web service designed to facilitate the creation, editing, deletion, and storage of notes. This
project encompasses both the server-side and client-side components, ensuring a structured and consistent database as
well as the security of user data.
 

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Notenizer is an information system intended for convenient management of notes, allowing users to easily create, store,
and organize their records. The system aims to provide reliable and secure data storage along with an intuitive
interface for user interaction.

## Features

- 🖊️ Create, edit, and delete notes
- 🏷️ Organize notes with tags and categories
- 🔒 Secure user authentication and authorization
- 🔄 Synchronization across multiple devices
- 📱 Responsive and interactive user interface

## Technologies Used

### Front-End

- 🌐 JavaScript: Programming language for creating dynamic web content.
- ⚛️ React: Library for building user interfaces, enabling the development of single-page applications (SPA).
- 🖥️ HTML & CSS: Standard technologies for structuring and styling web pages.

### Back-End

- 🦀 Rust: System programming language focusing on safety and performance.
- 🕸️ Axum: Web framework for building APIs in Rust.
- 🗄️ PostgreSQL: Object-relational database system for reliable data storage.
- 🛡️ JWT (JSON Web Token): For secure user authentication.

## Installation

### Prerequisites

- Node.js and npm
- Rust and Cargo
- PostgreSQL

### Steps

1. **Clone the repository:**

```bash
git clone https://github.com/andrewalbrecht05/note-app.git
cd note-app
```

2. **Install front-end dependencies:**

```bash
cd app
npm install
```
3. **Set up PostgreSQL database:**

```bash
sudo -u postgres psql
CREATE DATABASE notenizer;
```
4. **Configure the environment variables:**

Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL=postgres://user:password@localhost/notenizer
JWT_SECRET=your_secret_key
```

5. **Build and run the server:**

```bash
cargo run
```

6. **Run the front-end application:**

```bash
cd app
npm start
```

## Usage

Open your web browser and navigate to `http://localhost:3000` to start using Notenizer. You can create an account, log in,
and start managing your notes.

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate a user and return a JWT.
- `POST /api/auth/logout`: Logout a user.

### Notes

- `GET /api/notes`: Retrieve all notes for the authenticated user.
- `POST /api/notes`: Create a new note.
- `PATCH /api/notes/:id`: Update an existing note.
- `DELETE /api/notes/:id`: Delete a note.

## Contributing

Contributions are welcome! Please follow these steps:

1. 🍴 Fork the repository.
2. 🌿 Create a new branch.
3. 💻 Make your changes.
4. 📤 Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LISENCE) file for details.