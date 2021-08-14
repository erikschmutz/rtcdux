const uniqueList = <T>(arr: T[]) => {
  return arr.filter((v, i, a) => a.indexOf(v) === i);
};

export default uniqueList;
