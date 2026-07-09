const path = require("node:path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const adminDirectory = path.resolve(__dirname, "../../admin");
const shipperDirectory = path.resolve(__dirname, "../../shipper");
const banhangDirectory = path.resolve(__dirname, "../../banhang");
const publicAssetsDirectory = path.resolve(__dirname, "../../assets");
const logoFile = path.resolve(__dirname, "../../Menu_files/logo.png");

const khachhangDirectory = path.resolve(__dirname, "../../khachhang");
const menuFilesDirectory = path.resolve(__dirname, "../../Menu_files");

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://jollibee.com.vn", "https://images.unsplash.com", "https://placehold.co"],
        scriptSrc: ["'self'", "'unsafe-inline'"],

        scriptSrcAttr: ["'unsafe-inline'"],

        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "http://localhost:3000"],
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
app.use(
  "/admin",
  express.static(adminDirectory, { index: "index.html", extensions: ["html"] }),
);
app.use(
  "/banhang",
  express.static(banhangDirectory, { index: "tao_don_hang.html", extensions: ["html"] }),
);
app.use(
  "/shipper",
  express.static(shipperDirectory, {
    index: "shipper.html",
    extensions: ["html"],
  }),
);
<<<<<<< HEAD
app.get("/", (_req, res) => res.redirect("/admin/login.html"));
app.get("/kitchen-login.html", (_req, res) => {
  res.redirect("/bep/kitchen-login.html");
});
=======
app.use(
  "/khachhang",
  express.static(khachhangDirectory, { index: "homepage.html", extensions: ["html"] })
);
app.use("/Menu_files", express.static(menuFilesDirectory));

//app.get("/", (_req, res) => res.redirect("/admin/login.html"));
// Sửa thành:
app.get("/", (_req, res) => res.redirect("/khachhang/homepage.html"));
app.get("/kitchen-login.html", (_req, res) => res.sendFile(path.resolve(__dirname, '../public/kitchen-login.html')));
>>>>>>> b4e66d9c387d1ab92c9d50485b7aac3d0f2fc1d5
app.get(["/kitchen.html", "/bep/index.php"], (_req, res) => {
  res.redirect("/bep/kitchen.html");
});

const bepDirectory = path.resolve(__dirname, "../../bep");
app.use(
  "/bep",
  express.static(bepDirectory, {
    index: "kitchen.html",
    extensions: ["html"],
  }),
);

// Backward-compatible (bep) routes
app.get("/kitchen-login.html", (_req, res) => res.redirect("/bep/kitchen-login.html"));
app.get(["/kitchen.html", "/bep/index.php"], (_req, res) => {
  res.redirect("/bep/kitchen.html");
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
