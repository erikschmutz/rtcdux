const hash = (key: string) => {
  return key
    .split("")
    .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
};

export default hash;
