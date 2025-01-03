import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import session, { Session } from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import flash from "connect-flash";
import GoogleStrategy from "passport-google-oauth2";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;
const callBackURL = process.env.CALLBACK_URL || "http://localhost:3000/auth/google/new";

const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
        ? { rejectUnauthorized: false }
        : false  // Disable SSL if not required (this is for hosting on platforms like Render)
});

db.connect();

app.use(session({
    secret: "TOPSECRET",
    resave: false,
    saveUninitialized: true
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

async function bookCount() {
    const result = await db.query("SELECT * FROM items");
    return result.rows.length;
}

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM items ORDER BY id ASC");
        res.render("index.ejs", { book: result.rows, total: await bookCount(), user: req.user });
    } catch (error) {
        console.error(error);
    }
});

app.get("/about", async (req, res) => {
    res.render("about.ejs", { total: await bookCount(), user: req.user });
});

app.get("/book/:id/:name", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query("SELECT * FROM items WHERE id = $1", [id]);
        const reviewText = result.rows[0].review.replace(/\n/g, '<br>');

        res.render("review.ejs", {
            book: result.rows[0],
            review: reviewText,
            total: await bookCount(),
            user: req.user
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/register", async (req, res) => {
    res.render("register.ejs", { total: await bookCount() });
});

app.get("/login", async (req, res) => {
    res.render("login.ejs", {
        message: req.flash('error'),
        total: await bookCount(),
        user: req.user
    });
});

app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

app.get("/auth/google/new", passport.authenticate("google", {
    successRedirect: "/new-review",
    failureRedirect: "/login"
}));

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) console.log(err);
        res.redirect("/login");
    });
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
    if (req.isAuthenticated()) {
        res.render("new.ejs", { total: await bookCount(), user: req.user });
    } else {
        res.redirect("/login");
    }
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
            searchTerm: keywordTitleCase,
            user: req.user
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
                sortValue: sortValue,
                user: req.user
            });
        } else {
            const result = await db.query(`
            SELECT * FROM items ORDER BY rating DESC`);
            res.render("sort.ejs", {
                book: result.rows,
                total: await bookCount(),
                totalResult: result.rows.length,
                sortValue: sortValue,
                user: req.user
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
            genre: genreInput,
            user: req.user
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/register", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password
    const firstName = req.body.first;
    const lastName = req.body.last;

    try {
        const result = await db.query("SELECT email from users WHERE email = $1", [email]);
        if (result.rows.length > 0) {
            res.render("register.ejs", {
                message: `Email already exists. Try <a href="/login">logging in</a>.`,
                total: await bookCount()
            });
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                await db.query("INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)",
                    [firstName, lastName, email, hash]);
            });
            res.redirect("/login");
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/login');
        }
        req.login(user, (err) => {
            if (err) return next(err);
            return res.redirect('/new-review');

        });
    })(req, res, next);
});

passport.use(
    "google",
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callBackURL,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    }, async (accessToken, refreshToken, profile, cb) => {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);
            if (result.rows.length === 0) {
                const user = await db.query(`INSERT INTO users (firstname, lastname, email, password, photo) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                    [profile._json.given_name, profile._json.family_name, profile.email, "google-auth", profile._json.picture]
                );
                const userData = user.rows[0];
                return cb(null, userData);
            } else {
                return cb(null, result.rows[0]);
            }
        } catch (err) {
            console.log(err);
        }
    })
);

passport.use(
    "local",
    new Strategy(async function verify(username, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users where email = $1", [username]);

            if (result.rows.length > 0) {
                const user = result.rows[0];
                const hashedPassword = user.password;

                // Password Check
                bcrypt.compare(password, hashedPassword, (err, result) => {
                    if (err) {
                        console.log(err);
                        return cb(err);
                    } else {
                        if (result) {
                            return cb(null, user);
                        } else {
                            return cb(null, false, { message: "Wrong password, please try again." });
                        }
                    }
                });
            } else {
                return cb(null, false, { message: "User not found" });
            }
        } catch (err) {
            console.log(err);
        }
    }));

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
