import dotenv from "dotenv";
import { ConnectDB } from "./config/dbConfig.js";
import {app,port} from "./app.js"

// Load environment variables
dotenv.config({ path: "./.env" });

ConnectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server is running at: http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  });