-- Create database
CREATE DATABASE book_review_db;

-- Connect to the database
\c book_review_db;

-- Create tables
CREATE TABLE items (
   id SERIAL PRIMARY KEY,
   isbn VARCHAR(25) UNIQUE,
   author VARCHAR(100),
   genre VARCHAR(50),
   title VARCHAR(100),
   review TEXT,
   rating INT
);

CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   firstname VARCHAR(45),
   lastname VARCHAR(45),
   email VARCHAR(45) UNIQUE NOT NULL,
   password VARCHAR(100),
   photo TEXT
);
