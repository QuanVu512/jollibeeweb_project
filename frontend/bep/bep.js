document.addEventListener('DOMContentLoaded', function () {
    const stockInputs = document.querySelectorAll('input[name="so_luong"]');

    stockInputs.forEach(function (input) {
        applyStockStyle(input);
        input.addEventListener('input', function () {
            applyStockStyle(input);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(function (link) {
        link.addEventListener('click', function (event) {
            if (!confirm('Bạn có chắc muốn xóa món này?')) {
                event.preventDefault();
            }
        });
    });
});

function applyStockStyle(input) {
    const value = Number(input.value || 0);
    input.classList.toggle('low-stock', value < 10);
    if (value < 10) {
        input.style.color = 'red';
    } else {
        input.style.color = '#28a745';
    }
}
