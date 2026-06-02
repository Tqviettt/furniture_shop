class BaseController {
  // Render view
  render(res, view, data = {}, statusCode = 200) {
    return res.status(statusCode).render(view, data);
  }

  // JSON response
  json(res, data = {}, statusCode = 200) {
    return res.status(statusCode).json(data);
  }

  // Redirect
  redirect(res, url, message = null, type = "success") {
    if (message && res.req.flash) {
      res.req.flash(type, message);
    }
    return res.redirect(url);
  }

  // Xử lý lỗi
  handleError(res, error, redirectUrl = "/") {
    console.error(" Error:", error.message);
    if (res.req.flash) {
      res.req.flash("error", error.message || "Có lỗi xảy ra!");
    }
    return res.redirect(redirectUrl);
  }

  // Validate dữ liệu đơn giản
  validate(data, requiredFields) {
    const errors = [];
    requiredFields.forEach((field) => {
      if (!data[field] || data[field].toString().trim() === "") {
        errors.push(`${field} là bắt buộc`);
      }
    });
    return errors;
  }
}

module.exports = BaseController;
