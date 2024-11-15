import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
        ? { rejectUnauthorized: false }
        : false  // Disable SSL if not required (this is for hosting on platforms like Render)
});

// ALTERNATIVE WAY TO CONNECT TO THE DATABASE LOCALLY
// const db = new pg.Client({
//     user: "postgres",
//     host: "localhost",
//     database: "books",
//     password: "your-password",
//     port: 5432,
// });

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

async function bookCount() {
    const result = await db.query("SELECT * FROM items");
    return result.rows.length;
}

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM items ORDER BY id ASC");
        res.render("index.ejs", { book: result.rows, total: await bookCount() });
    } catch (error) {
        console.error(error);
    }
});

app.get("/about", async (req, res) => {
    res.render("about.ejs", { total: await bookCount() });
});

app.get("/book/:id/:name", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query("SELECT * FROM items WHERE id = $1", [id]);
        const reviewText = result.rows[0].review.replace(/\n/g, '<br>');

        res.render("review.ejs", {
            book: result.rows[0],
            review: reviewText,
            total: await bookCount()
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/edit", async (req, res) => {
    const editedReview = req.body.review;
    const id = parseInt(req.body.updatedItemId);
    const title = req.body.title;
    const author = req.body.author;
    const isbn = req.body.isbn;
    const genre = req.body.genre;
    const rating = req.body.rating;

    try {
        await db.query(`UPDATE items 
            SET isbn = $1, 
            author = $2,
            genre = $3, 
            title = $4, 
            review = $5 ,
            rating = $6
            WHERE id = $7`,
            [isbn, author, genre, title, editedReview, rating, id]);
        res.redirect(`/book/${id}/edited`);
    } catch (err) {
        console.log(err);
    }
});

app.get("/new-review", async (req, res) => {
    res.render("new.ejs", { total: await bookCount() });
});

app.post("/new", async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const review = req.body.review;
    const isbn = req.body.isbn;
    const genre = req.body.genre;
    const rating = req.body.rating;

    try {
        const result = await db.query(`INSERT INTO items 
        (isbn, author, genre, title, review, rating) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [isbn, author, genre, title, review, rating]
        );
        const id = result.rows[0].id;
        res.redirect(`/book/${id}/success`);
    } catch (err) {
        console.log(err);
    }
});

app.post("/s", async (req, res) => {
    const searchKeyword = req.body.search.toLowerCase().trim();
    const keywordTitleCase = searchKeyword.slice(0, 1).toUpperCase()
        + searchKeyword.slice(1, searchKeyword.length).toLowerCase();

    try {
        const result = await db.query(`
            SELECT * FROM items
            WHERE LOWER(author) LIKE '%' || $1 || '%' 
                OR LOWER(title) LIKE '%' || $2 || '%'
                OR LOWER(genre) LIKE '%' || $3 || '%';
            `, [searchKeyword, searchKeyword, searchKeyword]);
        res.render("search.ejs", {
            book: result.rows,
            total: await bookCount(),
            totalResult: result.rows.length,
            searchTerm: keywordTitleCase
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/sort", async (req, res) => {
    const sortValue = req.body.sort;

    try {
        if (sortValue === 'Name (A-Z)') {
            const result = await db.query(`
            SELECT * FROM items ORDER BY title ASC`);
            res.render("sort.ejs", {
                book: result.rows,
                total: await bookCount(),
                totalResult: result.rows.length,
                sortValue: sortValue
            });
        } else {
            const result = await db.query(`
            SELECT * FROM items ORDER BY rating DESC`);
            res.render("sort.ejs", {
                book: result.rows,
                total: await bookCount(),
                totalResult: result.rows.length,
                sortValue: sortValue
            });
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/genre", async (req, res) => {
    const genreSearch = req.body.genre;
    const genreTag = req.body.genreTag;

    let genreInput = "";

    if (genreTag && !genreSearch) {
        genreInput = genreTag;
    } else if (genreSearch && !genreTag) {
        genreInput = genreSearch;
    }

    try {
        const result = await db.query(`
            SELECT * FROM items
            WHERE LOWER(genre) LIKE '%' || $1 || '%'`,
            [genreInput.toLowerCase()]
        );
        res.render("genre.ejs", {
            book: result.rows,
            total: await bookCount(),
            totalResult: result.rows.length,
            genre: genreInput
        });
    } catch (err) {
        console.log(err);
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});