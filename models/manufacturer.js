const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Defines a model for the PC hardware Manufacturers
 * (eg: Nvidia, Intel, Ryzen, etc.).
 * Each Manufacturer must have a name and description.
 * NOTE: This is a dependency of the Component model.
 * NOTE: To delete a Manufacturer, all associated Components
 * must be deleted first.
 */
const ManufacturerSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
});

// Virtual for Manufacturer URL (used to create hyperlinks in the views)
ManufacturerSchema.virtual("url").get(function () {
  return "/manufacturer/" + this._id;
});

// Finalize the model and then export it.
module.exports = mongoose.model("Manufacturer", ManufacturerSchema);
