import { Visitor } from "./Visitor";
import { CourseProject } from "./CourseProject";

export class User extends Visitor {

  constructor(
    protected id: number = 0,
    protected name: string = "",
    protected githubUsername: string = "",
    protected email: string = "",
    protected status: string = "",
    protected password: string = "",
    protected resetPasswordToken: string = "",
    protected resetPasswordExpire: number = 0,
    protected confirmEmailToken: string = "",
    protected confirmEmailExpire: number = 0,
    protected projectsUserIsMemberOf: CourseProject[] = []
  ) {
    super();
  }

  // Getters
  public getId(): number{
    return this.id;
  }

  public getName(): string{
    return this.name;
  }

  public getGithubUsername(): string{
    return this.githubUsername;
  }

  public getEmail(): string{
    return this.email;
  }

  public getStatus(): string{
    return this.status;
  }

  public getPassword(): string{
    return this.password;
  }

  public getResetPasswordToken(): string{
    return this.resetPasswordToken;
  }

  public getResetPasswordExpire(): number{
    return this.resetPasswordExpire;
  }

  public getConfirmEmailToken(): string{
    return this.confirmEmailToken;
  }

  public getConfirmEmailExpire(): number{
    return this.confirmEmailExpire;
  }

  public getProjectsMemberIn(): CourseProject[]{
    return this.projectsUserIsMemberOf;
  }

  // Setters
  public setId(id: number){
    this.id = id;
  }

  public setName(name: string){
    this.name = name;
  }

  public setGithubUsername(githubUsername: string){
    this.githubUsername = githubUsername;
  }

  public setEmail(email: string){
    this.email = email;
  }

  public setStatus(status: string){
    this.status = status;
  }

  public setPassword(password: string){
    this.password = password;
  }

  public setResetPasswordToken(resetPasswordToken: string){
    this.resetPasswordToken = resetPasswordToken;
  }

  public setResetPasswordExpire(resetPasswordExpire: number){
    this.resetPasswordExpire = resetPasswordExpire;
  }

  public setConfirmEmailToken(confirmEmailToken: string){
    this.confirmEmailToken = confirmEmailToken;
  }

  public setConfirmEmailExpire(confirmEmailExpire: number){
    this.confirmEmailExpire = confirmEmailExpire;
  }

  public setProjectsMemberIn(projectsUserIsMemberOf: CourseProject[]){
    this.projectsUserIsMemberOf = projectsUserIsMemberOf;
  }

  // Command

  public addProject(project: CourseProject){
    this.projectsUserIsMemberOf.push(project)
  }

  public removeProject(project: CourseProject){
    this.projectsUserIsMemberOf = this.projectsUserIsMemberOf.filter(projectEl => projectEl.projectName != project.projectName);
  }
}
