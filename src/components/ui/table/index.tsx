import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/(shadcn)/ui/table';

interface Props<T extends string> {
  headers: readonly T[];
  placeholder?: string;
  data: Record<T, React.ReactNode>[];
}

export default function TableList<T extends string>({
  headers,
  placeholder = '아직 진행된 매칭이 없어요!',
  data,
}: Props<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background-alternative rounded-50 border border-transparent">
          {headers.map((header) => (
            <TableHead
              key={header}
              className="font-designer-13r text-text-subtle px-100 py-200 text-center align-middle leading-[20px]"
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow className="h-[240px]">
            <TableCell
              colSpan={headers.length}
              className="text-text-subtle p-300 text-center"
            >
              {placeholder}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
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
          ))
        )}
      </TableBody>
    </Table>
  );
}
