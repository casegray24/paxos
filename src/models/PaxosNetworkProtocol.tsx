import { Node, Proposal, NodeType } from "./Node";
import { EventLog, LogLevel } from "./EventLog";

export function generateNetwork(nodeCount: number, errorPercentage: number): PaxosProtocolNetwork {
    Node.uniqueId = 0;
    if(nodeCount <= 0) {
        throw new Error("Number must be positive/nonzero");
    }
    let paxosProtocolNetwork = new PaxosProtocolNetwork();
    let proposer: Node = new Node(errorPercentage, NodeType.Proposer);
    paxosProtocolNetwork.registerNode(proposer);
    paxosProtocolNetwork.proposerId = proposer.id;
    for(let i = 1; i < nodeCount; i++) {
        let node = new Node(errorPercentage, NodeType.Acceptor);
        paxosProtocolNetwork.registerNode(node);
    }
    return paxosProtocolNetwork;
}

export class PaxosProtocolNetwork {

    nodes: Array<Node>;
    nodeIdLookup: { [key: number] : Node };
    _proposerId?: number;
    chosenValue?: string;
    eventLog: EventLog[];

    constructor(nodes: Array<Node> = []) {
        this.nodeIdLookup = {};
        this.nodes = [];
        this.eventLog = [];
        for(let node of nodes) {
            this.registerNode(node);
        }
    }

    get proposer() {
        if(this._proposerId === undefined) {
            throw new Error("There is no proposer id set");
        }
        return this.nodeIdLookup[this._proposerId];
    }

    set proposerId(id: number) {
        if(this._proposerId !== undefined) {
            this.nodeIdLookup[this._proposerId].nodeType = NodeType.Acceptor;
        }
        this.nodeIdLookup[id].nodeType = NodeType.Proposer;
        this._proposerId = id;
    }

    get proposerId() {
        return this._proposerId !== undefined ? this._proposerId : -1
    }

    registerNode(node: Node) {
        this.nodeIdLookup[node.id] = node;
        this.nodes.push(node);
    }

    propose(proposal: Proposal) {
        let responses = 0;
        for(let acceptor of this.nodes) {
            try {
                acceptor.handlePropose(proposal);
                responses++;
            } catch(e) {
                let message;
                if(e instanceof Error) {
                    message = e.message;
                } else {
                    message = String(e);
                }
                this.eventLog.push(new EventLog(acceptor.id, LogLevel.Error, message));
            }
        }
        if(responses > this.nodes.length/2) {
            this.chosenValue = proposal.value;
            this.eventLog.push(
                new EventLog(
                    this.proposerId, 
                    LogLevel.Info, 
                    "Received " + responses + "/" + this.nodes.length + " responses. Value '" + proposal.value + "' has been chosen"
                )
            )
        } else {
            this.eventLog.push(
                new EventLog(
                    this.proposerId, 
                    LogLevel.Info, 
                    "Received " + responses + "/" + this.nodes.length + " responses. Did not received enough responses from acceptor for value " + proposal.value + " to be chosen"
                )
            )
        }
    }

    prepare(proposalNumber: number, proposalValue: string) {
        let maxProposal = new Proposal();
        let responses = 0;
        for(let acceptor of this.nodes) {
            try {
                let proposal = acceptor.handlePrepare(proposalNumber);
                if(proposal.number > maxProposal.number) {
                    maxProposal = proposal;
                }
                responses++
            } catch(e) {
                let message;
                if(e instanceof Error) {
                    message = e.message;
                } else {
                    message = String(e);
                }
                this.eventLog.push(new EventLog(acceptor.id, LogLevel.Error, message));
            }
        }
        if(responses > this.nodes.length/2) {
            if(maxProposal.number > -1) {
                this.eventLog.push(new EventLog(this.proposerId, LogLevel.Info, "Highest numbered proposal recieved ('" + maxProposal.value + "') in prepare overwrites submitted proposal value"))
                proposalValue = maxProposal.value;
            }
            this.propose(new Proposal(proposalNumber, proposalValue));
        } else {
            this.eventLog.push(new EventLog(this.proposerId, LogLevel.Info, "A majority of nodes did not respond to prepare request. Proposal will not be sent"))
        }
    }

}