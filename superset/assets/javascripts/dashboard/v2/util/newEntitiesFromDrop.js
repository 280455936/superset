import isValidChild from './isValidChild';

import {
  CHART_TYPE,
  COLUMN_TYPE,
  DIVIDER_TYPE,
  HEADER_TYPE,
  INVISIBLE_ROW_TYPE,
  MARKDOWN_TYPE,
  ROW_TYPE,
  SPACER_TYPE,
  TABS_TYPE,
  TAB_TYPE,
} from './componentTypes';

const typeToDefaultMetaData = {
  [CHART_TYPE]: { width: 3, height: 15 },
  [COLUMN_TYPE]: { width: 3 },
  [DIVIDER_TYPE]: null,
  [HEADER_TYPE]: { text: 'New header' },
  [INVISIBLE_ROW_TYPE]: null,
  [MARKDOWN_TYPE]: { width: 3, height: 15 },
  [ROW_TYPE]: null,
  [SPACER_TYPE]: { width: 1 },
  [TABS_TYPE]: null,
  [TAB_TYPE]: { text: 'New Tab' },
};

// @TODO this should be replaced by a more robust algorithm
function uuid(type) {
  return `${type}-${Math.random().toString(16)}`;
}

function entityFactory(type) {
  return {
    dashboardVersion: 'v0',
    type,
    id: uuid(type),
    children: [],
    meta: {
      ...typeToDefaultMetaData[type],
    },
  };
}

export default function newEntitiesFromDrop({ dropResult, components }) {
  const { draggableId, destination } = dropResult;

  const dragType = draggableId; // @TODO idToType
  const dropEntity = components[destination.droppableId];

  if (!dropEntity) {
    console.warn('Drop target entity', destination.droppableId, 'not found');
    return null;
  }

  const dropType = dropEntity.type;
  let newDropChild = entityFactory(dragType);
  const isValidDrop = isValidChild({ parentType: dropType, childType: dragType });

  const newEntities = {
    [newDropChild.id]: newDropChild,
  };

  if (!isValidDrop) {
    console.log('wrapping', dragType, 'in invisible row');
    if (!isValidChild({ parentType: dropType, childType: INVISIBLE_ROW_TYPE })) {
      console.warn('wrapping in an invalid component');
    }

    const rowWrapper = entityFactory(INVISIBLE_ROW_TYPE);
    rowWrapper.children = [newDropChild.id];
    newEntities[rowWrapper.id] = rowWrapper;
    newDropChild = rowWrapper;

  } else if (dragType === TABS_TYPE) {
    const tabChild = entityFactory(TAB_TYPE);
    newDropChild.children = [tabChild.id];
    newEntities[tabChild.id] = tabChild;
  }

  const nextDropChildren = [...dropEntity.children];
  nextDropChildren.splice(destination.index, 0, newDropChild.id);

  newEntities[destination.droppableId] = {
    ...dropEntity,
    children: nextDropChildren,
  };

  return newEntities;
}
