import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  doctorIdentifier!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}

export class BookSlotDto {
  @IsString()
  @IsNotEmpty()
  patientIdentifier!: string;

  @IsString()
  @IsNotEmpty()
  slotId!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class DecisionDto {
  @IsString()
  @IsNotEmpty()
  doctorIdentifier!: string;

  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelDto {
  @IsString()
  @IsNotEmpty()
  doctorIdentifier!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class DeleteSlotDto {
  @IsString()
  @IsNotEmpty()
  doctorIdentifier!: string;
}

export class CancelPatientDto {
  @IsString()
  @IsNotEmpty()
  patientIdentifier!: string;
}

export class ReportSubmittedDto {
  @IsString()
  @IsNotEmpty()
  doctorIdentifier!: string;
}
