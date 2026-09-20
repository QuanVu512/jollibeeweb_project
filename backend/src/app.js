const path = require("node:path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const frontendDirectory = path.resolve(__dirname, "../../frontend");
const adminDirectory = path.join(frontendDirectory, "admin");
const shipperDirectory = path.join(frontendDirectory, "shipper");
const banhangDirectory = path.join(frontendDirectory, "banhang");
const customerDirectory = path.join(frontendDirectory, "khachhang");
const kitchenDirectory = path.join(frontendDirectory, "bep");
const publicAssetsDirectory = path.join(frontendDirectory, "assets");
const publicImagesDirectory = path.join(publicAssetsDirectory, "images");
const menuFilesDirectory = path.join(publicAssetsDirectory, "vendor", "menu-files");
const logoFile = path.join(menuFilesDirectory, "logo.png");

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "https://jollibee.com.vn",
          "https://images.unsplash.com",
          "https://placehold.co",
          "https://cdn-icons-png.flaticon.com",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "https://*.onrender.com",
          "http://localhost:3000",
        ],
      },
    },
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: false, limit: "200kb" }));
app.use(cookieParser());
app.use(cors());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "jollibee-admin-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", apiRoutes);
app.get("/assets/logo.png", (_req, res) => res.sendFile(logoFile));
app.use("/assets", express.static(publicAssetsDirectory));
app.use("/images", express.static(publicImagesDirectory));
app.use(
  "/admin",
  express.static(adminDirectory, { index: "index.html", extensions: ["html"] }),
);
app.use(
  "/banhang",
  express.static(banhangDirectory, {
    index: "tao_don_hang.html",
    extensions: ["html"],
  }),
);
app.use(
  "/shipper",
  express.static(shipperDirectory, {
    index: "shipper.html",
    extensions: ["html"],
  }),
);
app.use(
  "/khachhang",
  express.static(customerDirectory, {
    index: "homepage.html",
    extensions: ["html"],
  }),
);
app.use("/Menu_files", express.static(menuFilesDirectory));
app.use(
  "/bep",
  express.static(kitchenDirectory, {
    index: "kitchen.html",
    extensions: ["html"],
  }),
);

app.get("/", (_req, res) => res.redirect("/khachhang/homepage.html"));
app.get("/kitchen-login.html", (_req, res) =>
  res.redirect("/bep/kitchen-login.html"),
);
app.get(["/kitchen.html", "/bep/index.php"], (_req, res) => {
  res.redirect("/bep/kitchen.html");
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
