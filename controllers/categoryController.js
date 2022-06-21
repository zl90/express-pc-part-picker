const express = require("express");
const Category = require("../models/category");

// Display list of all categories.
exports.category_list = function (req, res, next) {
  res.send("Not implemented: category list GET");
};

// Display individual category info, based on ID
exports.category_detail = function (req, res, next) {
  res.send("Not implemented: category detail GET");
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
