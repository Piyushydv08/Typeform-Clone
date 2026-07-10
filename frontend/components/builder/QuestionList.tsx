"use client";

import { Form, Question } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { GripVertical, Plus, Trash2, HelpCircle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  form: Form;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (form: Form) => void;
}

export function QuestionList({ form, selectedId, onSelect, onUpdate }: Props) {
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = form.questions.findIndex((q) => q.id === active.id);
      const newIndex = form.questions.findIndex((q) => q.id === over.id);
      const newQuestions = arrayMove(form.questions, oldIndex, newIndex);
      onUpdate({ ...form, questions: newQuestions });
      try {
        await api.questions.reorder(form.id, newQuestions.map((q) => q.id));
      } catch (e: any) {
        console.error("[QuestionList] Reorder failed:", e);
        toast("Reorder failed", e.message, "error");
      }
    }
  };

  const handleAdd = async () => {
    try {
      const newQ = await api.questions.add(form.id, {
        type: "short_text",
        title: "New Question",
        order_index: form.questions.length,
      });
      onUpdate({ ...form, questions: [...form.questions, newQ] });
      onSelect(newQ.id);
    } catch (e: any) {
      console.error("[QuestionList] Add failed:", e);
      toast("Error adding question", e.message, "error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.questions.delete(id);
      const filtered = form.questions.filter((q) => q.id !== id);
      onUpdate({ ...form, questions: filtered });
      if (selectedId === id && filtered.length > 0) {
        onSelect(filtered[0].id);
      }
    } catch (err: any) {
      console.error("[QuestionList] Delete failed:", err);
      toast("Error deleting question", err.message, "error");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div
        className="p-4 border-b flex justify-between items-center shrink-0"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
      >
        <h3
          className="font-bold text-xs uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Questions
        </h3>
        <button
          onClick={handleAdd}
          className="p-1.5 border rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--accent)",
          }}
          title="Add Question"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={form.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {form.questions.map((q, idx) => (
              <SortableItem
                key={q.id}
                question={q}
                index={idx}
                isSelected={selectedId === q.id}
                onSelect={() => onSelect(q.id)}
                onDelete={(e: any) => handleDelete(q.id, e)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {form.questions.length === 0 && (
          <div className="text-center p-8 flex flex-col items-center gap-3">
            <HelpCircle size={32} style={{ color: "var(--text-faint)" }} />
            <p className="text-sm" style={{ color: "var(--text-faint)" }}>No questions yet.</p>
            <button
              onClick={handleAdd}
              className="text-sm font-semibold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Add your first question
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t shrink-0" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold border rounded-xl transition-colors"
          style={{
            color: "var(--accent)",
            backgroundColor: "rgba(255,61,87,0.05)",
            borderColor: "rgba(255,61,87,0.2)",
          }}
        >
          <Plus size={16} /> Add Question
        </button>
      </div>
    </div>
  );
}

function SortableItem({ question, index, isSelected, onSelect, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: isSelected ? "rgba(255,61,87,0.08)" : "var(--card)",
        border: `1.5px solid ${isSelected ? "rgba(255,61,87,0.3)" : "var(--border)"}`,
        color: isSelected ? "var(--accent)" : "var(--text)",
        transform: isDragging ? `${CSS.Transform.toString(transform)} scale(1.02)` : CSS.Transform.toString(transform),
        opacity: isDragging ? 0.9 : 1,
        boxShadow: isDragging ? "0 8px 25px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.05)",
      }}
      className="group flex items-center p-3 rounded-xl text-sm cursor-pointer"
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="mr-2 cursor-grab p-1 -ml-1 rounded"
        style={{ color: "var(--text-faint)", opacity: isSelected ? 0.8 : undefined }}
      >
        <GripVertical size={15} />
      </div>

      {/* Number badge */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs mr-2.5 shrink-0 font-bold"
        style={
          isSelected
            ? { backgroundColor: "var(--accent)", color: "#fff" }
            : { backgroundColor: "var(--bg)", color: "var(--text-muted)" }
        }
      >
        {index + 1}
      </div>

      {/* Title */}
      <div className="flex-1 truncate select-none font-medium text-sm">
        {question.title || <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>Empty question</span>}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-60 hover:!opacity-100"
        style={{ color: "#ef4444" }}
        title="Delete Question"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
