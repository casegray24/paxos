import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { SimulationNodeDatum } from "d3-force";

enum NodeType {
    Acceptor,
    Proposer
}

export class Proposal {
    constructor(public number: number = -1, public value: string = '') { }
}


export class PaxosProtocolNetwork {

    nodes: Array<Node>;
    nodeIdLookup: { [key: number] : Node };
    _proposerId?: number;
    chosenValue?: string;

    constructor(nodes: Array<Node> = []) {
        this.nodeIdLookup = {};
        this.nodes = [];
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
                console.log(e);
            }
        }
        if(responses > this.nodes.length/2) {
            this.chosenValue = proposal.value;
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
                console.log(e);
            }
        }
        if(responses > this.nodes.length/2) {
            if(maxProposal.number > -1) {
                proposalValue = maxProposal.value;
            }
            this.propose(new Proposal(proposalNumber, proposalValue));
        }
    }

}


export class Node implements SimulationNodeDatum {

    static uniqueId = 0;

    errorPercentage: number;
    nodeType: NodeType;
    maxAcceptableProposalNumber: number;
    previousProposal: Proposal;
    id: number;
    x: number;
    y: number;

    constructor(errorPercentage: number, nodeType: NodeType, x: number = 0, y: number = 0) {
        this.errorPercentage = errorPercentage;
        this.nodeType = nodeType;
        this.x = 0;
        this.y = 0;
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

} 

type proposerCallback = (id: number) => any;

interface NetworkGraphProps {
    paxosProtocolNetwork: PaxosProtocolNetwork;
    onProposerChange: proposerCallback;
}

interface NetworkLink {
    source: number;
    target: number;
}

export function generateNetwork(nodeCount: number, errorPercentage: number): PaxosProtocolNetwork {
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

function NetworkGraph(props: NetworkGraphProps) {

    const svgElement = useRef<SVGSVGElement>(null);
    var forceSimulation = useRef<any>();

    function getConnectedLinks(nodes: Array<Node>): Array<NetworkLink> {
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

    function buildGraph(nodes: Array<Node>, links: Array<NetworkLink>, width: number, height: number, onProposerChange: proposerCallback) {
        console.log(nodes)
        const svg = d3.select(svgElement.current)

        var linkElements = svg.selectAll("line")
            .data(links, function(d: any) { return d.source.id + "-" + d.target.id })
            .join(
                (enter) => enter.append("line").style("stroke", "#aaa")
            )

        var nodeElements: any = svg.selectAll('g.node')
            .data(nodes, (d: any) => d.id )
            .join(
                (enter) => { 
                    let nodeGroup = enter.append("g").attr("class", "node")

                    nodeGroup.append("circle")
                        .attr("r", 30)
                        .style("fill", (d: any) => d.nodeType === NodeType.Acceptor ? 'gray' : 'green' )
                    
                    nodeGroup.append("text")
                        .style("text-anchor", "middle")
                        .attr("y", 15)
                        .text((d: any) => d.previousProposal.number + ' ' + d.previousProposal.value )

                    return nodeGroup
                },
                (update) => {
                    
                    update.selectAll("circle").style("fill", (d: any) => d.nodeType === NodeType.Acceptor ? 'gray' : 'green' )

                    update.selectAll("text").text((d: any) => { console.log(d); return d.previousProposal.number + ' ' + d.previousProposal.value})

                    update.raise() // Ensure nodes are drawn above lines

                    return update
                }
            )

        let simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink()
                .id(function(d: any) { return d.id; })
                .links(links)
            )
            .force("charge", d3.forceManyBody().strength(-800))
            .force("center", d3.forceCenter(width/2, height/2))
            .on("tick", ticked);
        
        function ticked() {
            linkElements
                .attr("x1", function(d: any) { return d.source.x; })
                .attr("y1", function(d: any) { return d.source.y; })
                .attr("x2", function(d: any) { return d.target.x; })
                .attr("y2", function(d: any) { return d.target.y; });

            nodeElements.attr("transform", function(d: any) { return "translate(" + d.x + "," + d.y + ")";})
        }

        nodeElements.on("click", (e: any, d: any) => onProposerChange(d.id))

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

        nodeElements.call(drag(simulation));

        return simulation;
    }


    useEffect(() => {
        function handleResize() {
            let width = 0;
            let height = 0;
            if(svgElement.current) {
                width = svgElement.current.width.baseVal.value;
                height = svgElement.current.height.baseVal.value;
            }
            if(forceSimulation.current) {   
                forceSimulation.current.stop();
                forceSimulation.current.force('center', d3.forceCenter(width/2, height/2));
                forceSimulation.current.restart();
            }
        }
        
        handleResize()
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize)
    })

    useEffect(() => {
        console.log("updated")
        let width = 0;
        let height = 0; 
        if(svgElement.current) {
            width = svgElement.current.width.baseVal.value;
            height = svgElement.current.height.baseVal.value;
        }
        let links = getConnectedLinks(props.paxosProtocolNetwork.nodes);
        forceSimulation.current = buildGraph(props.paxosProtocolNetwork.nodes, links, width, height, props.onProposerChange);
    }, [props.paxosProtocolNetwork, props.onProposerChange])

    return ( 
        <svg className="container" width='100%' height='100%' ref={svgElement}></svg>
    )
    
} 

export default NetworkGraph;