import { IsBoolean } from "class-validator";

export class BlockDto {
  @IsBoolean()
  blocked!: boolean;
}
