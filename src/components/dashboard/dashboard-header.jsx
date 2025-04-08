import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardHeader({ heading, text, children }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-start justify-between px-2 mb-6">
      <div className="grid gap-1">
        <div onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
        </div>
        <h1 className="text-2xl font-bold tracking-wide">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}
