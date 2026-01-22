require("dotenv").config(); // ✅ MUST BE FIRST

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const bookingsRoute = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/services");
const enquiryRoutes = require("./routes/enquiryRoutes");

const app = express();

/* 🔹 ENV */
const PORT = process.env.PORT || 4000;

/* 🔹 MIDDLEWARE */
const allowedOrigins = [
  "http://localhost:5173",          // local dev
  "https://salon-web-client.vercel.app", // production
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

/* ✅ SERVE UPLOADS */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* 🔹 DB */
connectDB();

/* 🔹 ROUTES */
app.get("/", (req, res) => {
  res.send("Salon Backend Running 🚀");
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingsRoute);
app.use("/api/services", serviceRoutes);
app.use("/api/enquiries", enquiryRoutes);

/* 🔹 ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

/* 🔹 HTTP SERVER + SOCKET.IO */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://salon-web-client.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* 🔹 START SERVER */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

