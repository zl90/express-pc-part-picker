const express = require("express");
const Manufacturer = require("../models/manufacturer");
const Component = require("../models/component");

// Display a list of all manufacturers
exports.manufacturer_list = function (req, res, next) {
  // Query the db for all manufacturer names
  Manufacturer.find({}, "name").exec((err, results) => {
    if (err) {
      return next(err);
    }
    // Success, render the list of manufacturer names
    res.render("manufacturer_list", {
      title: "All Manufacturers",
      manufacturer_names: results,
    });
  });
};

// Display individual manufacturer info, based in ID
exports.manufacturer_detail = function (req, res, next) {
  /**
   * This promise queries the db for a Manufacturer which has the ID supplied in the URL
   */
  const findManufacturerById = new Promise((resolve, reject) => {
    Manufacturer.findById(req.params.manufacturerid).exec((err, results) => {
      // check for db/query errors
      if (err) {
        reject(err);
      }

      if (results === null) {
        // No results returned from query, show error
        const err = new Error("Manufacturer not found");
        err.status = 404;
        reject(err);
      }

      // Success, return category info
      resolve(results);
    });
  });

  /**
   * This promise queries the db for all PC Components which have the same
   * manufacturer as the one supplied in the URL.
   */
  const findComponentsByManufacturer = new Promise((resolve, reject) => {
    Component.find({ manufacturer: req.params.manufacturerid })
      .populate("manufacturer")
      .populate("category")
      .exec((err, results) => {
        // check for db/query errors
        if (err) {
          reject(err);
        }

        // Success, return all PC Components corresponding to manufacturerid
        resolve(results);
      });
  });

  // Asyncronously query the DB using both promises, then process the results.
  Promise.all([findManufacturerById, findComponentsByManufacturer])
    .then((results) => {
      // Success, render the manufacturer info
      res.render("manufacturer_detail", {
        title: results[0].name,
        description: results[0].description,
        component_list: results[1],
      });
    })
    .catch((err) => {
      // Found some error, pass it on to the error-handler middleware function
      return next(err);
    });
};

// Display the Create Manufacturer form on GET
exports.manufacturer_create_get = function (req, res, next) {
  res.send("Not implemented yet: manufacturer create GET");
};

// Handle the creation of a Manufacturer on POST
exports.manufacturer_create_post = function (req, res, next) {
  res.send("Not implemented yet: manufacturer create POST");
};

// Display the Update Manufacturer form on GET
exports.manufacturer_update_get = function (req, res, next) {
  res.send("Not implemented yet: manufacturer update GET");
};

// Handle the Updating of a Manufacturer on POST
exports.manufacturer_update_post = function (req, res, next) {
  res.send("Not implemented yet: manufacturer create POST");
};

// Display the Delete Manufacturer form on GET
exports.manufacturer_delete_get = function (req, res, next) {
  res.send("Not implemented yet: manufacturer delete GET");
};

// Handle the deletion of a Manufacturer on POST
exports.manufacturer_delete_post = function (req, res, next) {
  res.send("Not implemented yet: manufacturer delete POST");
};
