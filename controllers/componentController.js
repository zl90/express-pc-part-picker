const express = require("express");
const Component = require("../models/component");
const mongoose = require("mongoose");

// Display a list of all PC components
exports.component_list = function (req, res, next) {
  res.send("Not implemented: component list GET");
};

// Display individual Component info, based on ID
exports.component_detail = function (req, res, next) {
  res.send("Not implemented: component detail GET");
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
