import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class StartMessageDto {
  @IsString()
  @IsNotEmpty()
  recipientIdentifier!: string;

  @IsString()
  @IsNotEmpty()
  senderIdentifier!: string;

  @IsOptional()
  @IsString()
  text?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  senderIdentifier!: string;

  @IsOptional()
  @IsString()
  text?: string;
}

export class ListMessagesDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}
