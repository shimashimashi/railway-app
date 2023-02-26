export interface Station {
  station_code: number;
  station_group_code: number;
  station_name: string;
  line_code: number;
  prefecture: string;
  post: string;
  address: string;
  lat: number;
  lon: number;
}

export interface Line {
  line_code: number;
  line_name: string;
}

export interface Visit {
  station_code: number;
}

export type Tour = Visit[];
