const express = require("express");
const Component = require("../models/component");
const Manufacturer = require("../models/manufacturer");
const Category = require("../models/category");

// Display a list of all PC components
exports.component_list = function (req, res, next) {
  // Query the db for all PC components
  Component.find()
    .populate("manufacturer")
    .populate("category")
    .exec((err, results) => {
      if (err) {
        return next(err);
      }
      // Success, render the list of PC components
      res.render("component_list", {
        title: "All PC Components",
        component_list: results,
      });
    });
};

// Display individual PC Component info, based on ID
exports.component_detail = function (req, res, next) {
  /**
   * This promise queries the db for the PC Component corresponding to the componentid in the URL
   */
  const findComponentById = new Promise((resolve, reject) => {
    Component.findById(req.params.componentid)
      .populate("manufacturer")
      .populate("category")
      .exec((err, results) => {
        // Check for db/query errors
        if (err) {
          reject(err);
        }

        // Check for empty results set
        if (results === null) {
          // Results are empty, show error
          const err = new Error("Component not found");
          err.status = 404;
          reject(err);
        }

        // Success, return the PC Component info
        resolve(results);
      });
  });

  findComponentById
    .then((results) => {
      // Success, render the PC Component info
      res.render("component_detail", {
        title: results.name,
        component: results,
      });
    })
    .catch((err) => {
      // Catch any erros and pass them along to the error handling middleware
      return next(err);
    });
};

// Display Create Component form on GET
exports.component_create_get = function (req, res, next) {
  res.send("Not implemented: component Create GET");
};

// Handle the creation of a Component on POST
exports.component_create_post = function (req, res, next) {
  res.send("Not implemented: component Create POST");
};

// Display Update Component form on GET
exports.component_update_get = function (req, res, next) {
  res.send("Not implemented: component Update GET");
};

// Handle the updating of a Component on POST
exports.component_update_post = function (req, res, next) {
  res.send("Not implemented: component Create POST");
};

// Display Delete Component form on GET
exports.component_delete_get = function (req, res, next) {
  res.send("Not implemented: component Delete GET");
};

// Handle the deleting of a Component on POST
exports.component_delete_post = function (req, res, next) {
  res.send("Not implemented: component Delete POST");
};
