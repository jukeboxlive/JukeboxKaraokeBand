"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

/**
 * Tek bir sıra öğesi — grip handle'a basılı tutarak sürükle-bırak.
 * Sadece handle'da dinleyici var; kart alanının geri kalanı scroll için özgür.
 */
export default function SortableQueueItem({ applicant, index, onCancel }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: applicant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`queue-item group ${isDragging ? "queue-item--dragging" : ""}`}
    >
      {/* Sürükle tutamacı — sadece buradan sürüklenir */}
      <button
        type="button"
        className="drag-handle"
        aria-label="Sürükleyerek taşı"
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>

      <span className="font-display text-brass-light w-7 text-lg shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-cream text-sm font-semibold truncate">
          {applicant.name}{" "}
          <span className="text-cream-300/70">{applicant.surname}</span>
        </p>
        <p className="text-xs text-cream-300 truncate italic">
          {applicant.songTitle} — {applicant.songArtist}
        </p>
        {applicant.instagram && (
          <p className="text-xs neon-text-magenta">@{applicant.instagram}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onCancel(applicant.id)}
        className="queue-item__cancel"
      >
        İptal
      </button>
    </div>
  );
}
