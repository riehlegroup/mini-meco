import { Serializable } from "./Serializable";

/**
 * Factory for creating new Serializables backend-specifically.
 */
export interface SerializableFactory {
    /**
     * Creates a new object of given class. Also does any backend activity required for 
     * proper object creation.
     */
    create(className: string): Promise<Serializable>;
}