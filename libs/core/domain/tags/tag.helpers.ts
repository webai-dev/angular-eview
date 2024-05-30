import { Tag, Tags } from './tag';

export interface TagWithChildren extends Tag {
  children: TagWithChildren[];
}

const ProcessForRendering = (tags: Tags): TagWithChildren[] => {
  if (!tags) return null;
  const getChildren = (tag: Tag, tags: Tags): TagWithChildren[] => {
    return tags.results
      .filter(t => t.parent)
      .filter(t => t.parent.id === tag.id)
      .sort((t0, t1) =>
        t0.priority === t1.priority ? 0 : t1.priority < t0.priority ? 1 : -1
      )
      .map(t => ({
        ...t,
        children: getChildren(t, tags)
      }));
  };
  const topParents = tags.results.filter(t => !t.parent || !t.parent.id);
  return topParents.reduce(
    (twc, tp) => (twc = [...twc, { ...tp, children: getChildren(tp, tags) }]),
    []
  );
};

const FlatifyChildren = (
  tags: TagWithChildren[]
): { id: number; children: number[] }[] => {
  const flatify = (tag: TagWithChildren): number[] => {
    return tag.children
      .map(t => {
        return [t.id, ...flatify(t)];
      })
      .reduce((flt, t) => (flt = [...flt, ...t]), []);
  };
  return tags.map(t => ({
    id: t.id,
    children: flatify(t)
  }));
};

export const TagHelpers = { ProcessForRendering, FlatifyChildren };
