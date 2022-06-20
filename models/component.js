const mongoose = require("mongoose");
const Schema = mongoose.Schema();

/**
 * Defines a model for the PC hardware Components.
 * (eg: individual GPUs, CPUs, RAM, etc.).
 * Each Component must have a name, description, price and
 * quantity (amount in stock), as well as one Manufacturer
 * and one Category.
 */
const ComponentSchema = new Schema({
  name: { type: String, maxlength: 100, required: true },
  price: { type: Number, required: true, min: 0, max: 999999 },
  quantity: { type: Number, required: true, min: 0, max: 9999 },
  description: { type: String, maxlength: 1000, required: true },
  manufacturer: {
    type: Schema.Types.ObjectId, // Will be populated later.
    ref: "Manufacturer",
    required: true,
  },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

// Virtual for PC Component's URL (used to create hyperlinks in the views)
ComponentSchema.virtual("url").get(function () {
  // Links to an individual PC component's GET page
  return "/component/" + this._id;
});

// Finalize the model and then export it.
module.exports = mongoose.model("Component", ComponentSchema);
