import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.raw({ type: "*/*", limit: "500mb" }));

const DATA_ROOT = path.join(process.cwd(), "data");

/**
 * PUT object
 * Matches /objects/<anything>
 */
app.put(/^\/objects\/(.+)/, async (req, res) => {
  const key = req.params[0]; // captured by regex
  const filePath = path.join(DATA_ROOT, key);

  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/**
 * GET object
 * Matches /objects/<anything>
 */
app.get(/^\/objects\/(.+)/, async (req, res) => {
  const key = req.params[0];
  const filePath = path.join(DATA_ROOT, key);

  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }

  res.sendFile(filePath);
});

app.listen(4000, () => {
  console.log("Schlüssel object storage running on :4000");
});
