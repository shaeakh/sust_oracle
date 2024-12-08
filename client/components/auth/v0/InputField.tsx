import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  error,
  icon,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`${error ? "border-red-500" : ""} ${icon ? "pl-10" : ""}`}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
