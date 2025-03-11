import 'zone.js/node';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const angularApp = new AngularNodeAppEngine();
const port = 3000;

app.use('/', express.static('dist/'));

app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

app.listen(port, () => {
  console.log(`Angular Server is running on http://localhost:${port}`);
});

export const reqHandler = createNodeRequestHandler(app);
