# Book Review Website

This is a web application that allows users to review books, browse reviews, and read about different books. Users can search, sort, and filter books by genre and other criteria. The application is built using **Node.js**, **Express**, **EJS** templating, and **PostgreSQL** as the database. (https://thynk-book.onrender.com)

## Features

- **Book Display**: Browse a list of books and view reviews.
- **Book Details**: Detailed information and reviews for individual books.
- **Add New Review**: Add new book reviews, including title, author, ISBN, genre, and rating.
- **Edit Review**: Update existing reviews.
- **Search**: Find books by title, author, or genre.
- **Sort Books**: Sort by title (A-Z) or rating (high to low).
- **Genre Filter**: Filter books based on selected genres.

## Project Setup

### Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- Basic knowledge of SQL for creating tables and inserting data

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Novavamp/book-review-website
   cd book-review-website
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure PostgreSQL Database**:

   - Create a new PostgreSQL database named `books`.
   - Create a table called `items` with columns for book information (ISBN, title, author, genre, review, and rating).
   - Create a table called `users` with columns for user data (first name, last name, email, password, and photo).

   Example SQL command for table creation:

   ```sql
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
      email VARCHAR(45) UNIQUE NOT NUL,
      password VARCHAR(100),
      photo TEXT
   );
   ```

4. **Add Environment Variables**:

   Create a `.env` file in the root directory with the following content (replace the placeholder with actual credentials):

   ```plaintext
   DATABASE_URL=postgres://postgres:your-password@localhost:5432/books
   ```

5. **Start the Server**:

   ```bash
   node app.js
   ```

   The application will be available at `http://localhost:3000`.

### Usage

1. **Home Page (`/`)**: Displays a list of books with reviews.
2. **About Page (`/about`)**: Shows the total number of books.
3. **Book Details (`/book/:id/:name`)**: Displays a specific book’s details and review.
4. **Add New Review (`/new-review`)**: Form to add a new book review.
5. **Search**: Find books by keywords in title, author, or genre.
6. **Sort**: Sort books by title or rating.
7. **Genre Filter**: Filter books by genre tags or genre search input.

## Code Overview

### Server and Database Setup

- **Express Server**: Configured with `express` and `body-parser` for form data handling.
- **Database Connection**: Connects to PostgreSQL using `pg.Client`. Queries interact with book data as needed.

### Routes

1. **GET `/`**: Displays all books on the homepage.
2. **GET `/about`**: Shows the "About" page with the book count.
3. **GET `/book/:id/:name`**: Displays specific book details.
4. **POST `/edit`**: Updates book details.
5. **GET `/new-review`**: Form for adding a new review.
6. **POST `/new`**: Inserts a new review.
7. **POST `/s`**: Searches for books based on keywords.
8. **POST `/sort`**: Sorts books by title or rating.
9. **POST `/genre`**: Filters books by genre.

### Helper Functions

- **bookCount()**: Counts total books in the database, used across various routes.

## Dependencies

- **express**: Web framework.
- **body-parser**: Middleware to parse form data.
- **pg**: PostgreSQL client for database management.
- **EJS**: Templating engine for dynamic HTML rendering.

## Folder Structure

```
├── public           # Static assets (CSS, images, etc.)
├── views            # EJS templates for pages
├── app.js           # Main application file
├── .env             # Environment variables (database URL)
├── package.json     # Project configuration
└── README.md        # Documentation
```

## Security Note

- Protect sensitive database credentials by using environment variables.

## License

This project is licensed under the MIT License.
