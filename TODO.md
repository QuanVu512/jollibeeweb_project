# TODO

## Kitchen dashboard refresh fix
- [x] Copy/align UI so route `/api/v1/kitchen/view` renders the same “bep/kitchen.html” dashboard that has “Nhập kho” + “Nguyên liệu trong kho”.
  - Change backend template rendering to use `bep/kitchen.html` instead of `backend/public/kitchen.html`.
- [ ] Run quick manual verification:
  - Create order -> confirm -> inventory table updates.
  - Check both tabs still switch correctly.
- [ ] If you still see no update, check browser network logs for POST `/api/v1/kitchen/orders/:id/confirm` and then GET `/api/v1/kitchen/ingredients`.

