type AcademicYear = `${number}/${number}` | `${number}`;

export enum SemesterType {
  Winter = "Winter",
  Summer = "Summer",
}

export class Semester {
  private constructor(
    private readonly type: SemesterType,
    private readonly year: AcademicYear
  ) {}

  // Create a Semester instance from a string input
  static create(input: string): Semester {
    let { type, year } = Semester.parseSemesterInput(input);
    let validYear = Semester.parseAcademicYear(year, type);
    return new Semester(type, validYear);
  }

  public getSemesterType(): SemesterType {
    return this.type;
  }

  public getAcademicYear(): AcademicYear {
    return this.year;
  }

  public toString(): string {
    return `${this.type} ${this.year}`;
  }

  // Parse the input string to extract the semester type and year
  private static parseSemesterInput(input: string): { type: SemesterType, year: number } {
    if (!input || input === undefined) {
      throw new Error("Semester value cannot be empty");
    }
    const cleanInput = input.trim().toLowerCase();
    const regex = /^(ws|winter|ss|summer)?\s*(\d{2}|\d{4})$/;
    const match = cleanInput.match(regex);

    if (!match || !match[2]) {
      throw new Error(
        `Invalid semester input: ${input}. Use formats like 'WS24', 'Winter 2024', 'SS25', or 'Summer 2025'.`
      );
    }

    let validType = (match[1] === "ws" || match[1] === "winter") ? SemesterType.Winter : SemesterType.Summer; // Normalize to 'winter' or 'summer'
    let validYear = parseInt(match[2]);

    return {
      type: validType,
      year: validYear
    };
  }

  // Helper method to calculate the academic year based on the semester type.
  // And convert 2-digit years to 4-digit years but assumes 21st century.
  private static parseAcademicYear(year: number, type: SemesterType): AcademicYear {
    let academicYear: string;

    if (type === SemesterType.Winter) {
      if (year < 100) {
        academicYear = `20${year}/${year + 1}`; // e.g. 2024/25
      } else {
        let nextYear = year + 1;
        academicYear = `${year}/${nextYear.toString().slice(-2)}`;
      }
      return academicYear as AcademicYear;
    } else {
      if (year < 100) {
        academicYear = `20${year}`; // e.g. 2024
      } else {
        academicYear = `${year}`;
      }
      return academicYear as AcademicYear;
    }
  }
}
