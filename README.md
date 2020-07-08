# nodejs-books-library
## Books Library Manager using NodeJS

> This is a simple project which involves the use of multiple tools for a NodeJS project.

### Different Tools/Packages used are
1. Bootstrap for the front-end templating
2. Express as the web-framework
3. MongoDB Atlas for the database.
4. Using MVC architecture ie uses Models, Views and Controllers to display/manage content.
5. Uses the PUG templating tool.
6. Uses multer for image uploads
7. mongoose to process mongoDB queries
8. express-validator for form validation

## Basic Usage
The project has the following models

1. Books
2. Categories
3. Authors
4. Copies

The book is a master data of the each Book. You may link multiple Categories to each book and assign an Author to each book.

We can create copies of a Book, and each Copy can then be Loaned out to readers/customers.

### Environment Variables

The project needs these 2 variables to be set in .env

1. MONGODB_URI - Your MongoDB connection string
2. PORT- The listening port for NodeJS Server(default:3000)
