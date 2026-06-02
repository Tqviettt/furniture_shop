class BaseModel {
  constructor(schema) {
    this.schema = schema;
  }

  // Lấy tất cả (có filter, sort, populate)
  async getAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, populate = "", limit = 0, skip = 0 } = options;
    let query = this.schema.find(filter).sort(sort).skip(skip).limit(limit);
    if (populate) query = query.populate(populate);
    return await query;
  }

  // Lấy theo ID
  async getById(id, populate = "") {
    let query = this.schema.findById(id);
    if (populate) query = query.populate(populate);
    return await query;
  }

  // Tạo mới
  async create(data) {
    const doc = new this.schema(data);
    return await doc.save();
  }

  // Cập nhật
  async update(id, data) {
    return await this.schema.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // Xóa
  async delete(id) {
    return await this.schema.findByIdAndDelete(id);
  }

  // Đếm
  async count(filter = {}) {
    return await this.schema.countDocuments(filter);
  }

  // Tìm một bản ghi
  async findOne(filter = {}) {
    return await this.schema.findOne(filter);
  }
}

module.exports = BaseModel;