export interface Payload {
  [key: string]: {
    value: string;
    modified_value: string | null;
    status: string,
    isAdded?: boolean;
  };
}
