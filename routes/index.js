const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
const upload = multer({ storage: storage });

/* Require Controller modules */
const component_controller = require("../controllers/componentController");
const manufacturer_controller = require("../controllers/manufacturerController");
const category_controller = require("../controllers/categoryController");
const list_controller = require("../controllers/listController");

/* Home page routes */
router.get("/", function (req, res, next) {
  res.redirect("/list");
});
router.get("/list", list_controller.list_get);
router.post("/list/:categoryid/:componentid", list_controller.list_post);
router.post("/listdelete/:categoryid", list_controller.list_delete);

/* Component routes */
router.get("/components", component_controller.component_list);
router.get("/component/create", component_controller.component_create_get);
router.post(
  "/component/create",
  upload.single("component-image"),
  component_controller.component_create_post
);
router.get("/component/:componentid", component_controller.component_detail);
router.get(
  "/component/:componentid/update",
  component_controller.component_update_get
);
router.post(
  "/component/:componentid/update",
  upload.single("component-image"),
  component_controller.component_update_post
);
router.get(
  "/component/:componentid/delete",
  component_controller.component_delete_get
);
router.post(
  "/component/:componentid/delete",
  component_controller.component_delete_post
);

/* Manufacturer routes */
router.get("/manufacturers", manufacturer_controller.manufacturer_list);
router.get(
  "/manufacturer/create",
  manufacturer_controller.manufacturer_create_get
);
router.post(
  "/manufacturer/create",
  manufacturer_controller.manufacturer_create_post
);
router.get(
  "/manufacturer/:manufacturerid",
  manufacturer_controller.manufacturer_detail
);
router.get(
  "/manufacturer/:manufacturerid/update",
  manufacturer_controller.manufacturer_update_get
);
router.post(
  "/manufacturer/:manufacturerid/update",
  manufacturer_controller.manufacturer_update_post
);
router.get(
  "/manufacturer/:manufacturerid/delete",
  manufacturer_controller.manufacturer_delete_get
);
router.post(
  "/manufacturer/:manufacturerid/delete",
  manufacturer_controller.manufacturer_delete_post
);

/* Category routes */
router.get("/categories", category_controller.category_list);
router.get("/category/create", category_controller.category_create_get);
router.post("/category/create", category_controller.category_create_post);
router.get("/category/:categoryid", category_controller.category_detail);
router.get(
  "/category/:categoryid/update",
  category_controller.category_update_get
);
router.post(
  "/category/:categoryid/update",
  category_controller.category_update_post
);
router.get(
  "/category/:categoryid/delete",
  category_controller.category_delete_get
);
router.post(
  "/category/:categoryid/delete",
  category_controller.category_delete_post
);

module.exports = router;
