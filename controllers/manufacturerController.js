const express = require("express");
const Manufacturer = require("../models/manufacturer");

// Display a list of all manufacturers
exports.manufacturer_list = function (req, res, next) {
  res.send("Not implemented yet: manufacturer list GET");
};

// Display individual manufacturer info, based in ID
exports.manufacturer_detail = function (req, res, next) {
  res.send("Not implemented yet: manufacturer detail GET");
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
