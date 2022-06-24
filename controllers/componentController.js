const express = require("express");
const Component = require("../models/component");
const Manufacturer = require("../models/manufacturer");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");

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
  /**
   * This promise queries the db for all Categories.
   * In this case, we'll need Categories to populate our "Select Category" options dropdown.
   */
  const getAllCategories = new Promise((resolve, reject) => {
    Category.find().exec((err, results) => {
      // check db/query errors
      if (err) {
        reject(err);
      }

      // Success, return category list
      resolve(results);
    });
  });

  /**
   * This promise queries the db for all Manufacturers.
   * In this case, we'll need Manufacturers to populate our "Select Manufacturer" options dropdown.
   */
  const getAllManufacturers = new Promise((resolve, reject) => {
    Manufacturer.find().exec((err, results) => {
      // check db/query errors
      if (err) {
        reject(err);
      }

      // Success, return manufacturer list
      resolve(results);
    });
  });

  Promise.all([getAllCategories, getAllManufacturers])
    .then((results) => {
      // render the Create Component form.
      // Let the form know that it's not updating an existing PC Component, so display an empty form.
      res.render("component_form", {
        title: "Add new PC Part",
        isUpdating: false,
        category_list: results[0],
        manufacturer_list: results[1],
      });
    })
    .catch((err) => {
      return next(err);
    });
};

// Handle the creation of a Component on POST
exports.component_create_post = [
  // Validate and sanitize the POST request values
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be 1-100 characters long")
    .escape(),
  body("description")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Features must be 1-1000 characters long")
    .escape(),
  body("price")
    .trim()
    .isFloat({ min: 0, max: 999999 })
    .withMessage("Price must be numeric value between 0 and 999999")
    .escape(),
  body("quantity")
    .trim()
    .isInt({ min: 0, max: 9999 })
    .withMessage("Stock must be numeric value between 0 and 9999")
    .escape(),
  body("categoryid", "A Category must be selected").trim().escape(),
  body("manufacturerid", "A Manufacturer must be selected").trim().escape(),

  function (req, res, next) {
    // From the POST request, we receive a category ID. Query the db to get the category instance:
    const findCategoryById = new Promise((resolve, reject) => {
      Category.findById(req.body.categoryid).exec((err, results) => {
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

    // From the POST request, we receive a manufacturer ID. Query the db to get the manufacturer instance:
    const findManufacturerById = new Promise((resolve, reject) => {
      Manufacturer.findById(req.body.manufacturerid).exec((err, results) => {
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
     * This promise queries the db for all Categories.
     * In this case, we'll need Categories to populate our "Select Category" options dropdown.
     */
    const getAllCategories = new Promise((resolve, reject) => {
      Category.find().exec((err, results) => {
        // check db/query errors
        if (err) {
          reject(err);
        }

        // Success, return category list
        resolve(results);
      });
    });

    /**
     * This promise queries the db for all Manufacturers.
     * In this case, we'll need Manufacturers to populate our "Select Manufacturer" options dropdown.
     */
    const getAllManufacturers = new Promise((resolve, reject) => {
      Manufacturer.find().exec((err, results) => {
        // check db/query errors
        if (err) {
          reject(err);
        }

        // Success, return manufacturer list
        resolve(results);
      });
    });

    Promise.all([
      findCategoryById,
      findManufacturerById,
      getAllCategories,
      getAllManufacturers,
    ])
      .then((results) => {
        // Manufacturer and Component data successfully queried. Proceed to save the new Component to the db:

        // Extract the validation errors from the POST request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          // There are errors. Render the Create Component form again with sanitized values/error messages.
          res.render("component_form", {
            title: "Add new PC Part",
            component_category: results[0],
            component_manufacturer: results[1],
            component: req.body,
            isUpdating: false,
            errors: errors.array(),
            category_list: results[2],
            manufacturer_list: results[3],
          });
          return;
        } else {
          // No validation errors, save the new Component to the db

          // First, check if the new Component already exists in the db:
          Component.findOne({ name: req.body.name }).exec(
            (error, found_component) => {
              // check for query/db errors
              if (error) {
                return next(error);
              }

              if (found_component) {
                // Component already exists in the db, redirect to its Detail page
                res.redirect(found_component.url);
              } else {
                // Create the new Component instance with escaped and trimmed data:
                const newComponent = new Component({
                  name: req.body.name,
                  description: req.body.description,
                  price: req.body.price,
                  quantity: req.body.quantity,
                  category: results[0],
                  manufacturer: results[1],
                });

                //  Save new Component to the db using Mongoose:
                newComponent.save(function (errors) {
                  // check for db/query errors
                  if (errors) {
                    return next(errors);
                  }

                  // Component successfully saved. Redirect to it's Detail page
                  res.redirect(newComponent.url);
                });
              }
            }
          );
        }
      })
      .catch((err) => {
        return next(err);
      });
  },
];

// Display Update Component form on GET
exports.component_update_get = function (req, res, next) {
  /**
   * This promise queries the db for all Categories.
   * In this case, we'll need Categories to populate our "Select Category" options dropdown.
   */
  const getAllCategories = new Promise((resolve, reject) => {
    Category.find().exec((err, results) => {
      // check db/query errors
      if (err) {
        reject(err);
      }

      // Success, return category list
      resolve(results);
    });
  });

  /**
   * This promise queries the db for all Manufacturers.
   * In this case, we'll need Manufacturers to populate our "Select Manufacturer" options dropdown.
   */
  const getAllManufacturers = new Promise((resolve, reject) => {
    Manufacturer.find().exec((err, results) => {
      // check db/query errors
      if (err) {
        reject(err);
      }

      // Success, return manufacturer list
      resolve(results);
    });
  });

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

  Promise.all([getAllCategories, getAllManufacturers, findComponentById])
    .then((results) => {
      // render the Update Component form.
      // Let the form know that it is updating an existing PC Component, so display a pre-filled form.
      res.render("component_form", {
        title: "Add new PC Part",
        isUpdating: true,
        category_list: results[0],
        manufacturer_list: results[1],
        component: results[2],
        component_category: results[2].category,
        component_manufacturer: results[2].manufacturer,
      });
    })
    .catch((err) => {
      return next(err);
    });
};

// Handle the updating of a Component on POST
exports.component_update_post = [
  // Validate and sanitize the POST request values
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be 1-100 characters long")
    .escape(),
  body("description")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Features must be 1-1000 characters long")
    .escape(),
  body("price")
    .trim()
    .isFloat({ min: 0, max: 999999 })
    .withMessage("Price must be numeric value between 0 and 999999")
    .escape(),
  body("quantity")
    .trim()
    .isInt({ min: 0, max: 9999 })
    .withMessage("Stock must be numeric value between 0 and 9999")
    .escape(),
  body("categoryid", "A Category must be selected").trim().escape(),
  body("manufacturerid", "A Manufacturer must be selected").trim().escape(),

  function (req, res, next) {
    // From the POST request, we receive a category ID. Query the db to get the category instance:
    const findCategoryById = new Promise((resolve, reject) => {
      Category.findById(req.body.categoryid).exec((err, results) => {
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

    // From the POST request, we receive a manufacturer ID. Query the db to get the manufacturer instance:
    const findManufacturerById = new Promise((resolve, reject) => {
      Manufacturer.findById(req.body.manufacturerid).exec((err, results) => {
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
     * This promise queries the db for all Categories.
     * In this case, we'll need Categories to populate our "Select Category" options dropdown.
     */
    const getAllCategories = new Promise((resolve, reject) => {
      Category.find().exec((err, results) => {
        // check db/query errors
        if (err) {
          reject(err);
        }

        // Success, return category list
        resolve(results);
      });
    });

    /**
     * This promise queries the db for all Manufacturers.
     * In this case, we'll need Manufacturers to populate our "Select Manufacturer" options dropdown.
     */
    const getAllManufacturers = new Promise((resolve, reject) => {
      Manufacturer.find().exec((err, results) => {
        // check db/query errors
        if (err) {
          reject(err);
        }

        // Success, return manufacturer list
        resolve(results);
      });
    });

    Promise.all([
      findCategoryById,
      findManufacturerById,
      getAllCategories,
      getAllManufacturers,
    ])
      .then((results) => {
        // Manufacturer and Component data successfully queried. Proceed to update the db with new Component values:

        // Extract the validation errors from the POST request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          // There are errors. Render the Update Component form again with sanitized values/error messages.
          res.render("component_form", {
            title: "Add new PC Part",
            component_category: results[0],
            component_manufacturer: results[1],
            component: req.body,
            isUpdating: true,
            errors: errors.array(),
            category_list: results[2],
            manufacturer_list: results[3],
          });
          return;
        } else {
          // No validation errors, save the updated Component to the db

          // Create a temporary Component instance with escaped and trimmed data:
          const newComponent = new Component({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            category: results[0],
            manufacturer: results[1],
            _id: req.params.componentid, //This is required, or a new ID will be assigned!
          });

          // Update the db with new Component instance
          Component.findByIdAndUpdate(
            req.params.componentid,
            newComponent,
            {},
            (update_errors, updated_component) => {
              if (update_errors) {
                return next(update_errors);
              }
              // Component successfully updated. Redirect to it's Detail page
              res.redirect(updated_component.url);
            }
          );
        }
      })
      .catch((err) => {
        return next(err);
      });
  },
];

// Display Delete Component form on GET
exports.component_delete_get = function (req, res, next) {
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
      res.render("component_delete", {
        title: "Delete Component: \n" + results.name,
        component: results,
      });
    })
    .catch((err) => {
      // Catch any erros and pass them along to the error handling middleware
      return next(err);
    });
};

// Handle the deleting of a Component on POST
exports.component_delete_post = function (req, res, next) {
  Component.findByIdAndRemove(req.params.componentid).exec((err) => {
    if (err) {
      return next(err);
    }
    // Success, PC component has been deleted. Redirect to the list of PC components:
    res.redirect("/components");
  });
};
