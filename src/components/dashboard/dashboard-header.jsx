import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardHeader({ heading, text, children, count }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-start justify-between px-2">
      {" "}
      <div className="flex items-start justify-start gap-4 px-2">
        <div onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
        </div>
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold tracking-wide">
            {heading}{" "}
            {count && <span className="text-muted-foreground">({count})</span>}
          </h1>
          {text && <p className="text-muted-foreground">{text}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
