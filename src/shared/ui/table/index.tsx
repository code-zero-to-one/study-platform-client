import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/shadcn/ui/table";

interface Props<T extends string> {
  headers: readonly T[];
  data: Record<T, React.ReactNode>[];
}

export default function TableList<T extends string>({ headers, data }: Props<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background-alternative rounded-50 border border-transparent">
          {headers.map((header) => (
            <TableHead
              key={header}
              className="px-100 py-200 text-center align-middle leading-[20px] font-designer-13r text-text-subtle"
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index} className="border-none">
            {headers.map((header) => (
              <TableCell
                key={header}
                className="p-300 text-center align-middle whitespace-normal"
              >
                {row[header]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}