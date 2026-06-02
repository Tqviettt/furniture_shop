document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", async function () {
    const productId = this.dataset.id;
    const quantityInput = document.getElementById("quantity");
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    try {
      const res = await fetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      if (data.success) {
        document.querySelector(".badge.bg-danger").textContent = data.cartCount;
        showToast(data.message, "success");
      } else {
        showToast(data.message, "danger");
      }
    } catch (err) {
      showToast("Có lỗi xảy ra!", "danger");
    }
  });
});

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `alert alert-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    z-index: 9999; min-width: 250px;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Nút Mua ngay
const buyNowBtn = document.getElementById("buyNowBtn");
if (buyNowBtn) {
  buyNowBtn.addEventListener("click", async function () {
    const productId = this.dataset.id;
    const quantityInput = document.getElementById("quantity");
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    try {
      const res = await fetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      if (data.success) {
        // Thêm vào giỏ xong → chuyển sang checkout
        window.location.href = "/orders/checkout";
      } else {
        showToast(data.message, "danger");
      }
    } catch (err) {
      showToast("Có lỗi xảy ra!", "danger");
    }
  });
}
// Nút yêu thích
document.querySelectorAll(".wishlist-btn").forEach((btn) => {
  btn.addEventListener("click", async function () {
    const productId = this.dataset.id;
    try {
      const res = await fetch("/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast(data.message, data.added ? "danger" : "secondary");
        if (!data.added && window.location.pathname === "/wishlist") {
          location.reload();
        }
      }
    } catch (err) {
      showToast("Có lỗi xảy ra!", "danger");
    }
  });
});
