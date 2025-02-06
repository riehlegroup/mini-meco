import { describe, it, expect } from 'vitest';
import { Semester, SemesterType } from '../Models/Semester';

describe('Value Object creation:', () => {
    describe('Winter Semester Validation', () => {
      const expectedType = SemesterType.Winter;
      const expectedYear = "2024/25";
      const expectedValue = "Winter 2024/25";

      const testCases = [
        { input: "ws24",}, 
        { input: "WS24",},
        { input: "Winter 24",},
        { input: "winter 2024",},
        { input: "WS2024",},
        { input: "ws 2024",}
      ];

      testCases.forEach(({ input}) => {
        it(`should create winter semester from input: "${input}"`, () => {
            const semester = Semester.create(input);
            expect(semester.getSemesterType()).toBe(expectedType);
            expect(semester.getAcademicYear()).toBe(expectedYear);
            expect(semester.toString()).toBe(expectedValue);
        });
      });
    });

    describe('Summer Semester Validation', () => {
      const expectedType = SemesterType.Summer;
      const expectedYear = "2025";
      const expectedValue = "Summer 2025";

      const testCases = [
          { input: "SS25"},
          { input: "ss25"},
          { input: "Summer 25"},
          { input: "summer 2025"},
          { input: "SS2025"},
          { input: "ss 2025"}
      ];
    
        testCases.forEach(({input}) => {
          it(`should create summer semester from input: ${input}`, () => {
            const semester = Semester.create(input);
            expect(semester.getSemesterType()).toBe(expectedType);
            expect(semester.getAcademicYear()).toBe(expectedYear);
            expect(semester.toString()).toBe(expectedValue);
          });
        });
      });
    
    describe('Input Handling Validation', () => {
      const invalidInputs = [
        "",
        " ", 
        "invalid", 
        "202", 
        "WW24", 
        "Summer", 
        "2024/25",
        "s25ws", 
        "2024 ws",
        "wintersemester2024",
        "wintersemester 2024",
        "winter semester2024",
        "sssemester25",
        "sssemester 25",
        "ss semester25",
      ];
  
      invalidInputs.forEach(input => {
        it(`should throw ModelTypeError for invalid input: ${input}`, () => {
          expect(() => Semester.create(input)).toThrow();
        });
      });
    });
});

describe('Value Object instances:', () => {
  it('should create identical instances for the same input', () => {
      const semester1 = Semester.create("WS24");
      const semester2 = Semester.create("winter24");

      expect(semester1).toEqual(semester2); // Same value
      expect(semester1 === semester2).toBe(false); // Different instances
  });

  it('should treat different semester inputs as separate instances', () => {
      const winterSemester = Semester.create("WS24");
      const summerSemester = Semester.create("SS25");

      expect(winterSemester.getSemesterType()).toBe(SemesterType.Winter);
      expect(summerSemester.getSemesterType()).toBe(SemesterType.Summer);
      expect(winterSemester).not.toEqual(summerSemester);
  });
});
