import React, { useState } from "react";
import { NetworkGraph } from "./NetworkGraph";
import { Container, Flex, VStack } from "@chakra-ui/react";

export default function NetworkControls() {
    
    const [nodeCount, setNodeCount] = useState(2);
    const [errorPercentage, setErrorPercentage] = useState(0.0);

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

    return (
        <Container maxWidth="container.xl" padding={0}>
            <Flex h="100vh" py={20}>
                <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start" bg="gray.50">
                    <h4>Number of nodes</h4><input type="text" value={nodeCount} onChange={onChangeNodeCount}></input>
                    <h4>Error Percentage</h4><input type="text" value={errorPercentage} onChange={(e) => setErrorPercentage(parseInt(e.target.value))}></input>
                </VStack>
                <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start">
                    <NetworkGraph nodeCount={nodeCount} errorPercentage={errorPercentage} />
                </VStack>
            </Flex>
        </Container>
    );
}