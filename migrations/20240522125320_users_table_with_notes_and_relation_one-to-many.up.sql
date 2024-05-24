-- Add up migration script here

-- Ensure the uuid-ossp extension is available for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the notes table
CREATE TABLE "notes" (
     id UUID NOT NULL PRIMARY KEY DEFAULT (uuid_generate_v4()),
     author_id UUID NOT NULL,
     author_name VARCHAR(100) NOT NULL,
     title VARCHAR(255) NOT NULL,
     text TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     CONSTRAINT fk_author
         FOREIGN KEY(author_id)
             REFERENCES users(id)
             ON DELETE CASCADE
);

-- Create an index on author_id for faster lookup
CREATE INDEX notes_author_id_idx ON notes (author_id);
