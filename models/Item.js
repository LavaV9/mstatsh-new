const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema(
  {
    title: { type: String, required: true },
    condition: {
      type: String,
      enum: ['Gem Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Damaged'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0 
    },
    seller: { type: String, required: true },
    details: { type: String, required: true },
    image: { type: String, required: true },
    totalOffers: { type: Number, required: true, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    active: { type: Boolean, default: true },
    highestOffer: {
			type: Number,
			default: 0,
			required: [true, 'Amount is required'],
			min: [0, 'Minimum amount is $0'],
		},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
