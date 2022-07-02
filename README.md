# PC Part Picker (P-Cubed)
A CRUD PC hardware catalog built on Express.js and MongoDB, hosted on Heroku.

PC Part Picker allows users to add PC parts, manufacturers, and categories, and allows them to add these parts to a list to plan out their build. The total dollar amount is displayed and links are provided to purchase these parts.

Users can create, read, update and delete PC parts, manufacturers and categories. Additionally, users can upload images for each PC part.

### [Live Demo](https://tragically-leaf-51585.herokuapp.com/list)

### Desktop
![Desktop View 1](https://tragically-leaf-51585.herokuapp.com/images/desktop-view1.png)

![Desktop View 2](https://tragically-leaf-51585.herokuapp.com/images/desktop-view2.png)

### Mobile
![Mobile View 1](https://tragically-leaf-51585.herokuapp.com/images/mobile-view1.png)

![Mobile View 2](https://tragically-leaf-51585.herokuapp.com/images/mobile-view2.png)

## Overview

I built this CRUD app to get familiar with the following concepts:

- Express.js: routing based on http requests.
- Mongoose: modeling, storing and accessing MongoDB documents.
- [Pug.js](https://pugjs.org/api/getting-started.html): using a templating engine for the front-end.
- Deploying an Express app to [Heroku](https://www.heroku.com/).
- Using environment variables to protect sensitive info (DB credentials, Admin Password).
- Requiring an Admin Password for UPDATE and DELETE operations on the DB.
- Handling file uploads using the [multer](http://expressjs.com/en/resources/middleware/multer.html) middleware.

### Tech used

- [Heroku](https://www.heroku.com/) for hosting.
- [npm](https://www.npmjs.com/) for dependencies.
- [Express.js](http://expressjs.com/) for serving and middleware.
- [Mongoose ODM](https://mongoosejs.com/) for the backend.
- [Pug.js](https://pugjs.org/api/getting-started.html) for the frontend.
- [multer](http://expressjs.com/en/resources/middleware/multer.html) for file-uploading.
