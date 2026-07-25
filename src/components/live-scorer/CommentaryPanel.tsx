import { useState } from 'react';
import { Button } from '@/components/ui/button';

const MAX_COMMENTARY_LENGTH = 2048;

type CommentaryPanelProps = {
  broadcastCommentary: (message: string) => void;
  disabled: boolean;
};

export function CommentaryPanel({ broadcastCommentary, disabled }: CommentaryPanelProps) {
  const [comment, setComment] = useState('');

  const submit = () => {
    if (!comment.trim() || disabled) return;
    broadcastCommentary(comment);
    setComment('');
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-300 p-3">
      <textarea
        className="h-32 w-full resize-none rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#12233D]"
        placeholder="Add commentary"
        value={comment}
        maxLength={MAX_COMMENTARY_LENGTH}
        disabled={disabled}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {comment.length}/{MAX_COMMENTARY_LENGTH}
        </span>
        <Button type="button" disabled={disabled || !comment.trim()} onClick={submit}>
          Add Commentary
        </Button>
      </div>
    </div>
  );
}
