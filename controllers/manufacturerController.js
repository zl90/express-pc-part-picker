const express = require("express");
const Manufacturer = require("../models/manufacturer");
const Component = require("../models/component");
const { body, validationResult } = require("express-validator");

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
        manufacturer: results[0],
      });
    })
    .catch((err) => {
      // Found some error, pass it on to the error-handler middleware function
      return next(err);
    });
};

// Display the Create Manufacturer form on GET
exports.manufacturer_create_get = function (req, res, next) {
  // Just render the Create Manufacturer form.
  // Let the form know that it's not updating an existing Manufacturer, so display an empty form.
  res.render("manufacturer_form", {
    title: "Add new Manufacturer",
    isUpdating: false,
  });
};

// Handle the creation of a Manufacturer on POST
exports.manufacturer_create_post = [
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
      // There are errors. Render the Create Manufacturer form again with sanitized values/error messages.
      res.render("manufacturer_form", {
        title: "Add new Manufacturer",
        manufacturer: req.body,
        isUpdating: false,
        errors: errors.array(),
      });
      return;
    } else {
      // No validation errors, save the new Manufacturer to the db

      // First, check if the new manufacturer already exists in the db:
      Manufacturer.findOne({ name: req.body.name }).exec((err, results) => {
        // check for db/query errors
        if (err) {
          return next(err);
        }

        if (results !== null) {
          // Manufacturer already exists in the db, redirect to it's Detail page
          res.redirect(results.url);
        } else {
          // Manufacturer doesn't exist already, proceed to save it to the db

          // Create the new Manufacturer instance with escaped and trimmed data:
          const newManufacturer = new Manufacturer({
            name: req.body.name,
            description: req.body.description,
          });

          // Save new manufacturer to the db using Mongoose:
          newManufacturer.save(function (err) {
            // check for db/query errors
            if (err) {
              return next(err);
            }

            // Manufacturer successfully saved. Redirect to it's Detail page
            res.redirect(newManufacturer.url);
          });
        }
      });
    }
  },
];

// Display the Update Manufacturer form on GET
exports.manufacturer_update_get = function (req, res, next) {
  /**
   * queries the db for a Manufacturer which has the ID supplied in the URL
   */
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

    // Success, render the update form
    // Let the form know that it's updating an existing Manufacturer, so display a pre-filled form.
    res.render("manufacturer_form", {
      title: "Update: " + results.name,
      isUpdating: true,
      manufacturer: results,
    });
  });
};

// Handle the Updating of a Manufacturer on POST
exports.manufacturer_update_post = [
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

    findManufacturerById
      .then((results) => {
        // Extract the validation errors from the POST request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          // There are errors. Render the Update Manufacturer form again with sanitized values/error messages.
          res.render("manufacturer_form", {
            title: "Update: " + req.body.name,
            manufacturer: results,
            isUpdating: true,
            errors: errors.array(),
          });
          return;
        } else {
          // No validation errors, update the Manufacturer in the db
          // Create a temporary Manufacturer instance with escaped and trimmed data:
          const newManufacturer = new Manufacturer({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.manufacturerid, //This is required, or a new ID will be assigned!
          });

          // Overwrite the old manufacturer in the db with the temporary manufacturer using Mongoose:
          Manufacturer.findByIdAndUpdate(
            req.params.manufacturerid,
            newManufacturer,
            {},
            (update_errors, updated_manufacturer) => {
              if (update_errors) {
                return next(update_errors);
              }
              // Manufacturer successfully updated. Redirect to it's Detail page
              res.redirect(updated_manufacturer.url);
            }
          );
        }
      })
      .catch((err) => {
        return next(err);
      });
  },
];

// Display the Delete Manufacturer form on GET
exports.manufacturer_delete_get = function (req, res, next) {
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
      // Success, render the Delete Manufacturer page
      res.render("manufacturer_delete", {
        title: "Delete Manufacturer:\n" + results[0].name,
        description: results[0].description,
        component_list: results[1],
        manufacturer: results[0],
      });
    })
    .catch((err) => {
      // Found some error, pass it on to the error-handler middleware function
      return next(err);
    });
};

// Handle the deletion of a Manufacturer on POST
exports.manufacturer_delete_post = function (req, res, next) {
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
      // Check one last time for any components which depend on this manufacturer
      if (results[1].length > 0) {
        // Dependents found, go back to the manufacturer delete page
        res.render("manufacturer_delete", {
          title: "Delete Manufacturer:\n" + results[0].name,
          description: results[0].description,
          component_list: results[1],
          manufacturer: results[0],
        });
        return;
      } else {
        // Check password
        if (req.body.password !== process.env.ADMIN_PASSWORD) {
          // if password doesn't match, go back to the manufacturer delete page with errors
          const errors = [new Error("Password")];
          errors[0].msg = "Incorrect Password";
          res.render("manufacturer_delete", {
            title: "Delete Manufacturer:\n" + results[0].name,
            description: results[0].description,
            component_list: results[1],
            manufacturer: results[0],
            errors: errors,
          });
          return;
        }

        // No dependents found. Delete this manufacturer
        Manufacturer.findByIdAndRemove(req.params.manufacturerid).exec(
          (error) => {
            if (error) {
              return next(error);
            }
            // Success, manufacturer has been deleted. Redirect to the list of manufacturers:
            res.redirect("/manufacturers");
          }
        );
      }
    })
    .catch((err) => {
      // Found some error, pass it on to the error-handler middleware function
      return next(err);
    });
};
