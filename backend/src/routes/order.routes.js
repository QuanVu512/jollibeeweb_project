const express = require("express");
const controller = require("../controllers/banhang.controller"); 
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use((req, res, next) => {
   
    if (!req.user) {
        req.user = {
            _id: "000000000000000000000000" 
        };
    }
    next();
});

router.post("/", asyncHandler(controller.createOrder));

module.exports = router;