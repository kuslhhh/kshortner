import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});