import { Serializable } from "./Serializable";

/**
 * Generic Writer
 */
export interface Writer {
    /**
     * writeRoot() contains the main loop which writes @param rootObject
     * and all referenced objects.
     * @param rootObject Object to be written.
     */
    writeRoot(rootObject: Serializable): void;

    /**
     * Writes an object to backend. First writes the reference and then queues the Object for writing, if it was not handled previously.
     * @param attributeName Name used to identify the object reference when reading/writing.
     * @param objRef Serializable to be written.
     */
    writeObject<T extends Serializable>(attributeName: string, objRef: T | null): void;

    /**
     * Writes @param string to backend with @param attributeName.
     * @param attributeName Name used to identify the attribute when reading/writing.
     * @param string Attribute Value.
     */
    writeString(attributeName: string, string: String | null): void;

    /**
     * Writes @param number to backend with @param attributeName.
     * @param attributeName Name used to identify the attribute when reading/writing.
     * @param number Attribute Value.
     */
    writeNumber(attributeName: string, number: number | null): void;

    /**
     * 
     * @todo Figure out, what ts type goes here!
     */
    // writeDateTime(attributeName: String, dateTime: ???): void; 
}