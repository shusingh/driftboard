import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  onCommit: (value: string) => void;
}

/**
 * Text field that keeps a local draft while editing and commits on blur (or
 * Enter for single-line). Keeps typing out of the undo history until commit.
 */
export function EditableText({
  value,
  placeholder,
  multiline,
  className,
  onCommit,
}: EditableTextProps) {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) setDraft(value);
  }, [value]);

  const commit = () => {
    dirty.current = false;
    if (draft !== value) onCommit(draft);
  };

  const shared = {
    value: draft,
    placeholder,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dirty.current = true;
      setDraft(event.target.value);
    },
    onBlur: commit,
    className: cn(
      "w-full resize-none bg-transparent text-ink outline-none placeholder:text-faint",
      className
    ),
  };

  if (multiline) {
    return <textarea {...shared} rows={3} />;
  }

  return (
    <input
      {...shared}
      onKeyDown={event => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
    />
  );
}
