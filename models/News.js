const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    image: { type: String, default: '/images/no-image.png' },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, default: 'Tin tức' }, // 'Review', 'Góc Chia Sẻ', 'Thành Tựu' v.v.
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

class NewsClass {
    static async getAllActive(limit = 10) {
        return this.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('author', 'name');
    }

    static async getBySlug(slug) {
        return this.findOne({ slug, isActive: true }).populate('author', 'name');
    }
}

newsSchema.loadClass(NewsClass);
module.exports = mongoose.model("News", newsSchema);
