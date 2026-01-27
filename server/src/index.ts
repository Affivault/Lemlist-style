import { app } from './app.js';
import { env } from './config/env.js';

const port = parseInt(env.PORT, 10);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/v1`);
  console.log(`Health: http://localhost:${port}/health`);
});
