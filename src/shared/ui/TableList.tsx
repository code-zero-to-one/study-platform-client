import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from "@/shared/shadcn/ui/table";

  interface Props<T extends string> {
    headers: T[];
    data: Record<Lowercase<T>, any>[];
  }
  
  export default function TableList<T extends string>({ headers, data }: Props<T>) {  
    return (
      <Table>
        <TableHeader>
        <TableRow className="bg-[var(--color-background-alternative)] !p-[20px] border-none">
            {headers.map((header) => (
                <TableHead className="p-[20px] text-[13px] leading-[20px] text-[var(--color-text-subtle)]">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
        {data.map((row, index) => (
          <TableRow key={index} className="border-none">
            {headers.map((header) => (
              <TableCell className="p-[20px]" key={header}>
                {row[header.toLowerCase() as Lowercase<T>]}
              </TableCell>
            ))}
          </TableRow>
        ))}
        </TableBody>
      </Table>
    );
  }