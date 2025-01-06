import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';

export class IngestNewsDto {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public url: string;

  @IsString()
  @IsNotEmpty()
  public summary: string;

  @IsDateString()
  @IsNotEmpty()
  public publishedDate: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  public authors: string[];

  @IsString()
  @IsNotEmpty()
  public source: string;

  @IsArray()
  @IsOptional()
  public topics?: { topic: string; relevance_score: number }[];

  @IsNumber()
  @IsOptional()
  public overall_sentiment_score?: number;

  @IsString()
  @IsOptional()
  public overall_sentiment_label?: string;

  @IsArray()
  @IsOptional()
  public ticker_sentiment?: { ticker: string; relevance_score: number; ticker_sentiment_score: number; ticker_sentiment_label: string }[];
}
