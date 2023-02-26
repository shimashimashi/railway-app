import { Line, Station, Tour, Visit } from 'entity';

export class StationRepository {
  private readonly code_index: Map<number, Station> = new Map<
    number,
    Station
  >();
  private readonly name_index: Map<string, Station> = new Map<
    string,
    Station
  >();
  private readonly coordinates: [number, number][] = [];

  constructor(stations: Station[]) {
    stations.forEach((station) => {
      this.code_index.set(station.station_code, station);
      this.name_index.set(station.station_name, station);
      this.coordinates.push([station.lat, station.lon]);
    });
  }

  getStationByCode(code: number): Station | null {
    const station = this.code_index.get(code);
    if (!station) {
      return null;
    }
    return station;
  }

  findStationByName(name: string): Station | null {
    const station = this.name_index.get(name);
    if (!station) {
      return null;
    }
    return station;
  }
}

export class LineRepository {
  private code_index: Map<number, Line> = new Map<number, Line>();

  constructor(lines: Line[]) {
    lines.forEach((line) => {
      this.code_index.set(line.line_code, line);
    });
  }

  getLineByCode(code: number): Line | null {
    const line = this.code_index.get(code);
    if (!line) {
      return null;
    }
    return line;
  }
}

export class TourRepository {
  private visited: Set<number> = new Set<number>();
  private visit_counter: Map<number, number> = new Map<number, number>();
  private coordinates: [number, number][] | undefined;
  private station_code_index: Map<number, number> = new Map<number, number>();

  constructor(private readonly tour: Tour) {
    tour.forEach((visit, i) => {
      this.visited.add(visit.station_code);
      this.visit_counter.set(i, this.visited.size);
      this.station_code_index.set(visit.station_code, i);
    });
  }

  getCurrentVisit(current: number): Visit {
    return this.tour[current];
  }

  getSize(): number {
    return this.tour.length;
  }

  getVisitedStationsCount(current: number): number {
    const count = this.visit_counter.get(current);
    if (count) {
      return count;
    }
    return 0;
  }

  getVisitedStationsPercentage(current: number): number {
    const count = this.visit_counter.get(current);
    if (count) {
      return (count / this.visited.size) * 100;
    }
    return 0.0;
  }

  getCoordinates(stationRepository: StationRepository): [number, number][] {
    if (this.coordinates) {
      return this.coordinates;
    }

    const coordinates: [number, number][] = [];
    this.tour.forEach((visit) => {
      const station = stationRepository.getStationByCode(visit.station_code);
      if (station) {
        coordinates.push([station.lat, station.lon]);
      }
    });

    this.coordinates = coordinates;
    return this.coordinates;
  }

  getIndexByStationCode(code: number): number | null {
    const index = this.station_code_index.get(code);
    if (index) {
      return index;
    }
    return null;
  }
}
