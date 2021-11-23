import React from "react";
import * as d3 from "d3";
import { SimulationNodeDatum } from "d3-force";

enum NodeType {
    Acceptor,
    Proposer
}

class Proposal {
    constructor(public number: number = -1, public value: number = -1) { }
}

class Network {

    nodes: Array<Node>;
    nodeIdLookup: { [key: number] : Node };
    _proposerId?: number;

    constructor(nodes: Array<Node> = []) {
        this.nodeIdLookup = {};
        this.nodes = [];
        for(let node of nodes) {
            this.registerNode(node);
        }
    }

    set proposerId(id: number) {
        if(this._proposerId) {
            this.nodeIdLookup[this._proposerId].nodeType = NodeType.Acceptor;
        }
        this.nodeIdLookup[id].nodeType = NodeType.Proposer;
        this._proposerId = id;
    }

    registerNode(node: Node) {
        this.nodeIdLookup[node.id] = node;
        this.nodes.push(node);
    }

}

class Node implements SimulationNodeDatum {

    static uniqueId = 0;

    network: Network;
    errorPercentage: number;
    nodeType: NodeType;
    chosenValue: number;
    nextProposalnumber: number;
    maxAcceptableProposalNumber: number;
    previousProposal: Proposal;
    id: number;
    x: number;
    y: number;

    constructor(network: Network, errorPercentage: number, nodeType: NodeType, x: number = 0, y: number = 0) {
        this.network = network;
        this.errorPercentage = errorPercentage;
        this.nodeType = nodeType;
        this.x = 0;
        this.y = 0;
        this.chosenValue = 0;
        this.nextProposalnumber = 0;
        this.maxAcceptableProposalNumber = 0;
        this.previousProposal = new Proposal();
        this.id = Node.uniqueId++;
    }

    failsRequest() {
        return (this.errorPercentage > Math.random())
    }

    handlePrepare(proposalNumber: number) {
        if(this.failsRequest()) {
            throw new Error("Failure to handle request");
        }
        if(proposalNumber < this.maxAcceptableProposalNumber) {
            throw new Error("Proposal number is too low");
        }
        this.maxAcceptableProposalNumber = proposalNumber;
        return this.previousProposal;
    }

    prepare(proposalValue: number) {
        let maxProposal = new Proposal();
        let responses = 0;
        for(let acceptor of this.network.nodes) {
            try {
                let proposal = acceptor.handlePrepare(this.nextProposalnumber);
                if(proposal.number > maxProposal.number) {
                    maxProposal = proposal;
                }
                responses++
            } catch(e) {
                console.log(e);
            }
        }
        if(responses > this.network.nodes.length/2) {
            if(maxProposal.number > -1) {
                proposalValue = maxProposal.value;
            }
            this.propose(new Proposal(this.nextProposalnumber, proposalValue));
        }
        this.nextProposalnumber++;
    }

    handlePropose(proposal: Proposal) {
        if(this.failsRequest()) {
            throw new Error("Failure to handle request");
        }
        if(proposal.number < this.maxAcceptableProposalNumber) {
            throw new Error("Proposal number is too low");
        }
        this.maxAcceptableProposalNumber = proposal.number;
        this.previousProposal = proposal;
    }

    propose(proposal: Proposal) {
        let responses = 0;
        for(let acceptor of this.network.nodes) {
            try {
                acceptor.handlePropose(proposal);
                responses++;
            } catch(e) {
                console.log(e);
            }
        }
        if(responses > this.network.nodes.length/2) {
            this.chosenValue = proposal.value;
        }
    }

} 

interface NetworkGraphProps {
    nodeCount: number;
    errorPercentage: number;
}

interface NetworkLink {
    source: number;
    target: number;
}

export class NetworkGraph extends React.Component<NetworkGraphProps> {

    ref!: SVGSVGElement
    width: number = 500;
    height: number = 500;
    nodes: Node[];
    links: NetworkLink[];

    constructor(props: NetworkGraphProps) {
        super(props)
        this.nodes = this.generateNodes(props.nodeCount, props.errorPercentage);
        this.links = this.getConnectedLinks(this.nodes);
    }

    generateNodes(nodeCount: number, errorPercentage: number): Array<Node> {
        if(nodeCount <= 0) {
            throw new Error("Number must be positive/nonzero");
        }
        let network: Network = new Network();
        let nodes: Array<Node> = [];
        let proposer: Node = new Node(network, errorPercentage, NodeType.Proposer);
        nodes.push(proposer);
        network.registerNode(proposer);
        network.proposerId = proposer.id;
        for(let i = 1; i < nodeCount; i++) {
            let node = new Node(network, errorPercentage, NodeType.Acceptor);
            network.registerNode(node);
            nodes.push(node);
        }
        return nodes;
    }

    getConnectedLinks(nodes: Array<Node>): Array<NetworkLink> {
        let links: Array<NetworkLink> = [];
        for(let i = 0; i < nodes.length - 1; i ++) {
            for(let j = i; j < nodes.length; j++) {
                links.push({
                    source: nodes[i].id,
                    target: nodes[j].id
                });
            }
        }
        return links;
    }

    buildGraph(nodes: Array<Node>, links: Array<NetworkLink>) {

        const svg = d3.select(this.ref)

        var link: any = svg.selectAll("line")
            .data(links, function(d: any) { return d.source.id + "-" + d.target.id })
            .join("line")
            .style("stroke", "#aaa")

        var node: any = svg.selectAll('g')
            .data(nodes, function(d: any) { return d.id })
            .join("g")
            .attr("class", "node")

        var circle: any = node.append("circle")
            .attr("r", 30)
            .style("fill", "green")

        var text: any = node.append("text")
            .style("text-anchor", "middle")
            .attr("y", 15)

        text.text(function(d: any) { return d.previousProposal.number + ' ' + d.previousProposal.value })

        var simulation: any = d3.forceSimulation(nodes)
            .force("link", d3.forceLink()
                .id(function(d: any) { return d.id; })
                .links(links)
            )
            .force("charge", d3.forceManyBody().strength(-800))
            .force("center", d3.forceCenter(this.width/2, this.height/2))
            .on("tick", ticked);
        
        function ticked() {
            link
                .attr("x1", function(d: any) { return d.source.x; })
                .attr("y1", function(d: any) { return d.source.y; })
                .attr("x2", function(d: any) { return d.target.x; })
                .attr("y2", function(d: any) { return d.target.y; });

            node.attr("transform", function(d: any) { return "translate(" + d.x + "," + d.y + ")";})

            circle.style("fill", (d: any) => d.nodeType === NodeType.Acceptor ? 'gray' : 'green' )

            text.text(function(d: any) { return d.previousProposal.number + ' ' + d.previousProposal.value })
        }

        node.on("click", (e: any, d: any) => d.network.proposerId = d.id)

        function drag(simulation: any) {

            function dragstarted(event: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event: any) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event: any) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        node.call(drag(simulation));
    }

    componentDidUpdate() {
        this.nodes = this.generateNodes(this.props.nodeCount, this.props.errorPercentage);
        this.links = this.getConnectedLinks(this.nodes);
        this.buildGraph(this.nodes, this.links);
    }

    componentDidMount() {
        this.buildGraph(this.nodes, this.links);
    }

    render() {
        return (<div className="svg_container">
            <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref} width='500' height='500'></svg>
        </div>)
    }
}