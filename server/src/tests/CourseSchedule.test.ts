import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { describe, it, expect } from "vitest";
import { ObjectHandler } from "../ObjectHandler";
import { initializeCourseSchedule } from "../databaseInitializer";
import { CourseSchedule, DeliveryDate } from "../Models/CourseSchedule";

async function openInMem() {
    const db = await open({
        filename: ":memory:",
        driver: sqlite3.Database,
    });
    await initializeCourseSchedule(db);
    
    return db;
}

describe("CourseSchedule", () => {
    // stateless, can be shared
    const oh = new ObjectHandler();
    
    it("should be empty on startup", async () => {
        const db = await openInMem();
        expect(await oh.getCourseSchedule(0, db)).toBeNull();
    });
    
    it("should automatically create id on insertion", async () => {
        const db = await openInMem();
        const expected = new CourseSchedule(
            undefined,
            new Date(2022, 0, 1),
            new Date(2022, 1, 1),
            [
                new DeliveryDate(undefined, new Date(2022, 0, 1))
            ]
        );
        await oh.saveCourseSchedule(expected, db);
        const actual = await oh.getCourseSchedule(1, db);
        expect(actual).toEqual(expected);
    });
    
    it("should not allow duplicate delivery dates", async () => {
        const db = await openInMem();
        const expected = new CourseSchedule(
            undefined,
            new Date(2022, 0, 1),
            new Date(2022, 1, 1),
            [
                new DeliveryDate(undefined, new Date(2022, 0, 1)),
                new DeliveryDate(undefined, new Date(2022, 0, 1))
            ]
        );
        expect(oh.saveCourseSchedule(expected, db)).rejects.toThrow();
    });
    
    it("should not allow deliveries before schedule", async () => {
        const db = await openInMem();
        const expected = new CourseSchedule(
            undefined,
            new Date(2022, 0, 2),
            new Date(2022, 0, 3),
            [
                new DeliveryDate(undefined, new Date(2022, 0, 1)),
            ]
        );
        expect(oh.saveCourseSchedule(expected, db)).rejects.toThrow();
    });

    it("should not allow deliveries after schedule", async () => {
        const db = await openInMem();
        const expected = new CourseSchedule(
            undefined,
            new Date(2022, 0, 1),
            new Date(2022, 0, 2),
            [
                new DeliveryDate(undefined, new Date(2022, 0, 3)),
            ]
        );
        expect(oh.saveCourseSchedule(expected, db)).rejects.toThrow();
    });
    
    it("should allow updating schedules", async () => {
        const db = await openInMem();
        const scheduleBefore = new CourseSchedule(
            undefined,
            new Date(2022, 0, 1),
            new Date(2022, 1, 1),
            [
                new DeliveryDate(undefined, new Date(2022, 0, 1))
            ]
        );
        
        await oh.saveCourseSchedule(scheduleBefore, db);
        const expected = await oh.getCourseSchedule(1, db);
        if (!expected) { throw new Error("expected not null"); }
        expect(expected).toEqual(scheduleBefore);
        expected.setEndDate(new Date(2022, 2, 1));
        expected.getDeliveryDates()[0].setDeliveryDate(new Date(2022, 2, 1));
        await oh.saveCourseSchedule(expected, db);
        
        // still id 1
        expect(await oh.getCourseSchedule(1, db)).toEqual(expected);
    });

    it("should return sorted delivery dates", async () => {
        const db = await openInMem();
        const schedule = new CourseSchedule(
            undefined,
            new Date(2022, 0, 1),
            new Date(2022, 1, 1),
            [
                new DeliveryDate(undefined, new Date(2022, 0, 3)),
                new DeliveryDate(undefined, new Date(2022, 0, 2)),
                new DeliveryDate(undefined, new Date(2022, 0, 1)),
            ]
        );
        await oh.saveCourseSchedule(schedule, db);
        // sorted manually after insertion
        schedule.getDeliveryDates().sort((a, b) => a.getDeliveryDate().getTime() - b.getDeliveryDate().getTime());
        expect(await oh.getCourseSchedule(1, db)).toEqual(schedule);
    });
});
