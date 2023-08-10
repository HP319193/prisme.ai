import { ReactNode } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

interface SortableListProps {
  children: ReactNode;
  id?: string;
  onSort?: (from: number, to: number) => void;
}
export const SortableList = ({
  children,
  id = 'droppable',
  onSort,
}: SortableListProps) => {
  return (
    <DragDropContext
      onDragEnd={({ source: { index: from }, destination }) =>
        onSort?.(from, destination?.index || 0)
      }
    >
      <Droppable droppableId={id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
interface SortableListItemProps {
  children: ReactNode;
  id: string;
  item: any;
}

export const SortableListItem = ({ children, id }: SortableListItemProps) => {
  return (
    <Draggable key={id} draggableId={id} index={+id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {children}
        </div>
      )}
    </Draggable>
  );
};
