import { entryCopy } from "@/features/entry/constants";

type EntryActionProps = {
  ready: boolean;
  exiting: boolean;
  onEnter: () => void;
};

export function EntryAction({ ready, exiting, onEnter }: EntryActionProps) {
  return (
    <div className="entry-action">
      <button
        type="button"
        className="entry-button"
        disabled={!ready || exiting}
        onClick={onEnter}
      >
        {entryCopy.action}
      </button>
    </div>
  );
}
