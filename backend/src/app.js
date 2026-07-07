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

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://jollibee.com.vn"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5500"],
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
app.get("/", (_req, res) => res.redirect("/admin/login.html"));
app.get("/kitchen-login.html", (_req, res) => res.sendFile(path.resolve(__dirname, '../public/kitchen-login.html')));
app.get(["/kitchen.html", "/bep/index.php"], (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/kitchen.html"));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
