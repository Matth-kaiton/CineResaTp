import path from "path";
import fs from "fs";

const DB_FILE = path.join(__dirname, "..", "..", "..", "..", "data", "db.json");

export function readDb(): any {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

export function writeDb(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
