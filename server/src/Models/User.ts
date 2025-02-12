import { Visitor } from "./Visitor";
import { CourseProject } from "./CourseProject";
import { Serializable } from "../Serializer/Serializable";
import { Reader } from "../Serializer/Reader";
import { Writer } from "../Serializer/Writer";

export class User extends Visitor implements Serializable {
  protected id: number;
  protected name: string | null = null;
  protected githubUsername: string | null = null;
  protected email: string | null = null;
  protected status: string = "unconfirmed";
  protected password: string | null = null;
  protected resetPasswordToken: string | null = null;
  protected resetPasswordExpire: number | null = null;
  protected confirmEmailToken: string | null = null;
  protected confirmEmailExpire: number | null = null;
  
  /** Do not call this constructor directly. Instead use the SerializableFactory
   *  appropriate for your backend!
   *  example:
   *    const dsf = new DatabaseSerializableFactory(db); 
   *    u: User = dsf.create("User");
   */
  constructor(id: number) {
    super();
    this.id = id;
  }

  readFrom(reader: Reader): void {
    this.id = reader.readNumber("id") as number;
    this.name = reader.readString("name");
    this.githubUsername = reader.readString("githubUsername");
    this.email = reader.readString("email");
    this.status = reader.readString("status") as string;
    this.password = reader.readString("password");
    this.resetPasswordToken = reader.readString("resetPasswordToken");
    this.resetPasswordExpire = reader.readNumber("resetPasswordExpire");
    this.confirmEmailToken = reader.readString("confirmEmailToken");
    this.confirmEmailExpire = reader.readNumber("confirmEmailExpire");
  }

  writeTo(writer: Writer): void {
    writer.writeNumber("id", this.id);
    writer.writeString("name", this.name);
    writer.writeString("githubUsername", this.githubUsername);
    writer.writeString("email", this.email);
    writer.writeString("status", this.status);
    writer.writeString("password", this.password);
    writer.writeString("resetPasswordToken", this.resetPasswordToken);
    writer.writeNumber("resetPasswordExpire", this.resetPasswordExpire);
    writer.writeString("confirmEmailToken", this.confirmEmailToken);
    writer.writeNumber("confirmEmailExpire", this.confirmEmailExpire);
  }

  // Getters
  public getId(): number | undefined{
    return this.id;
  }

  public getName(): string | null {
    return this.name;
  }

  public getGithubUsername(): string | null {
    return this.githubUsername;
  }

  public getEmail(): string | null {
    return this.email;
  }

  public getStatus(): string {
    return this.status;
  }

  public getPassword(): string | null{
    return this.password;
  }

  public getResetPasswordToken(): string | null{
    return this.resetPasswordToken;
  }

  public getResetPasswordExpire(): number | null {
    return this.resetPasswordExpire;
  }

  public getConfirmEmailToken(): string | null {
    return this.confirmEmailToken;
  }

  public getConfirmEmailExpire(): number | null {
    return this.confirmEmailExpire;
  }

  // Setters
  public setName(name: string | null){
    this.name = name;
  }

  public setGithubUsername(githubUsername: string | null){
    this.githubUsername = githubUsername;
  }

  public setEmail(email: string | null){
    this.email = email;
  }

  public setStatus(status: string) {
    this.status = status;
  }

  public setPassword(password: string | null){
    this.password = password;
  }

  public setResetPasswordToken(resetPasswordToken: string | null){
    this.resetPasswordToken = resetPasswordToken;
  }

  public setResetPasswordExpire(resetPasswordExpire: number | null){
    this.resetPasswordExpire = resetPasswordExpire;
  }

  public setConfirmEmailToken(confirmEmailToken: string | null){
    this.confirmEmailToken = confirmEmailToken;
  }

  public setConfirmEmailExpire(confirmEmailExpire: number | null){
    this.confirmEmailExpire = confirmEmailExpire;
  }
}
