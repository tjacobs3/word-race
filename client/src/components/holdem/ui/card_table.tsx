import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export default function CardTable({ children }: Props) {
  return (
    <div className="card-table">
      <div className="card-table-center">
        {children}
      </div>
    </div>
  );
}
