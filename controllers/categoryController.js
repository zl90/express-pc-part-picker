const express = require("express");
const Category = require("../models/category");
const Component = require("../models/component");

// Display list of all categories.
exports.category_list = function (req, res, next) {
  // Query the db for all Category names
  Category.find({}, "name").exec((err, results) => {
    if (err) {
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

  // Asyncronously find the data in the DB using both promises, then process the results.
  Promise.all([findCategoryById, findComponentsByCategory])
    .then((results) => {
      // Success, render the category info
      res.render("category_detail", {
        title: results[0].name,
        description: results[0].description,
        component_list: results[1],
      });
    })
    .catch((err) => {
      return next(err);
    });
};

// Display the Create Category form on GET
exports.category_create_get = function (req, res, next) {
  res.send("Not implemented: category create GET");
};

// Handle the creation of a new Category on POST
exports.category_create_post = function (req, res, next) {
  res.send("Not implemented: category create POST");
};

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
