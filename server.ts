import { createHttpApi } from "./src/session/httpApi.ts";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = createHttpApi();

app.listen(PORT, () => {
  console.log(`SpicyApp session server listening on port ${PORT}`);
});
