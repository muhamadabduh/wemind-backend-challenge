import { IsString, IsInt, IsISO8601, IsOptional } from "class-validator";


export class CreateSessionDto {
  @IsString()
  topic: string;

  @IsInt()
  duration: number;

  @IsISO8601()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;

}