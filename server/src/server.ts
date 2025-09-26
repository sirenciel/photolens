import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const app = createApp();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
