import { Router } from 'express';
import { NewsController } from '@controllers/news.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware'; // Assuming news operations require authentication
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { IngestNewsDto } from '@/dtos/news.dto';

export class NewsRoute implements Routes {
  public path = '/news';
  public router: Router = Router();
  public newsController = new NewsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Ingest news articles manually
    this.router.post(`${this.path}/ingest`, AuthMiddleware, ValidationMiddleware(IngestNewsDto), this.newsController.ingestNews);

    this.router.post(`${this.path}/fetch-ingest-latest`, AuthMiddleware, this.newsController.fetchAndIngestLatestNews);

    this.router.get(`${this.path}/search`, AuthMiddleware, this.newsController.searchNews);

    this.router.get(`${this.path}/:id`, AuthMiddleware, this.newsController.getNewsById);

    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.newsController.deleteNewsById);
  }
}
