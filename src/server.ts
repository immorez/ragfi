import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { NewsRoute } from '@/routes/news.routes';
import { GPTRoute } from '@/routes/gpt.route';

ValidateEnv();

const app = new App([new UserRoute(), new AuthRoute(), new NewsRoute(), new GPTRoute()]);

app.listen();
