import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Node, NodeType } from '../models/Node'
import { PaxosProtocolNetwork } from '../models/PaxosNetworkProtocol'

type proposerCallback = (id: number) => any;

interface NetworkGraphProps {
    paxosProtocolNetwork: PaxosProtocolNetwork;
    onProposerChange: proposerCallback;
}

interface NetworkLink {
    source: number;
    target: number;
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
        const svg = d3.select(svgElement.current)

        var linkElements = svg.selectAll("line")
            .data(links, function(d: any) { return d.source.id + "-" + d.target.id })
            .join(
                (enter) => enter.append("line").style("stroke", "#aaa")
            )

        console.log(nodes)

        var nodeElements: any = svg.selectAll('g.node')
            .data(nodes, (d: any) => d.d3Id )
            .join(
                (enter) => { 
                    let nodeGroup = enter.append("g").attr("class", "node")

                    nodeGroup.append("circle")
                        .attr("r", 30)
                        .attr("class", "body")
                        .style("fill", (d: any) => d.nodeType === NodeType.Acceptor ? 'gray' : 'green' )

                    nodeGroup.append("circle")
                        .attr("r", 10)
                        .attr("class", "id")
                        .attr("cy", -20)
                        .attr("cx", -19)
                        .style("fill", "white")

                    nodeGroup.append("text")
                        .attr("class", "id")
                        .style("text-anchor", "middle")
                        .attr("y", -15)
                        .attr("x", -19)
                        .text((d: any) => d.id)
                    
                    nodeGroup.append("text")
                        .attr("class", "proposal")
                        .style("text-anchor", "middle")
                        .attr("y", 8)
                        .text((d: any) => d.previousProposal.number + '/' + d.previousProposal.value + '/' + d.maxAcceptableProposalNumber)

                    return nodeGroup
                },
                (update) => {
                    
                    update.selectAll("circle.body").style("fill", (d: any) => { console.log(d); return d.nodeType === NodeType.Acceptor ? 'gray' : 'green' })

                    update.selectAll("text.proposal").text((d: any) => d.previousProposal.number + '/' + d.previousProposal.value + '/' + d.maxAcceptableProposalNumber)

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
        console.log(forceSimulation.current)
        let width = 0;
        let height = 0; 
        if(svgElement.current) {
            width = svgElement.current.width.baseVal.value;
            height = svgElement.current.height.baseVal.value;
        } 
        let links = getConnectedLinks(props.paxosProtocolNetwork.nodes);
        forceSimulation.current = buildGraph(props.paxosProtocolNetwork.nodes, links, width, height, props.onProposerChange);
    }, [props.paxosProtocolNetwork])

    return ( 
        <svg className="container" width='100%' height='100%' ref={svgElement}></svg>
    )
    
} 

export default NetworkGraph;