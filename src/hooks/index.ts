import { useQuery } from '@tanstack/react-query';
import { Line, Station, Tour } from 'entity';
import { LineRepository, StationRepository, TourRepository } from 'repository';

const fetchTour = async (): Promise<Tour> => {
  const resource = await import('data/tour.json');
  return resource.tour;
};

const fetchStations = async (): Promise<Station[]> => {
  const resource = await import('data/station.json');
  return resource.stations;
};

const fetchLines = async (): Promise<Line[]> => {
  const resource = await import('data/line.json');
  return resource.lines;
};

const fetchTourRepository = async (): Promise<TourRepository> => {
  const tour = await fetchTour();
  const repository = new TourRepository(tour);
  return repository;
};

const fetchStationRepository = async (): Promise<StationRepository> => {
  const stations = await fetchStations();
  const repository = new StationRepository(stations);
  return repository;
};

const fetchLineRepository = async (): Promise<LineRepository> => {
  const lines = await fetchLines();
  const repository = new LineRepository(lines);
  return repository;
};

export const useTourRepository = () => {
  return useQuery(['tour-repository'], fetchTourRepository);
};

export const useStationRepository = () => {
  return useQuery(['station-repository'], fetchStationRepository);
};

export const useLineRepository = () => {
  return useQuery(['line-repository'], fetchLineRepository);
};
