import React, { useState } from "react";
import { NetworkGraph } from "./NetworkGraph";

export default function NetworkControls() {
    
    const [nodeCount, setNodeCount] = useState(1);
    const [errorPercentage, setErrorPercentage] = useState(0.0);

    function renderNetworkGraph(nodeCount: number, errorPercentage: number) {
        return (
            <NetworkGraph/>
        )
    }

    return (
        <div>
            <h4>Number of nodes</h4><input type="number" min="1" max="20" value={nodeCount}></input>
            <h4>Error Percentage</h4><input type="number" min="0" max="1" step="0.1" value={errorPercentage}></input>
            <br/>
            <br/>
            <button onClick={() => console.log("button")}>
            Generate Graph
            </button>
            <NetworkGraph/>
        </div>
    );
}