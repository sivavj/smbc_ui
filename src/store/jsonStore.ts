import { create } from "zustand";
import { Payload } from "../types";

interface Counts {
  accepted: number;
  rejected: number;
  edited: number;
  added: number;
}

interface JsonStore {
  jsonData: Payload;
  markdownContent: string;
  selectedContent: string;
  counts: Counts;
  onSelectContent: (content: string) => void;
  onSetJsonData: (jsonData: Payload) => void;
  onSetMarkdownContent: (markdownContent: string) => void;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  accept: (key: string) => void;
  acceptAll: () => void;
  reject: (key: string) => void;
  add: (key: string, value: string) => void;
  edit: (key: string, newValue: string) => void;
}

const useJsonStore = create<JsonStore>((set) => ({
  jsonData: {},
  selectedKey: null,
  selectedContent: "",
  markdownContent: "",
  counts: {
    accepted: 0,
    rejected: 0,
    edited: 0,
    added: 0,
  },
  onSetJsonData: (jsonData: Payload) => set({ jsonData }),
  onSetMarkdownContent: (markdownContent: string) => set({ markdownContent }),
  onSelectContent: (content) => set({ selectedContent: content }),
  acceptAll: () =>
    set((state) => {
      const updatedJsonData = Object.fromEntries(
        Object.entries(state.jsonData).map(([key, value]) => [
          key,
          {
            ...value,
            status: value.status === "pending" ? "accepted" : value.status,
          },
        ])
      );

      const newlyAcceptedCount = Object.values(state.jsonData).filter(
        (entry) => entry.status === "pending"
      ).length;

      return {
        jsonData: updatedJsonData,
        counts: {
          ...state.counts,
          accepted: state.counts.accepted + newlyAcceptedCount,
        },
      };
    }),
  accept: (key) =>
    set((state) => ({
      jsonData: {
        ...state.jsonData,
        [key]: { ...state.jsonData[key], status: "accepted" },
      },
      counts: {
        ...state.counts,
        accepted: state.counts.accepted + 1,
      },
    })),
  reject: (key) =>
    set((state) => ({
      jsonData: {
        ...state.jsonData,
        [key]: { ...state.jsonData[key], status: "rejected" },
      },
      counts: {
        ...state.counts,
        rejected: state.counts.rejected + 1,
      },
    })),
  add: (key, value) =>
    set((state) => ({
      jsonData: {
        ...state.jsonData,
        [key]: { value, modified_value: null, status: "pending" },
      },
      counts: {
        ...state.counts,
        added: state.counts.added + 1,
      },
    })),
  edit: (key, newValue) =>
    set((state) => ({
      jsonData: {
        ...state.jsonData,
        [key]: {
          ...state.jsonData[key],
          modified_value: newValue,
          status: "edited",
        },
      },
      counts: {
        ...state.counts,
        edited: state.counts.edited + 1,
      },
    })),
  onSelectKey: (key: string | null) => set({ selectedKey: key }),
}));

export default useJsonStore;
