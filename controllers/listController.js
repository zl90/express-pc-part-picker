const { each } = require("async");
const express = require("express");
const category = require("../models/category");
const Category = require("../models/category");
const Component = require("../models/component");
const Manufacturer = require("../models/manufacturer");

const findAllCategories = new Promise((resolve, reject) => {
  Category.find().exec((err, results) => {
    if (err) {
      reject(err);
    }
    resolve(results);
  });
});

const findAllComponents = new Promise((resolve, reject) => {
  Component.find().exec((err, results) => {
    if (err) {
      reject(err);
    }
    resolve(results);
  });
});

// Display the main page ("My List").
exports.list_get = function (req, res, next) {
  /**
   * This builds a list of all "selected" Components by checking the cookies
   * for componentIDs. If no "selected" Component is found, then the templating
   * engine adds a button which lets the user select Components.
   *  */
  Promise.all([findAllCategories, findAllComponents])
    .then((results) => {
      // Build the main list object
      let listArray = [];

      results[0].forEach((categoryElement) => {
        // Check all categories to see if they exist in the cookie list
        let foundCategoryInCookies = Object.keys(req.cookies).find(function (
          categoryId
        ) {
          return categoryId === categoryElement.id;
        });

        let foundComponent = null;
        if (foundCategoryInCookies !== undefined) {
          // get the corresponding "selected" component
          foundComponent = results[1].find(function (item) {
            return item.id === req.cookies[foundCategoryInCookies];
          });
        }

        if (foundComponent !== undefined) {
          // push the "selected" component to the list
          listArray.push({
            category: categoryElement,
            component: foundComponent,
          });
        } else {
          // If we couldn't find the associated component, just push an "empty selection" to the list
          listArray.push({
            category: categoryElement,
            component: null,
          });
        }
      });
      // No db/query errors, Render the "My List" page
      res.render("index", {
        title: "PC Part Picker",
        listArray: listArray,
      });
    })
    .catch((err) => {
      return next(err);
    });
};

// Send data to the main page
exports.list_post = function (req, res, next) {
  // This just sets the cookies, then redirects to the main page
  res.cookie(req.params.categoryid, req.params.componentid, {
    maxAge: 9999999999999,
  });
  res.redirect("/list");
};
