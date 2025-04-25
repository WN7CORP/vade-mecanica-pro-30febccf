
import { LAW_OPTIONS } from "@/services/lawService";

export const getLawAbbreviation = (lawName: string): string => {
  const law = LAW_OPTIONS.find(opt => opt.display === lawName);
  return law?.abbreviation || lawName;
};
