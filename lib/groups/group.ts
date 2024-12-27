export type GroupType = {
  enabled: boolean;
  deleteable?: boolean;
  name: string;
  name_filter: string;
};

export type GroupsType = GroupType[];
