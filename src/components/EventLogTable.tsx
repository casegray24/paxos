import {Table, TableCaption, Thead, Tr, Th, Td, Tbody} from "@chakra-ui/react";
import { EventLog } from "../models/EventLog";

interface EventLogTableProps {
    eventLog: EventLog[];
}

export default function EventLogTable(props: EventLogTableProps) {

    const tableRows = props.eventLog.map((log, index) => 
        <Tr key={index}>
            <Td>{log.id}</Td>
            <Td>{log.level}</Td>
            <Td>{log.message}</Td>
        </Tr>
    )

    return (
        <Table>
            <TableCaption>event logs from nodes within network</TableCaption>
            <Thead>
                <Tr>
                    <Th>ID</Th>
                    <Th>Log Level</Th>
                    <Th>Message</Th>
                </Tr>
            </Thead>
            <Tbody>
                {tableRows}
            </Tbody>
        </Table>
    )
}