import app from "../api/index.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API Server running on http://localhost:${port}`);
});
