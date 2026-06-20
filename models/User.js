const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const BaseModel = require("./BaseModel");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { 
      type: String, 
      required: function() { return !this.googleId && !this.facebookId; }, 
      minlength: 6 
    },
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    phone: { type: String, default: "" },
    address: {
      street: String,
      city: String,
      district: String,
    },
    role: { 
      type: String, 
      enum: ["customer", "staff_cskh", "staff_order", "staff_content", "admin"], 
      default: "customer" 
    },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: "/images/default-avatar.svg" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserSchema = mongoose.model("User", userSchema);

class UserModel extends BaseModel {
  constructor() {
    super(UserSchema);
  }

  async findByEmail(email) {
    return await this.schema.findOne({ email });
  }

  async validatePassword(user, password) {
    return await user.comparePassword(password);
  }

  async getAllCustomers() {
    return await this.getAll({ role: "customer" });
  }

  async getAllStaff() {
    return await this.getAll({ role: { $in: ["staff_cskh", "staff_order", "staff_content"] } });
  }
}

module.exports = new UserModel();