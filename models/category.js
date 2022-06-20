const mongoose = require("mongoose");
const Schema = mongoose.Schema();

/**
 * Defines a model for the PC hardware Categories
 * (eg: Motherboard, Monitor, RAM, Harddrive, etc.).
 * Each Category must have a name and description.
 * NOTE: This is a dependency of the Component model.
 * NOTE: To delete a Category, all associated Components
 * must be deleted first.
 */
const CategorySchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
});

// Virtual for Category URL (used to create hyperlinks in the views)
CategorySchema.virtual("url").get(function () {
  return "/category/" + this._id;
});

// Finalize the model and then export it.
module.exports = mongoose.model("Category", CategorySchema);
