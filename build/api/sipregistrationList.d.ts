import RepresentationList from './representationList';
import { NimveloClient, RepresentationBase } from '../interfaces';
declare class SipregistrationList extends RepresentationList {
    constructor(client: NimveloClient, parent: RepresentationBase);
}
export default SipregistrationList;
