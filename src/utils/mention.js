export const extractMentions = (content) => {
  const regex = /@(\w+)/g;
  const matches = content.match(regex) || [];
  return matches.map((m) => m.replace('@', ''));
};
