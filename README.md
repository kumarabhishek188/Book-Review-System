# Book Review Website

This is a web application that allows users to review books, browse reviews, and read about different books. Users can also search, sort, and filter books by genres. The application is built using **Node.js**, **Express**, **EJS** templating, and **PostgreSQL** as the database.

## Features

- **Book Display**: Users can browse a list of books and see reviews.
- **Book Details**: View detailed information and reviews about a book.
- **Add New Review**: Users can add new book reviews, including title, author, ISBN, genre, and rating.
- **Edit Review**: Users can edit existing reviews.
- **Search**: Users can search for books by title, author, or genre.
- **Sort Books**: Sort books by title (A-Z) or rating (high to low).
- **Genre Filter**: Filter books based on selected genre tags or genre search input.

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
   - Create a table called `items` with columns to store book information (ISBN, title, author, genre, review, and rating).
   - Set up a PostgreSQL user with access to the database.

   Example SQL command for table creation:

   ```sql
   CREATE TABLE items (
       id SERIAL PRIMARY KEY,
       isbn VARCHAR(25) UNIQUE,
       title VARCHAR(255),
       author VARCHAR(255),
       genre VARCHAR(100),
       review TEXT,
       rating INT
   );
   ```

4. **Update Database Credentials**: Open the code and update the database connection configuration in the following part:

   ```javascript
   const db = new pg.Client({
   	user: "postgres",
   	host: "localhost",
   	database: "books",
   	password: "your-password",
   	port: 5432,
   });
   ```

5. **Start the Server**:
   ```bash
   node app.js
   ```
   Your application will run on `http://localhost:3000`.

### Usage

1. **Home Page (`/`)**: Displays a list of books with their reviews.
2. **About Page (`/about`)**: Shows a summary of the total number of books in the collection.
3. **Book Details (`/book/:id/:name`)**: Displays the review and details of a specific book.
4. **Add New Review (`/new-review`)**: Access the form to submit a new book review.
5. **Search**: Enter keywords in the search bar to find books by title, author, or genre.
6. **Sort**: Use sorting options to arrange books by title or rating.
7. **Genre Filter**: Select or search a genre to filter the book list.

## Code Overview

### Server and Database Setup

- **Express Server**: Set up with `express` and `body-parser` for handling form data.
- **Database Connection**: Connected to PostgreSQL via `pg.Client`. Each database query retrieves or updates book data as needed.

### Routes

1. **GET `/`**: Retrieves all books from the database and renders them on the homepage.
2. **GET `/about`**: Renders the "About" page with the total count of books.
3. **GET `/book/:id/:name`**: Retrieves a specific book’s details based on its ID and displays it.
4. **POST `/edit`**: Updates a book's details based on the form data provided.
5. **GET `/new-review`**: Renders the form for submitting a new review.
6. **POST `/new`**: Inserts a new book review into the database.
7. **POST `/s`**: Searches the database for books matching the given keywords.
8. **POST `/sort`**: Sorts books based on either title or rating.
9. **POST `/genre`**: Filters books by genre based on user input.

### Helper Functions

- **bookCount()**: Calculates the total number of books in the database, used across various routes for display purposes.

## Dependencies

- **express**: Web framework for setting up the server and handling routes.
- **body-parser**: Middleware to parse incoming form data.
- **pg**: PostgreSQL client for Node.js to manage database operations.
- **EJS**: Templating engine for rendering dynamic HTML content.

## Folder Structure

```
├── public           # Static assets (CSS, images, etc.)
├── views            # EJS templates for different pages
├── app.js           # Main application file with routes and server setup
├── package.json     # Project configuration and dependencies
└── README.md        # Project documentation
```

## Security Note

- Ensure sensitive database credentials are protected. You may use environment variables to store credentials securely.

## License

This project is licensed under the MIT License.
