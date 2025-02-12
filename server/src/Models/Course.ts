import { Reader } from "../Serializer/Reader";
import { Serializable } from "../Serializer/Serializable";
import { Writer } from "../Serializer/Writer";

export class Course implements Serializable {
  protected id: number;
  protected name: string | null = null;
  protected semester: string | null = null;

  constructor(id: number) {
    this.id = id;
  }

  readFrom(reader: Reader): void {
    this.id = reader.readNumber("id") as number;
    this.name = reader.readString("courseName");
    this.semester = reader.readString("semester");
  }

  writeTo(writer: Writer): void {
    writer.writeNumber("id", this.id);
    writer.writeString("courseName", this.name);
    writer.writeString("semester", this.semester);
  }

  // Getters
  public getId(): number {
    return this.id;
  }

  public getName(): string | null{
    return this.name;
  }

  public getSemester(): string | null {
    return this.semester;
  }


  // Setters
  public setName(name: string | null) {
    this.name = name;
  }

  public setSemester(semester: string | null) {
    this.semester = semester;
  }
}
