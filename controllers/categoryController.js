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
  res.send("Not implemented: category update GET");
};

// Handle the updating of a Category on POST
exports.category_update_post = function (req, res, next) {
  res.send("Not implemented: category update POST");
};

// Display the Delete Category form on GET
exports.category_delete_get = function (req, res, next) {
  res.send("Not implemented: category delete GET");
};

// Handle the deleting of a Category on POST
exports.category_delete_post = function (req, res, next) {
  res.send("Not implemented: category delete POST");
};
