import { useState, useRef } from "react";
import NetworkGraph, { Node } from "./NetworkGraph"; 
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
    const [nodeCount, setNodeCount] = useState(3);
    const [errorPercentage, setErrorPercentage] = useState(0.0);
    const [nodes, setNodes] = useState<Node[]>([]);
    const nodeCountInputRef = useRef<HTMLInputElement>(null);
    const errorPercentageInputRef = useRef<HTMLInputElement>(null);
    const graphContainer = useRef<HTMLDivElement>(null);

    function handleClick() {
        if(nodeCountInputRef.current) {
            setNodeCount(parseInt(nodeCountInputRef.current.value));
        }
        if(errorPercentageInputRef.current) {
            setErrorPercentage(parseFloat(errorPercentageInputRef.current.value));
        }
    }

    function handleProposerChange(nodeId: number) {
        setNodes((previousNodes) => {
            let newNodes = [...previousNodes];
            newNodes[0].network.proposerId = nodeId;
            return newNodes;
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
                                <NumberInput defaultValue={nodeCount} min={3} max={30}>
                                    <NumberInputField ref={nodeCountInputRef} />
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
                                <NumberInput defaultValue={errorPercentage} min={0} max={1} step={0.01}>
                                    <NumberInputField ref={errorPercentageInputRef} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </GridItem>
                        <GridItem colSpan={2}>
                            <Button size="lg" w="full" onClick={handleClick}>Generate Graph</Button>
                        </GridItem>
                        <GridItem colSpan={colSpan}>
                            <FormControl>
                                <FormLabel>Proposal Number</FormLabel>
                                <NumberInput min={0}>
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
                                <Input />
                            </FormControl>
                        </GridItem>
                    </SimpleGrid>
                </VStack>
                <VStack w="full" h="full" p={0} spacing={0} alignItems="flex-start" ref={graphContainer}>
                    <NetworkGraph nodeCount={nodeCount} errorPercentage={errorPercentage} onProposerChange={handleProposerChange} />
                </VStack>
            </Flex>
        </Container>
    );
}