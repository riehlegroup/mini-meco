import { Serializable } from "../Serializer/Serializable";

/**
 * Generic Reader
 */
export interface Reader {
    /**
     * readRoot() contains the main loop which reads all objects.
     * Any specification which objects to read can be passed to the constructor
     * of the classes implementing this interface.
     */
    readRoot<T extends Serializable>(Constructor: new (id: number) => T): T | Promise<T | T[]>;

    /**
     * Writes an object to backend. First writes the reference and then queues the Object for writing, if it was not handled previously.
     * @param attributeName Name used to identify the object reference when reading/writing.
     */
    readObject(attributeName: string, className: string): Promise<Serializable | null> ;

    /**
     * Reads multiple objects from backend (1 to n relation).
     * @param referenceColumnName Name of the column in the table of @params objRefs which references this id.
     * @param className Name of the class to read.
     */
    readObjects(referenceColumnName: string, className: string): Promise<Serializable[]>;

    /**
     * Reads a string from backend with @param attributeName.
     * @param attributeName Name used to identify the attribute when reading/writing.
     */
    readString(attributeName: string): string | null;

    /**
     * Reads a number from backend with @param attributeName.
     * @param attributeName Name used to identify the attribute when reading/writing.
     */
    readNumber(attributeName: string): number | null;

    /**
     * 
     * Reads a datetime from backend with @param attributeName.
     * @param attributeName Name used to identify the attribute when reading/writing.
     */
    readDateTime(attributeName: string): Date | null;
}