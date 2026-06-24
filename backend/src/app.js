const path = require("node:path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const adminDirectory = path.resolve(__dirname, "../../admin");
const shipperDirectory = path.resolve(__dirname, "../../shipper");
const logoFile = path.resolve(__dirname, "../../Menu_files/logo.png");

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://jollibee.com.vn"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
      },
    },
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: false, limit: "200kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "jollibee-admin-api",
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/v1", apiRoutes);
app.get("/assets/logo.png", (_req, res) => res.sendFile(logoFile));
app.use(
  "/admin",
  express.static(adminDirectory, { index: "index.html", extensions: ["html"] }),
);
app.use(
  "/shipper",
  express.static(shipperDirectory, {
    index: "shipper.html",
    extensions: ["html"],
  }),
);
app.get("/", (_req, res) => res.redirect("/admin/login.html"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
