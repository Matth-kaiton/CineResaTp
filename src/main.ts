import { buildApp, createAdapters } from "./container";

const adapters = createAdapters();
const app = buildApp(adapters);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`CinéResa sur http://localhost:${PORT}`));
}

export default app;
