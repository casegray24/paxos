import { useState, useRef } from "react";
import NetworkGraph, { PaxosProtocolNetwork, generateNetwork } from "./NetworkGraph"; 
import { cloneDeep } from 'lodash';
import { 
    Container, 
    Flex, 
    VStack, 
    Heading,
    Text, 
    SimpleGrid, 
    GridItem, 
    FormControl, 
    FormLabel,
    Input,
    NumberInput, 
    NumberInputField, 
    NumberInputStepper, 
    NumberIncrementStepper, 
    NumberDecrementStepper,
    Button,
    useBreakpointValue
} from "@chakra-ui/react";

export default function NetworkControls() {
    
    const colSpan = useBreakpointValue({ base: 2, md: 1});
    const [nodeCount, setNodeCount] = useState(5);
    const [errorPercentage, setErrorPercentage] = useState(0.0);
    const [proposalValue, setProposalValue] = useState(""); 
    const [proposalNumber, setProposalNumber] = useState(0);
    const [paxosProtocolNetwork, setPaxosProtocolNetwork] = useState<PaxosProtocolNetwork>(generateNetwork(nodeCount, errorPercentage));
    const graphContainer = useRef<HTMLDivElement>(null);

    function handleGenerateGraph() {
        setPaxosProtocolNetwork(generateNetwork(nodeCount, errorPercentage));
    }

    function handlePropose() {
        paxosProtocolNetwork.prepare(proposalNumber, proposalValue);
        // It is important for data binding in D3 that this is done with a shallow copy
        // It is not very "react" but d3 wasnt designed for react
        setPaxosProtocolNetwork(Object.assign(new PaxosProtocolNetwork(), paxosProtocolNetwork))
    }

    function handleProposerChange(nodeId: number) {
        setPaxosProtocolNetwork((previousNetwork) => {
            let newNetwork = cloneDeep(previousNetwork);
            newNetwork.proposerId = nodeId;
            return newNetwork;
        })
    }

    return (
        <Container maxWidth="container.xl" padding={0}>
            <Flex h={{ base: 'auto', md: '100vh'}} py={[0, 10, 20]} direction={{ base: 'column-reverse', md: 'row'}}>
                <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start" bg="gray.50">
                    <VStack spacing={3} alignItems="flex-start">
                        <Heading size="2xl">Paxos Visualization</Heading>
                        <Text>A way to visualize the how the rules that govern the Paxos protocol can acheive consensus in a distributed network.</Text>
                    </VStack>
                    <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
                        <GridItem colSpan={colSpan}>
                            <FormControl>
                                <FormLabel>Number of Nodes</FormLabel>
                                <NumberInput value={nodeCount} min={3} max={30} onChange={(value) => setNodeCount(parseInt(value))}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </GridItem>
                        <GridItem colSpan={colSpan}>
                            <FormControl>
                                <FormLabel>Error Percentage</FormLabel>
                                <NumberInput value={errorPercentage} min={0} max={1} step={0.01} onChange={(value) => setErrorPercentage(parseFloat(value))}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </GridItem>
                        <GridItem colSpan={2}>
                            <Button size="lg" w="full" onClick={handleGenerateGraph}>Generate Graph</Button>
                        </GridItem>
                        <GridItem colSpan={colSpan}>
                            <FormControl>
                                <FormLabel>Proposal Number</FormLabel>
                                <NumberInput value={proposalNumber} min={0} onChange={(value) => setProposalNumber(parseInt(value))}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </GridItem>
                        <GridItem colSpan={colSpan}>
                            <FormControl>
                                <FormLabel>Proposal Value</FormLabel>
                                <Input placeholder="Fill in any value (e.g. 'foo')" value={proposalValue} onChange={(event) => setProposalValue(event.target.value)} />
                            </FormControl>
                        </GridItem>
                        <GridItem colSpan={2}>
                            <Button size="lg" w="full" onClick={handlePropose}>Propose Value</Button>
                        </GridItem>
                    </SimpleGrid>
                </VStack>
                <VStack w="full" h="full" p={0} spacing={0} alignItems="flex-start" ref={graphContainer}>
                    <NetworkGraph paxosProtocolNetwork={paxosProtocolNetwork} onProposerChange={handleProposerChange} />
                </VStack>
            </Flex>
        </Container>
    );
}