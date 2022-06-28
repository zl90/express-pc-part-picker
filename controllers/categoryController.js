const express = require("express");
const Category = require("../models/category");
const Component = require("../models/component");
const { body, validationResult } = require("express-validator");

// Display list of all categories.
exports.category_list = function (req, res, next) {
  // Query the db for all Category names
  Category.find({}, "name").exec((err, results) => {
    if (err) {
      // Found some error, pass it on to the error-handler middleware function
      return next(err);
    }
    // Success, render the list of categories
    res.render("category_list", {
      title: "All Categories",
      category_names: results,
    });
  });
};

// Display individual category info, based on ID
exports.category_detail = function (req, res, next) {
  // This promise finds a specific Category, from the category ID in the URL parameter
  const findCategoryById = new Promise((resolve, reject) => {
    Category.findById(req.params.categoryid).exec((err, results) => {
      // Check for query/db errors
      if (err) {
        reject(err);
      }

      if (results === null) {
        // No results returned from query, show error
        const err = new Error("Category not found");
        err.status = 404;
        reject(err);
      }

      // Success, return Category info
      resolve(results);
    });
  });

  // This promise finds all PC Components which have the Category defined by the category ID
  const findComponentsByCategory = new Promise((resolve, reject) => {
    Component.find({ category: req.params.categoryid })
      .populate("category")
      .populate("manufacturer")
      .exec((err, results) => {
        // Check for query/db errors
        if (err) {
          reject(err);
        }
        // Success, return all Components corresponding to categoryid
        resolve(results);
      });
  });

  // Asyncronously query the DB using both promises, then process the results.
  Promise.all([findCategoryById, findComponentsByCategory])
    .then((results) => {
      // Success, render the category info
      res.render("category_detail", {
        title: results[0].name,
        description: results[0].description,
        component_list: results[1],
        category: results[0],
      });
    })
    .catch((err) => {
      // Found some error, pass it on to the error-handler middleware function
      return next(err);
    });
};

// Display the Create Category form on GET
exports.category_create_get = function (req, res, next) {
  // Just render the Create Category form.
  // Let the form know that it's not updating an existing Category, so display an empty form.
  res.render("category_form", {
    title: "Add new Category",
    isUpdating: false,
  });
};

// Handle the creation of a new Category on POST
exports.category_create_post = [
  // Validate and sanitize the POST request values (The user inputs 'name' and 'description' values)
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be 1-100 characters long")
    .escape(),
  body("description")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Description must be 1-1000 characters long")
    .escape(),

  function (req, res, next) {
    // Extract the validation errors from the POST request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the Create Category form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Add new Category",
        category: req.body,
        isUpdating: false,
        errors: errors.array(),
      });
      return;
    } else {
      // No validation errors, save the new Category to the db

      // First, check if the new Category already exists in the db:
      Category.findOne({ name: req.body.name }).exec((err, results) => {
        // check for db/query errors
        if (err) {
          return next(err);
        }

        if (results !== null) {
          // Category already exists in the db, redirect to it's Detail page
          res.redirect(results.url);
        } else {
          // Category doesn't exist already, proceed to save it to the db

          // Create the new Category instance with escaped and trimmed data:
          const newCategory = new Category({
            name: req.body.name,
            description: req.body.description,
          });

          // Save new Category to the db using Mongoose:
          newCategory.save(function (err) {
            // check for db/query errors
            if (err) {
              return next(err);
            }

            // Category successfully saved. Redirect to it's Detail page
            res.redirect(newCategory.url);
          });
        }
      });
    }
  },
];

// Display the Update Category form on GET (similar to Create Category)
exports.category_update_get = function (req, res, next) {
  /**
   * queries the db for a Category which has the ID supplied in the URL
   */
  Category.findById(req.params.categoryid).exec((err, results) => {
    // check for db/query errors
    if (err) {
      reject(err);
    }

    if (results === null) {
      // No results returned from query, show error
      const err = new Error("Category not found");
      err.status = 404;
      reject(err);
    }

    // Success, render the update form
    // Let the form know that it's updating an existing Category, so display a pre-filled form.
    res.render("category_form", {
      title: "Update: " + results.name,
      isUpdating: true,
      category: results,
    });
  });
};

// Handle the updating of a Category on POST
exports.category_update_post = [
  // Validate and sanitize the POST request values (The user inputs 'name' and 'description' values)
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be 1-100 characters long")
    .escape(),
  body("description")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Description must be 1-1000 characters long")
    .escape(),
  body("password")
    .equals(process.env.ADMIN_PASSWORD)
    .withMessage("Incorrect Password"),

  function (req, res, next) {
    // Extract the validation errors from the POST request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the Update Category form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Update: " + req.body.name,
        category: req.body,
        isUpdating: true,
        errors: errors.array(),
      });
      return;
    } else {
      // No validation errors, update the Category in the db
      // Create a temporary Category instance with escaped and trimmed data:
      const newCategory = new Category({
        name: req.body.name,
        description: req.body.description,
        _id: req.params.categoryid, // This is required, or a new ID will be assigned!
      });

      // Overwrite the old category in the db with the temporary category using Mongoose:
      Category.findByIdAndUpdate(
        req.params.categoryid,
        newCategory,
        {},
        (update_errors, updated_category) => {
          // check db/query errors
          if (update_errors) {
            return next(update_errors);
          }
          // Category successfully updated. Redirect to its Detail page
          res.redirect(updated_category.url);
        }
      );
    }
  },
];

// Display the Delete Category form on GET
exports.category_delete_get = function (req, res, next) {
  // This promise finds a specific Category, from the category ID in the URL parameter
  const findCategoryById = new Promise((resolve, reject) => {
    Category.findById(req.params.categoryid).exec((err, results) => {
      // Check for query/db errors
      if (err) {
        reject(err);
      }

      if (results === null) {
        // No results returned from query, show error
        const err = new Error("Category not found");
        err.status = 404;
        reject(err);
      }

      // Success, return Category info
      resolve(results);
    });
  });

  // This promise finds all PC Components which have the Category defined by the category ID
  const findComponentsByCategory = new Promise((resolve, reject) => {
    Component.find({ category: req.params.categoryid })
      .populate("category")
      .populate("manufacturer")
      .exec((err, results) => {
        // Check for query/db errors
        if (err) {
          reject(err);
        }
        // Success, return all Components corresponding to categoryid
        resolve(results);
      });
  });

  // Asyncronously query the DB using both promises, then process the results.
  Promise.all([findCategoryById, findComponentsByCategory])
    .then((results) => {
      // Success, render the Delete Category page
      res.render("category_delete", {
        title: "Delete Category:\n" + results[0].name,
        description: results[0].description,
        component_list: results[1],
        category: results[0],
      });
    })
    .catch((err) => {
      // Found some error, pass it on to the error-handler middleware function
      return next(err);
    });
};

// Handle the deleting of a Category on POST
exports.category_delete_post = function (req, res, next) {
  // This promise finds a specific Category, from the category ID in the URL parameter
  const findCategoryById = new Promise((resolve, reject) => {
    Category.findById(req.params.categoryid).exec((err, results) => {
      // Check for query/db errors
      if (err) {
        reject(err);
      }

      if (results === null) {
        // No results returned from query, show error
        const err = new Error("Category not found");
        err.status = 404;
        reject(err);
      }

      // Success, return Category info
      resolve(results);
    });
  });

  // This promise finds all PC Components which have the Category defined by the category ID
  const findComponentsByCategory = new Promise((resolve, reject) => {
    Component.find({ category: req.params.categoryid })
      .populate("category")
      .populate("manufacturer")
      .exec((err, results) => {
        // Check for query/db errors
        if (err) {
          reject(err);
        }
        // Success, return all Components corresponding to categoryid
        resolve(results);
      });
  });

  // Asyncronously query the DB using both promises, then process the results.
  Promise.all([findCategoryById, findComponentsByCategory])
    .then((results) => {
      // Check one last time for any components which depend on this category
      if (results[1].length > 0) {
        // Dependents found, go back to the category delete page
        res.render("category_delete", {
          title: "Delete Category:\n" + results[0].name,
          description: results[0].description,
          component_list: results[1],
          category: results[0],
        });
        return;
      } else {
        // Check password
        if (req.body.password !== process.env.ADMIN_PASSWORD) {
          // if password doesn't match, go back to the category delete page with errors
          const errors = [new Error("Password")];
          errors[0].msg = "Incorrect Password";
          res.render("category_delete", {
            title: "Delete Category:\n" + results[0].name,
            description: results[0].description,
            component_list: results[1],
            category: results[0],
            errors: errors,
          });
          return;
        }

        // No dependents found. Delete this category
        Category.findByIdAndRemove(req.params.categoryid).exec((error) => {
          // check db/query errors
          if (error) {
            return next(error);
          }

          // Delete associated cookie
          res.clearCookie(req.params.categoryid);

          // Success, Category has been deleted. Redirect to the list of Categoeis:
          res.redirect("/categories");
        });
      }
    })
    .catch((err) => {
      // Found some error, pass it on to the error-handler middleware function
      return next(err);
    });
};
