import React, { useEffect, useState } from "react";
import { NetworkGraph } from "./NetworkGraph";
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
    const [graphWidth, setGraphWidth] = useState(0);
    const [graphHeight, setGraphHeight] = useState(0);
    const [nodeCount, setNodeCount] = useState(2);
    const [errorPercentage, setErrorPercentage] = useState(0.0);
    const graphContainer = React.createRef<HTMLDivElement>();

    //useEffect(() => {
    //    
    //    function handleResize() {
    //        console.log(graphContainer.current?.offsetWidth)
    //        setGraphWidth(graphContainer.current ? graphContainer.current.offsetWidth : 0);
    //        setGraphHeight(graphContainer.current ? graphContainer.current.offsetHeight : 0);
    //    }

    //    window.addEventListener('resize', handleResize);

    //    return () => window.removeEventListener('resize', handleResize)

    //}, [graphContainer])

    function onChangeNodeCount(e: React.ChangeEvent<HTMLInputElement>) {
        const re = /^[0-9\b]+$/;
        if(re.test(e.target.value)) {
            let nodeCount = parseInt(e.target.value);
            if(nodeCount > 30) {
                console.log("Number is too high")
            } else {
                setNodeCount(nodeCount);
            }
        }
        else if(e.target.value === "") {
            setNodeCount(0);
        }
    }

    console.log("Rerendering")

    return (
        <Container maxWidth="container.xl" padding={0}>
            <Flex h={{ base: 'auto', md: '100vh'}} py={[0, 10, 20]} direction={{ base: 'column-reverse', md: 'row'}}>
                <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start" bg="gray.50">
                    <VStack spacing={3} alignItems="flex-start">
                        <Heading size="2xl">Header</Heading>
                        <Text>Here is some text</Text>
                    </VStack>
                    <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
                        <GridItem colSpan={colSpan}>
                            <FormControl>
                                <FormLabel>Number of Nodes</FormLabel>
                                <NumberInput defaultValue={3} min={3} max={30}>
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
                                <NumberInput defaultValue={0} min={0} max={1} step={0.01}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </GridItem>
                        <GridItem colSpan={2}>
                            <Button size="lg" w="full">Generate Graph</Button>
                        </GridItem>
                    </SimpleGrid>
                    <h4>Number of nodes</h4><input type="text" value={nodeCount} onChange={onChangeNodeCount}></input>
                    <h4>Error Percentage</h4><input type="text" value={errorPercentage} onChange={(e) => setErrorPercentage(parseInt(e.target.value))}></input>
                </VStack>
                <VStack w="full" h="full" p={0} spacing={0} alignItems="flex-start" ref={graphContainer}>
                    <NetworkGraph nodeCount={nodeCount} errorPercentage={errorPercentage} />
                </VStack>
            </Flex>
        </Container>
    );
}