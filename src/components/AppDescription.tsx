import { Text, Heading, Collapse, VStack, Button } from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";

interface AppDescriptionProps {
    showDescription: boolean
    onCollapse: onCollapseCallback
}

type onCollapseCallback = () => any;

export default function AppDescription(props: AppDescriptionProps) {

    const collapseIcon = props.showDescription ? <ChevronUpIcon/> : <ChevronDownIcon/>

    return (    
        <VStack spacing={3} alignItems="flex-start">
            <Heading size="2xl" align="left">Paxos Visualization</Heading>
            <Collapse in={props.showDescription}>
                <Text align="left">
                A way to visualize the how the rules that govern the Paxos protocol can acheive consensus in a distributed network.
                The network of nodes is visualized on the right. Refer to Paxos Made Simple (or the Part-Time Parliament) by Leslie Lamport for a listing of the rules that the Paxos protocol follows.
                There are 3 main node roles in Paxos: Acceptor, Proposer, and Learner. Here we focus on the Acceptor and Proposer role and have the Proposer serve as an Acceptor as well. The Proposer appears in green in the network and can be changed by selecting any node.
                </Text>
            </Collapse>
            <Button align="left" onClick={props.onCollapse}>{collapseIcon}</Button>
        </VStack>        
    )
}

