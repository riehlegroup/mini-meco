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
     * @todo Figure out, what ts type goes here!
     */
    // readDateTime(attributeName: String): ???; 
}