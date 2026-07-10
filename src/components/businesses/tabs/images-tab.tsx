"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BusinessFormState } from "@/components/businesses/business-form-types";
import { BusinessImage } from "@/lib/types";
import { uploadBusinessImage } from "@/lib/actions/businesses";

function SortableImage({
  image,
  isUploading,
  onSetCover,
  onRemove,
}: {
  image: BusinessImage;
  isUploading: boolean;
  onSetCover: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card",
        isDragging && "opacity-60"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt="Business"
        className="aspect-[4/3] w-full object-cover"
      />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="size-6 animate-spin text-white" />
        </div>
      )}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex size-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
        {image.isCover ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
            Cover
          </span>
        ) : (
          <button
            type="button"
            onClick={onSetCover}
            className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          >
            <Star className="size-3" />
            Set cover
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-md bg-black/50 text-white opacity-0 backdrop-blur transition-opacity hover:bg-danger group-hover:opacity-100"
        aria-label="Remove image"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function ImagesTab({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
}) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // Async upload completions read from this ref (not the `value` prop) so a
  // slow upload never clobbers state with a stale snapshot from when it started.
  const imagesRef = useRef(value.images);
  useEffect(() => {
    imagesRef.current = value.images;
  }, [value.images]);

  async function addFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const fileList = Array.from(files);
    const newImages: BusinessImage[] = fileList.map((file, i) => ({
      id: `img-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      displayOrder: value.images.length + i,
      isCover: value.images.length === 0 && i === 0,
    }));
    onChange({ images: [...value.images, ...newImages] });
    setUploadingIds((prev) => new Set([...prev, ...newImages.map((img) => img.id)]));
    toast.success(`${newImages.length} image${newImages.length > 1 ? "s" : ""} added.`);

    await Promise.all(
      newImages.map(async (placeholder, i) => {
        try {
          const formData = new FormData();
          formData.append("file", fileList[i]);
          const { url } = await uploadBusinessImage(formData);
          onChange({
            images: imagesRef.current.map((img) =>
              img.id === placeholder.id ? { ...img, url } : img
            ),
          });
        } catch (error) {
          onChange({ images: imagesRef.current.filter((img) => img.id !== placeholder.id) });
          const message = error instanceof Error ? error.message : "Upload failed.";
          toast.error(`${fileList[i].name}: ${message}`);
        } finally {
          setUploadingIds((prev) => {
            const next = new Set(prev);
            next.delete(placeholder.id);
            return next;
          });
        }
      })
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.images.findIndex((img) => img.id === active.id);
    const newIndex = value.images.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(value.images, oldIndex, newIndex).map((img, i) => ({
      ...img,
      displayOrder: i,
    }));
    onChange({ images: reordered });
  }

  function setCover(id: string) {
    onChange({
      images: value.images.map((img) => ({ ...img, isCover: img.id === id })),
    });
  }

  function removeImage(id: string) {
    const wasCover = value.images.find((img) => img.id === id)?.isCover;
    const remaining = value.images.filter((img) => img.id !== id);
    if (wasCover && remaining.length) remaining[0].isCover = true;
    onChange({ images: remaining });
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">Image Gallery</p>
        <p className="text-sm text-muted-foreground">
          Drag to reorder. The first image (or one marked Cover) is used as the cover photo.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFile(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors",
          isDraggingFile && "border-accent bg-accent/5"
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-card shadow-sm">
          <UploadCloud className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Drag & drop images here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {value.images.length ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.images.map((img) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {value.images.map((img) => (
                <SortableImage
                  key={img.id}
                  image={img}
                  isUploading={uploadingIds.has(img.id)}
                  onSetCover={() => setCover(img.id)}
                  onRemove={() => removeImage(img.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border py-10 text-center">
          <ImagePlus className="size-6 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
        </div>
      )}

      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
        <ImagePlus className="size-4" />
        Add More Images
      </Button>
    </div>
  );
}
