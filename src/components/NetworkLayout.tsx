import { useState } from "react";
import { PaxosProtocolNetwork, generateNetwork } from "../models/PaxosNetworkProtocol";
import AppDescription from "./AppDescription";
import EventLogTable from "./EventLogTable";
import NetworkGraph from "./NetworkGraph"; 
import { 
    Container, 
    Flex, 
    VStack, 
    useBreakpointValue
} from "@chakra-ui/react";
import ProposerControls from "./ProposerControls";
import NetworkControls from "./NetworkControls";

export default function NetworkLayout() {
    
    const colSpan = useBreakpointValue({ base: 2, md: 1});
    const [nodeCount, setNodeCount] = useState(5);
    const [errorPercentage, setErrorPercentage] = useState(0.0);
    const [proposalValue, setProposalValue] = useState("");
    const [minProposalValue, setMinProposalValue] = useState(0);
    const [proposalNumber, setProposalNumber] = useState(0);
    const [paxosProtocolNetwork, setPaxosProtocolNetwork] = useState<PaxosProtocolNetwork>(generateNetwork(nodeCount, errorPercentage));
    const [showDescription, setShowDescription] = useState(true);

    function handleGenerateGraph(nodeCount: number, errorPercentage: number) {
        setPaxosProtocolNetwork(generateNetwork(nodeCount, errorPercentage));
    }

    function handlePropose(proposalNumber: number, proposalValue: string) {
        paxosProtocolNetwork.prepare(proposalNumber, proposalValue);
        // It is important for data binding in D3 that this is done with a shallow copy
        // The reason being that d3 binds data by object reference 
        // It is not very "react" but d3 wasnt designed for react
        setPaxosProtocolNetwork(Object.assign(new PaxosProtocolNetwork(), paxosProtocolNetwork))
    }

    function handleProposerChange(nodeId: number) {
        setMinProposalValue(paxosProtocolNetwork.nodeIdLookup[nodeId].maxAcceptableProposalNumber);
        setPaxosProtocolNetwork((previousNetwork) => {
            previousNetwork.proposerId = nodeId;
            return Object.assign(new PaxosProtocolNetwork(), paxosProtocolNetwork);
        })
    }

    return (
        <Container maxWidth="container.xl" padding={0}>
            <Flex h={{ base: 'auto'}} py={[0, 5]} direction={{ base: 'column-reverse', md: 'row'}}>
                <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start" bg="gray.50">
                    <AppDescription showDescription={showDescription} onCollapse={() => setShowDescription(!showDescription)}/>
                    <NetworkControls
                        nodeCount={nodeCount}
                        errorPercentage={errorPercentage}
                        onNodeCountChange={(value) => setNodeCount(parseInt(value))}
                        onErrorPercentageChange={(value) => setErrorPercentage(parseFloat(value))}
                        onGenerateGraph={(nodeCount, errorPercentage) => handleGenerateGraph(nodeCount, errorPercentage)}
                    />
                    <ProposerControls 
                        proposalNumber={proposalNumber}
                        minProposalValue={minProposalValue} 
                        onProposalNumberChange={(value) => setProposalNumber(parseInt(value))}
                        proposalValue={proposalValue}
                        colSpan={colSpan}
                        onProposalValueChange={(event) => setProposalValue(event.target.value)}
                        onPropose={(proposalNumber, proposalValue) => handlePropose(proposalNumber, proposalValue)}
                    />
                </VStack>
                <VStack w="full" h={{base: '400px', md: 'auto'}} p={0} spacing={0} alignItems="flex-start">
                    <NetworkGraph paxosProtocolNetwork={paxosProtocolNetwork} onProposerChange={handleProposerChange} />
                </VStack>
            </Flex>
            <EventLogTable eventLog={paxosProtocolNetwork.eventLog}/>
        </Container>
    );
}