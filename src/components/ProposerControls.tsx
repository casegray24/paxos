import { 
    SimpleGrid, 
    GridItem, 
    FormControl, 
    FormLabel, 
    NumberInput,
    NumberInputField, 
    NumberInputStepper, 
    NumberIncrementStepper, 
    NumberDecrementStepper, 
    Input, 
    Button
} from "@chakra-ui/react"
import { ChangeEvent } from "react";

interface ProposerControlsProps {
    proposalNumber: number;
    minProposalValue: number;
    onProposalNumberChange: onProposerNumberCallback;
    proposalValue: string;
    onProposalValueChange: onProposerValueCallback;
    onPropose: onProposeCallback;
    colSpan?: number;
}

type onProposerNumberCallback = (value: string) => any;
type onProposerValueCallback = (event: ChangeEvent<HTMLInputElement>) => any;
type onProposeCallback = (number: number, value: string) => any;

export default function ProposerControls(props: ProposerControlsProps) {

    return (
        <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
            <GridItem colSpan={props.colSpan}>
                <FormControl>
                    <FormLabel>Proposal Number</FormLabel>
                    <NumberInput value={props.proposalNumber} min={props.minProposalValue} onChange={props.onProposalNumberChange}>
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>
            </GridItem>
            <GridItem colSpan={props.colSpan}>
                <FormControl>
                    <FormLabel>Proposal Value</FormLabel>
                    <Input placeholder="Fill in any value (e.g. 'foo')" value={props.proposalValue} onChange={props.onProposalValueChange} />
                </FormControl>
            </GridItem>
            <GridItem colSpan={2}>
                <Button size="lg" w="full" onClick={() => props.onPropose(props.proposalNumber, props.proposalValue)}>Propose Value</Button>
            </GridItem>
        </SimpleGrid>
    )

}