import RepresentationList from './representationList';
import { NimveloClient, RepresentationBase } from '../interfaces';
declare class QueueList extends RepresentationList {
    constructor(client: NimveloClient, parent: RepresentationBase);
}
export default QueueList;
