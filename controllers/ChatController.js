const BaseController = require("./BaseController");
const MessageModel = require("../models/Message");
const UserModel = require("../models/User");

class ChatController extends BaseController {
  constructor() {
    super();
    this.staffIndex = this.staffIndex.bind(this);
    this.getMessages = this.getMessages.bind(this);
  }

  // GET /chat/staff
  async staffIndex(req, res) {
    try {
      const chatRooms = await MessageModel.getChatRooms();
      this.render(res, "admin/chat/index", {
        title: "Quản lý Chat",
        chatRooms
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /chat/messages/:roomId
  async getMessages(req, res) {
    try {
      const messages = await MessageModel.getMessagesByRoom(req.params.roomId);
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ChatController();
