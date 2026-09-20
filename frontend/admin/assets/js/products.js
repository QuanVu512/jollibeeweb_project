document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#product-form');
  const formTitle = document.querySelector('#product-form-title');
  const statusGroup = document.querySelector('#product-status-group');
  const submitButton = document.querySelector('#product-submit');
  const cancelButton = document.querySelector('#product-cancel');
  const addIngredientButton = document.querySelector('#add-ingredient');
  const recipeRows = document.querySelector('#recipe-rows');
  const recipeError = document.querySelector('#recipe-error');
  const categorySelect = document.querySelector('#product-category');
  const categoryFilter = document.querySelector('#category-filter');
  const statusFilter = document.querySelector('#status-filter');
  const tableBody = document.querySelector('#product-table-body');
  const countLabel = document.querySelector('#product-count');
  const pagination = document.querySelector('#product-pagination');
  const previousPage = document.querySelector('#previous-page');
  const nextPage = document.querySelector('#next-page');
  const pageLabel = document.querySelector('#page-label');
  const {
    showToast,
    formatCurrency,
    clearFieldErrors,
    clearFieldError,
    showFieldError,
    applyFieldErrors,
    bindFieldErrorClearing,
    initAdminPage
  } = window.AdminCommon;
  const productNamePattern = /^(?=.*\p{L})[\p{L}\p{M}\p{N} ]+$/u;

  let categories = [];
  let ingredients = [];
  let ingredientById = new Map();
  let currentPage = 1;

  function hideRecipeError() {
    recipeError.hidden = true;
    recipeError.textContent = '';
    recipeError.removeAttribute('role');
  }

  function showRecipeError(message) {
    recipeError.replaceChildren();
    const prefix = document.createElement('span');
    prefix.className = 'visually-hidden';
    prefix.textContent = 'Lỗi: ';
    recipeError.append(prefix, document.createTextNode(message));
    recipeError.setAttribute('role', 'alert');
    recipeError.hidden = false;
  }

  function appendOption(select, value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.append(option);
    return option;
  }

  function unitsForIngredient(ingredient) {
    const units = new Map();
    units.set(ingredient.baseUnit, {
      unit: ingredient.baseUnit,
      label: ingredient.baseUnit,
      baseQuantity: 1
    });
    (ingredient.packaging || []).forEach((item) => units.set(item.unit, item));
    return [...units.values()];
  }

  function fillUnitSelect(select, ingredientId, selectedUnit = '') {
    select.replaceChildren();
    const ingredient = ingredientById.get(ingredientId);
    if (!ingredient) {
      appendOption(select, '', '-- Chọn nguyên liệu trước --');
      return;
    }

    unitsForIngredient(ingredient).forEach((item) => {
      const conversion = Number(item.baseQuantity) === 1
        ? ''
        : ` — 1 ${item.unit} = ${item.baseQuantity} ${ingredient.baseUnit}`;
      const option = appendOption(select, item.unit, `${item.label || item.unit} (${item.unit})${conversion}`);
      option.selected = item.unit === selectedUnit;
    });
  }

  function addIngredientRow(data = {}) {
    const row = document.createElement('div');
    row.className = 'recipe-row';

    const ingredientSelect = document.createElement('select');
    ingredientSelect.className = 'recipe-ingredient';
    ingredientSelect.required = true;
    ingredientSelect.setAttribute('aria-label', 'Nguyên liệu');
    appendOption(ingredientSelect, '', '-- Chọn nguyên liệu --');
    ingredients.forEach((ingredient) => {
      const option = appendOption(ingredientSelect, ingredient._id, `${ingredient.code} - ${ingredient.name}`);
      option.selected = ingredient._id === String(data.ingredientId || '');
    });

    const quantityInput = document.createElement('input');
    quantityInput.className = 'recipe-quantity';
    quantityInput.type = 'number';
    quantityInput.min = '0.000001';
    quantityInput.step = 'any';
    quantityInput.required = true;
    quantityInput.placeholder = 'Số lượng';
    quantityInput.setAttribute('aria-label', 'Số lượng tiêu hao');
    quantityInput.value = data.quantity ?? '';

    const unitSelect = document.createElement('select');
    unitSelect.className = 'recipe-unit';
    unitSelect.required = true;
    unitSelect.setAttribute('aria-label', 'Đơn vị tiêu hao');
    fillUnitSelect(unitSelect, ingredientSelect.value, data.unit || '');

    ingredientSelect.addEventListener('change', () => {
      fillUnitSelect(unitSelect, ingredientSelect.value);
      clearFieldError(unitSelect);
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn-danger recipe-remove';
    removeButton.textContent = 'Xóa dòng';
    removeButton.addEventListener('click', () => {
      row.remove();
      if (!recipeRows.children.length) addIngredientRow();
      hideRecipeError();
    });

    const ingredientField = document.createElement('div');
    ingredientField.className = 'recipe-field';
    ingredientField.append(ingredientSelect);
    const quantityField = document.createElement('div');
    quantityField.className = 'recipe-field';
    quantityField.append(quantityInput);
    const unitField = document.createElement('div');
    unitField.className = 'recipe-field';
    unitField.append(unitSelect);

    row.append(ingredientField, quantityField, unitField, removeButton);
    recipeRows.append(row);
  }

  function populateCategoryControls() {
    categories.forEach((category) => {
      appendOption(categorySelect, category._id, `${category.code} - ${category.name}`);
      appendOption(categoryFilter, category._id, category.name);
    });
  }

  function resetForm() {
    form.reset();
    clearFieldErrors(form);
    hideRecipeError();
    form.elements.id.value = '';
    formTitle.textContent = 'Tạo sản phẩm';
    submitButton.textContent = 'Tạo sản phẩm';
    cancelButton.hidden = true;
    statusGroup.hidden = true;
    recipeRows.replaceChildren();
    addIngredientRow();
  }

  function collectIngredients() {
    return [...recipeRows.querySelectorAll('.recipe-row')].map((row) => ({
      ingredientId: row.querySelector('.recipe-ingredient').value,
      quantity: Number(row.querySelector('.recipe-quantity').value),
      unit: row.querySelector('.recipe-unit').value
    }));
  }

  function validateForm() {
    clearFieldErrors(form);
    hideRecipeError();
    let valid = true;
    const name = form.elements.name.value.trim();
    const price = Number(form.elements.price.value);

    if (!name) {
      showFieldError(form.elements.name, 'Nhập tên sản phẩm.');
      valid = false;
    } else if (name.length > 70) {
      showFieldError(form.elements.name, 'Tên sản phẩm không được vượt quá 70 ký tự.');
      valid = false;
    } else if (!productNamePattern.test(name)) {
      showFieldError(form.elements.name, 'Tên sản phẩm phải có ít nhất một chữ cái và chỉ được gồm chữ, số hoặc khoảng trắng.');
      valid = false;
    }
    if (!form.elements.price.value) {
      showFieldError(form.elements.price, 'Nhập giá bán.');
      valid = false;
    } else if (!Number.isSafeInteger(price) || price <= 0) {
      showFieldError(form.elements.price, 'Giá bán phải là số nguyên lớn hơn 0.');
      valid = false;
    }
    if (!form.elements.categoryId.value) {
      showFieldError(form.elements.categoryId, 'Chọn danh mục sản phẩm.');
      valid = false;
    }

    const rows = [...recipeRows.querySelectorAll('.recipe-row')];
    if (!rows.length) {
      showRecipeError('Thêm ít nhất một nguyên liệu tiêu hao.');
      valid = false;
    }
    rows.forEach((row, index) => {
      const ingredientSelect = row.querySelector('.recipe-ingredient');
      const quantityInput = row.querySelector('.recipe-quantity');
      const unitSelect = row.querySelector('.recipe-unit');
      if (!ingredientSelect.value) {
        showFieldError(ingredientSelect, `Chọn nguyên liệu tại dòng ${index + 1}.`);
        valid = false;
      }
      if (!quantityInput.value) {
        showFieldError(quantityInput, `Nhập số lượng tiêu hao tại dòng ${index + 1}.`);
        valid = false;
      } else if (!Number.isFinite(Number(quantityInput.value)) || Number(quantityInput.value) <= 0) {
        showFieldError(quantityInput, `Số lượng tiêu hao ở dòng ${index + 1} phải lớn hơn 0.`);
        valid = false;
      }
      if (!unitSelect.value) {
        showFieldError(unitSelect, `Chọn đơn vị tiêu hao tại dòng ${index + 1}.`);
        valid = false;
      }
    });

    form.querySelector('.is-invalid')?.focus();
    return valid;
  }

  function cell(text) {
    const element = document.createElement('td');
    element.textContent = text || '—';
    return element;
  }

  function statusBadge(isActive) {
    const badge = document.createElement('span');
    badge.className = `badge ${isActive ? 'badge-active' : 'badge-locked'}`;
    badge.textContent = isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';
    return badge;
  }

  async function startEdit(productId) {
    try {
      const payload = await window.AdminApi.request(`/admin/products/${productId}`);
      const product = payload.data.product;
      clearFieldErrors(form);
      hideRecipeError();
      form.elements.id.value = product._id;
      form.elements.name.value = product.name;
      form.elements.price.value = product.price;
      form.elements.categoryId.value = product.category?._id || product.category || '';
      form.elements.isActive.value = String(product.isActive);
      recipeRows.replaceChildren();
      (product.recipe?.ingredients || []).forEach(addIngredientRow);
      if (!recipeRows.children.length) addIngredientRow();
      formTitle.textContent = `Cập nhật ${product.productCode}`;
      submitButton.textContent = 'Lưu cập nhật';
      cancelButton.hidden = false;
      statusGroup.hidden = false;
      scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function deactivateProduct(product) {
    if (!confirm(`Ngừng hoạt động sản phẩm ${product.productCode} - ${product.name}? Sản phẩm sẽ không bị xóa khỏi lịch sử.`)) return;
    try {
      await window.AdminApi.request(`/admin/products/${product._id}`, { method: 'DELETE' });
      if (form.elements.id.value === product._id) resetForm();
      showToast('Đã ngừng hoạt động sản phẩm.');
      await loadProducts();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  function renderProducts(products, pageData) {
    tableBody.replaceChildren();
    countLabel.textContent = `${pageData.total} sản phẩm`;

    if (!products.length) {
      const row = document.createElement('tr');
      const empty = cell('Không có sản phẩm phù hợp với bộ lọc.');
      empty.className = 'empty-cell';
      empty.colSpan = 6;
      row.append(empty);
      tableBody.append(row);
    } else {
      products.forEach((product) => {
        const row = document.createElement('tr');
        row.append(
          cell(product.productCode),
          cell(product.name),
          cell(product.category?.name || product.categoryCode),
          cell(formatCurrency(product.price))
        );

        const statusCell = document.createElement('td');
        statusCell.append(statusBadge(product.isActive));
        row.append(statusCell);

        const actionCell = document.createElement('td');
        const actions = document.createElement('div');
        actions.className = 'row-actions';
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn btn-secondary';
        editButton.textContent = 'Sửa';
        editButton.addEventListener('click', () => startEdit(product._id));
        actions.append(editButton);

        if (product.isActive) {
          const deleteButton = document.createElement('button');
          deleteButton.type = 'button';
          deleteButton.className = 'btn btn-danger';
          deleteButton.textContent = 'Ngừng hoạt động';
          deleteButton.addEventListener('click', () => deactivateProduct(product));
          actions.append(deleteButton);
        }
        actionCell.append(actions);
        row.append(actionCell);
        tableBody.append(row);
      });
    }

    pagination.hidden = pageData.totalPages <= 1;
    pageLabel.textContent = `Trang ${pageData.page} / ${Math.max(pageData.totalPages, 1)}`;
    previousPage.disabled = pageData.page <= 1;
    nextPage.disabled = pageData.page >= pageData.totalPages;
  }

  async function loadProducts() {
    const query = new URLSearchParams({
      page: String(currentPage),
      limit: '10',
      category: categoryFilter.value,
      status: statusFilter.value
    });
    const payload = await window.AdminApi.request(`/admin/products?${query}`);
    const pageData = payload.data.pagination;
    if (pageData.totalPages > 0 && currentPage > pageData.totalPages) {
      currentPage = pageData.totalPages;
      return loadProducts();
    }
    renderProducts(payload.data.items, pageData);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const id = form.elements.id.value;
    const data = {
      name: form.elements.name.value.trim(),
      price: Number(form.elements.price.value),
      categoryId: form.elements.categoryId.value,
      ingredients: collectIngredients()
    };
    if (id) data.isActive = form.elements.isActive.value === 'true';

    submitButton.disabled = true;
    try {
      await window.AdminApi.request(id ? `/admin/products/${id}` : '/admin/products', {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(data)
      });
      showToast(id ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm.');
      resetForm();
      currentPage = 1;
      await loadProducts();
    } catch (error) {
      const details = error.details && typeof error.details === 'object' ? { ...error.details } : null;
      let hasFieldError = false;
      if (details?.ingredients) {
        showRecipeError(details.ingredients);
        hasFieldError = true;
        delete details.ingredients;
      }
      hasFieldError = applyFieldErrors(form, details) || hasFieldError;
      if (form.querySelector('.is-invalid')) form.querySelector('.is-invalid').focus();
      else if (!hasFieldError) showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  bindFieldErrorClearing(form);
  recipeRows.addEventListener('input', hideRecipeError);
  recipeRows.addEventListener('change', hideRecipeError);
  addIngredientButton.addEventListener('click', () => addIngredientRow());
  cancelButton.addEventListener('click', resetForm);
  categoryFilter.addEventListener('change', () => {
    currentPage = 1;
    loadProducts().catch((error) => showToast(error.message, 'error'));
  });
  statusFilter.addEventListener('change', () => {
    currentPage = 1;
    loadProducts().catch((error) => showToast(error.message, 'error'));
  });
  previousPage.addEventListener('click', () => {
    if (currentPage <= 1) return;
    currentPage -= 1;
    loadProducts().catch((error) => showToast(error.message, 'error'));
  });
  nextPage.addEventListener('click', () => {
    currentPage += 1;
    loadProducts().catch((error) => showToast(error.message, 'error'));
  });

  try {
    await initAdminPage();
    const optionsPayload = await window.AdminApi.request('/admin/products/options');
    categories = optionsPayload.data.categories || [];
    ingredients = optionsPayload.data.ingredients || [];
    ingredientById = new Map(ingredients.map((ingredient) => [ingredient._id, ingredient]));
    populateCategoryControls();
    resetForm();
    await loadProducts();
  } catch (error) {
    showToast(error.message, 'error');
  }
});
