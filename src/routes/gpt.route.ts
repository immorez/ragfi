import { Router } from 'express';
import { GPTController } from '@controllers/gpt.controller';
import { Routes } from '@interfaces/routes.interface';

export class GPTRoute implements Routes {
  public path = '/gpt';
  public router: Router = Router();
  private gptController = new GPTController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/chatgpt/stream`, this.gptController.streamChatGPTAnswer);
  }
}
