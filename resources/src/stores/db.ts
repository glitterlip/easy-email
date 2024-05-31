import Dexie, {type EntityTable} from 'dexie';
import {Template} from "@/stores/email";

export interface EmailModel {
    email: Template,
    id: number,
    remoteId: number,
    time: number
}

export const db = new Dexie('email') as Dexie & {
    emails: EntityTable<EmailModel, 'id'>
};
db.version(1).stores({
    emails: '++id, remoteId,time'
});