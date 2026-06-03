const BaseController = require("./BaseController");
const NewsModel = require("../models/News");

class NewsController extends BaseController {
    constructor() {
        super();
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.adminIndex = this.adminIndex.bind(this);
        this.create = this.create.bind(this);
        this.store = this.store.bind(this);
        this.edit = this.edit.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    // --- PUBLIC ROUTES ---
    async index(req, res) {
        try {
            const newsList = await NewsModel.getAllActive(20);
            this.render(res, "news/index", {
                title: "Tin tức & Góc chia sẻ",
                newsList
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async show(req, res) {
        try {
            const news = await NewsModel.getBySlug(req.params.slug);
            if (!news) {
                req.flash("error", "Bài viết không tồn tại!");
                return res.redirect("/news");
            }
            // Parse content to handle line breaks simply
            const formattedContent = news.content.replace(/\n/g, '<br>');
            this.render(res, "news/show", {
                title: news.title,
                news: { ...news.toObject(), content: formattedContent }
            });
        } catch (error) {
            this.handleError(res, error, "/news");
        }
    }

    // --- ADMIN ROUTES ---
    async adminIndex(req, res) {
        try {
            const newsList = await NewsModel.find().sort({ createdAt: -1 }).populate('author', 'name');
            this.render(res, "admin/news/index", { title: "Quản lý Tin Tức", newsList });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async create(req, res) {
        this.render(res, "admin/news/create", { title: "Thêm Bài Viết" });
    }

    async store(req, res) {
        try {
            const { title, excerpt, content, category } = req.body;
            // Xóa dấu tiếng việt cơ bản
            let slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
            slug = slug.replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
            
            const image = req.file ? `/uploads/${req.file.filename}` : '/images/no-image.png';
            
            await NewsModel.create({
                title, slug, excerpt, content, category,
                image,
                author: req.session.userId,
                isActive: req.body.isActive === 'on'
            });
            this.redirect(res, "/admin/news", "Thêm bài viết thành công!");
        } catch (error) {
            this.handleError(res, error, "/admin/news/create");
        }
    }

    async edit(req, res) {
        try {
            const news = await NewsModel.findById(req.params.id);
            if (!news) return res.redirect("/admin/news");
            this.render(res, "admin/news/edit", { title: "Sửa Bài Viết", news });
        } catch (error) {
            this.handleError(res, error, "/admin/news");
        }
    }

    async update(req, res) {
        try {
            const { title, excerpt, content, category } = req.body;
            const updateData = { title, excerpt, content, category, isActive: req.body.isActive === 'on' };
            
            if (req.file) {
                updateData.image = `/uploads/${req.file.filename}`;
            }

            await NewsModel.findByIdAndUpdate(req.params.id, updateData);
            this.redirect(res, "/admin/news", "Cập nhật bài viết thành công!");
        } catch (error) {
            this.handleError(res, error, `/admin/news/${req.params.id}/edit`);
        }
    }

    async destroy(req, res) {
        try {
            await NewsModel.findByIdAndDelete(req.params.id);
            this.redirect(res, "/admin/news", "Xóa bài viết thành công!");
        } catch (error) {
            this.handleError(res, error, "/admin/news");
        }
    }
}

module.exports = new NewsController();
