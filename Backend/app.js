import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Parse JSON and URL-encoded data
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Cookie parser
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 Blocked CORS request from: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to your API! 🚀"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running smoothly! ✅",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Handle 404 - Route not found
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`
//   });
// });

// Global error handler
app.use((err, req, res, next) => {
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation: Origin not allowed'
    });
  }

  // Log error for debugging
  console.error('Error:', err.stack);

  // Send error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});
import userroutes from "./routes/user.routes.js"
import categoryRoutes from "./routes/category.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import billRoutes from "./routes/bills.routes.js";
app.use("/api/v1/users", userroutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/bills", billRoutes);
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

export { app, port };