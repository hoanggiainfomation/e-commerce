const mongoose = require('mongoose'); // Erase if already required
// !mdbgum
// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'Category',
    },
    quantity: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    image: {
      type: Array,
      required: true,
    },
    color: {
      type: String,
      enum: ['Black', 'Red', 'Blue'],
    },
    ratings: [
      {
        start: { type: Number },
        postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
        comment: { type: String },
      },
    ],
    totalratings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model('Product', productSchema);
