import { Course } from "../Course/types";

export interface Term {
  id: number;
  termName: string;
  displayName: string;
  courses: Course[];
}
