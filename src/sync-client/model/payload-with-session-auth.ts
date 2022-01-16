/**
 * Anki Sync Api
 * Api for Anki Synchronization
 *
 * The version of the OpenAPI document: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { SessionAuth } from './session-auth';
import { Payload } from './payload';


export interface PayloadWithSessionAuth { 
    /**
     * GZip compression enabled
     */
    c: number;
    data: Blob;
    /**
     * server-defined SessionKey - used to identify the session
     */
    sk: string;
}
