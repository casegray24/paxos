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
    Tooltip,
    Button
} from "@chakra-ui/react"

interface NetworkControlsProps {
    nodeCount: number;
    errorPercentage: number;
    onNodeCountChange: onNodeCountCallback;
    onErrorPercentageChange: onNodeCountCallback;
    onGenerateGraph: onGenerateGraphCallback;
    colSpan?: number;
}

type onNodeCountCallback = (value: string) => any;
type onGenerateGraphCallback = (nodeCount: number, errorPercentage: number) => any;

export default function NetworkControls(props: NetworkControlsProps) {
    return (
        <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
            <GridItem colSpan={props.colSpan}>
                <FormControl>
                    <FormLabel>Number of Nodes</FormLabel>
                    <NumberInput value={props.nodeCount} min={3} max={25} onChange={(value) => props.onNodeCountChange(value)}>
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
                    <FormLabel>Error Percentage</FormLabel>
                    <Tooltip label="Chance for a request to a node to fail">
                        <NumberInput value={props.errorPercentage} min={0} max={1} step={0.01} onChange={(value) => props.onErrorPercentageChange(value)}>
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </Tooltip>
                </FormControl>
            </GridItem>
            <GridItem colSpan={2}>
                <Button size="lg" w="full" onClick={() => props.onGenerateGraph(props.nodeCount, props.errorPercentage)}>Generate Graph</Button>
            </GridItem>
        </SimpleGrid>
    )
}