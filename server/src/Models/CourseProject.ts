import { Reader } from "../Serializer/Reader";
import { Serializable } from "../Serializer/Serializable";
import { Writer } from "../Serializer/Writer";
import { Course } from "./Course";


export class CourseProject implements Serializable {
  protected id: number;
  protected name: string | null = null;
  protected course: Course | null = null;

  constructor(id: number) {
    this.id = id;
  }

  async readFrom(reader: Reader): Promise<void> {
    this.id = reader.readNumber("id") as number;
    this.name = reader.readString("projectName");
    this.course = (await reader.readObject("courseId", "Course")) as Course ;
  }
  writeTo(writer: Writer): void {
    writer.writeNumber("id", this.id);
    writer.writeString("projectName", this.name);
    writer.writeObject<Course>("courseId", this.course);
  }

  // Getters
  public getId(): number {
    return this.id;
  }

  public getName(): string | null {
    return this.name;
  }

  public getCourse(): Course | null {
    if (this.course) {
      return this.course;
    }
    return null;
  }

  // Setters
  public setName(name: string | null) {
    this.name = name;
  }

  public setCourse(course: Course | null): void {
    this.course = course;
  }
}
