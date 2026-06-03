const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The customer's ID acts as room ID
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The sender (Customer or Staff)
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const MessageSchema = mongoose.model("Message", messageSchema);

class MessageModel extends BaseModel {
  constructor() {
    super(MessageSchema);
  }

  async getMessagesByRoom(roomId) {
    return await this.schema
      .find({ room: roomId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });
  }

  // Lấy danh sách các phòng chat (danh sách khách hàng đã nhắn tin)
  async getChatRooms() {
    const result = await this.schema.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);
    return result;
  }
}

module.exports = new MessageModel();
