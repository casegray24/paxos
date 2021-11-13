import React from "react";
import * as d3 from "d3";

enum NodeType {
    Acceptor,
    Proposer
}

class Proposal {
    constructor(public number: number = -1, public value: number = -1) { }
}

interface NodeProps {
    nodeType: NodeType;
    errorPercentage: number;
    chosenValue: number;
    nextProposalnumber: number;
    maxAcceptableProposalnumber: number;
    previousProposal: Proposal;
    id: number;
}

class Network {

    constructor(public acceptors: Array<Node>, public proposer: Node) {  }

    set proposerId(id: number) {
        // Only one active proposer at a time
        if(this.proposer.id == id) {
            return
        }

        let newProposerIndex = this.acceptors.findIndex((node) => node.id == id)
        if(newProposerIndex == -1) {
            throw new Error("Provided node id is not present in the network");
        }

        let newProposer = this.acceptors.splice(newProposerIndex, 1)[0];
        this.proposer.nodeType = NodeType.Acceptor;
        this.acceptors.push(this.proposer);

        this.proposer = newProposer;
        this.proposer.nodeType = NodeType.Proposer;
    }

    addAcceptor(acceptor: Node) {
        this.acceptors.push(acceptor)
    }

}

class Node {

    static uniqueId = 0;

    network: Network;
    errorPercentage: number;
    nodeType: NodeType;
    chosenValue: number;
    nextProposalnumber: number;
    maxAcceptableProposalNumber: number;
    previousProposal: Proposal;
    id: number;

    constructor(network: Network, errorPercentage: number, nodeType: NodeType) {
        this.network = network;
        this.errorPercentage = errorPercentage;
        this.nodeType = nodeType;
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
        for(let acceptor of this.network.acceptors) {
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
        if(responses > this.network.acceptors.length/2) {
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
        for(let acceptor of this.network.acceptors) {
            try {
                acceptor.handlePropose(proposal);
                responses++;
            } catch(e) {
                console.log(e);
            }
        }
        if(responses > this.network.acceptors.length/2) {
            this.chosenValue = proposal.value;
        }
    }

} 

interface NetworkGraphProps {
    nodes: Array<Node>
}

interface NetworkLink {
    source: number;
    target: number;
}

export class NetworkGraph extends React.Component {

    ref!: SVGSVGElement

    constructor(props: NetworkGraphProps) {
        super(props)
        this.state = {
            nodes: props.nodes,
            links: this.getConnectedLinks(props.nodes)
        }
    }

    getConnectedLinks(nodes: Array<Node>) {
        let links: Array<NetworkLink> = [];
        for(let node of nodes) {
            for(let i = 0; i < nodes.length; i++) {
                if(node.id == i) {
                    continue;
                }
                links.push({
                    source: node.id,
                    target: i
                });
            }
        }
        return links;
    }

    buildGraph(nodes: Array<Node>, links: Array<NetworkLink>) {
        const svg = d3.select(this.ref)

        var link = svg.selectAll("line")
            .data(links, function(d: any) { return d.source.id + "-" + d.target.id })
            .join("line")
            .style("stroke", "#aaa")

        var node = svg.selectAll('g')
            .data(nodes, function(d: any) { return d.id })
            .join("g")
            .attr("class", "node")

        var circle = node.append("circle")
            .attr("r", 30)
            .style("fill", "green")

        var text = node.append("text")
            .style("text-anchor", "middle")
            .attr("y", 15)

        text.text(function(d) { return d.previousProposal.number + ' ' + d.previousProposal.value })

        var simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink()
                .id(function(d) { return d.id; })
                .links(links)
            )
            .force("charge", d3.forceManyBody().strength(-800))
            .force("center", d3.forceCenter(width/2, height/2))
            .on("tick", ticked);
        
        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";})

            circle.style("fill", (d) => d.nodeType == nodeType.ACCEPTOR ? 'gray' : 'green' )

            text.text(function(d) { return d.previousProposal.number + ' ' + d.previousProposal.value })
        }

        node.on("click", (e, d) => d.network.proposerId = d.id)

        function drag(simulation) {

            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event) {
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

    componentDidMount() {
        this.buildGraph([])
    }

    render() {
        return (<div className="svg_container">
            <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref} width='100' height='100'></svg>
        </div>)
    }
}