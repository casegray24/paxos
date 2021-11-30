import { SimulationNodeDatum } from "d3-force";

export class Proposal {
    constructor(public number: number = -1, public value: string = '') { }
}

export enum NodeType {
    Acceptor,
    Proposer
}

export class Node implements SimulationNodeDatum {

    static d3UniqueId = 0; // A number that always increments makes it easier to work with D3
    static uniqueId = 0;

    errorPercentage: number;
    nodeType: NodeType;
    maxAcceptableProposalNumber: number;
    previousProposal: Proposal;
    id: number;
    x: number;
    y: number;
    d3Id: number;

    static resetIdCounter() {
        this.uniqueId = 0;
    }

    constructor(errorPercentage: number, nodeType: NodeType, x: number = 0, y: number = 0) {
        this.errorPercentage = errorPercentage;
        this.nodeType = nodeType;
        this.x = 0;
        this.y = 0;
        this.maxAcceptableProposalNumber = 0;
        this.previousProposal = new Proposal();
        this.id = Node.uniqueId++;
        this.d3Id = Node.d3UniqueId++;
    }

    failsRequest() {
        return (this.errorPercentage > Math.random())
    }

    handlePrepare(proposalNumber: number) {
        if(this.failsRequest()) {
            throw new Error("Randomly failed to respond to prepare request");
        }
        if(proposalNumber < this.maxAcceptableProposalNumber) {
            throw new Error("Proposal number is too low to accept. Maximum acceptable value is " + this.maxAcceptableProposalNumber);
        }
        this.maxAcceptableProposalNumber = proposalNumber;
        return this.previousProposal;
    }

    handlePropose(proposal: Proposal) {
        if(this.failsRequest()) {
            throw new Error("Randomly failed to respond to propose request");
        }
        if(proposal.number < this.maxAcceptableProposalNumber) {
            throw new Error("Proposal number is too low to accept. Maximum acceptable value is " + this.maxAcceptableProposalNumber);
        }
        this.maxAcceptableProposalNumber = proposal.number;
        this.previousProposal = proposal;
    }

} 