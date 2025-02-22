import { Reader } from "../Serializer/Reader";
import { Serializable } from "../Serializer/Serializable";
import { Writer } from "../Serializer/Writer";

export class SubmissionDate implements Serializable {
  protected id: number;
  protected submissionDate: Date = new Date();

  constructor(id: number) {
    this.id = id;
  }

  public getId(): number {
    return this.id;
  }

  public getSubmissionDate(): Date {
    return this.submissionDate;
  }

  public setId(id: number) {
    this.id = id;
  }

  public setSubmissionDate(submissionDate: Date) {
    this.submissionDate = submissionDate;
  }
  
  readFrom(reader: Reader): void {
    this.submissionDate = reader.readDateTime("submissionDate") ?? this.submissionDate;
  }
  
  writeTo(writer: Writer): void {
    writer.writeNumber("id", this.id);
    writer.writeDateTime("submissionDate", this.submissionDate);
  }
}

export class CourseSchedule implements Serializable {
  protected id: number;
  protected startDate: Date = new Date();
  protected endDate: Date = new Date();
  protected submissionDates: SubmissionDate[] = [];
  
  constructor(id: number) {
    this.id = id;
  }

  public getId(): number {
    return this.id;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date {
    return this.endDate;
  }

  public getSubmissionDates(): SubmissionDate[] {
    return this.submissionDates;
  }

  public setId(id: number) {
    this.id = id;
  }

  public setStartDate(startDate: Date) {
    this.startDate = startDate;
  }

  public setEndDate(endDate: Date) {
    this.endDate = endDate;
  }

  public setSubmissionDates(submissionDates: SubmissionDate[]) {
    this.submissionDates = submissionDates;
  }
  
  async readFrom(reader: Reader): Promise<void> {
    this.startDate = reader.readDateTime("startDate") ?? this.startDate;
    this.endDate = reader.readDateTime("endDate") ?? this.endDate;
    this.submissionDates = await reader.readObjects("scheduleId", "SubmissionDate") as SubmissionDate[];
  }
  
  writeTo(writer: Writer): void {
    writer.writeNumber("id", this.id);
    writer.writeDateTime("startDate", this.startDate);
    writer.writeDateTime("endDate", this.endDate);
    writer.writeObjects("scheduleId", this.submissionDates);
  }

}