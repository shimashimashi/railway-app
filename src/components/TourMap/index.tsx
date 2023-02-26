import styles from './index.module.scss';
import {
  useLineRepository,
  useStationRepository,
  useTourRepository,
} from 'hooks';
import Leaflet, { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';

Leaflet.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/';

type Props = {
  zoom: number;
};

type SearchForm = {
  query: string;
};

function MoveMapCenter({ position }: { position: LatLngTuple }) {
  const map = useMap();
  map.panTo(position);
  return null;
}

export function TourMap({ zoom }: Props) {
  const [current, setCurrent] = useState(0);
  const [timer, setTimer] = useState(false);
  const [delay, setDelay] = useState(100.0);
  const [searchFound, setSearchFound] = useState(true);
  const { register, handleSubmit } = useForm<SearchForm>();

  useEffect(() => {
    if (timer) {
      const timerId = setInterval(moveNext, delay);
      return () => clearInterval(timerId);
    }
  }, [timer, delay]);

  const tourResult = useTourRepository();
  const stationResult = useStationRepository();
  const lineResult = useLineRepository();

  if (!stationResult.data || !lineResult.data || !tourResult.data) {
    return <div>error</div>;
  }
  const tourRepository = tourResult.data;
  const stationRepository = stationResult.data;
  const lineRepository = lineResult.data;

  const station = stationRepository.getStationByCode(
    tourRepository.getCurrentVisit(current).station_code,
  );
  if (!station) {
    return <div>error</div>;
  }

  const line = lineRepository.getLineByCode(station.line_code);
  if (!line) {
    return <div>error</div>;
  }

  const tourSize = tourRepository.getSize();
  const moveNext = () => {
    setCurrent((current) => {
      const next = (current + 1) % tourSize;
      if (next == tourSize - 1) {
        setTimer(false);
      }
      return next;
    });
  };

  const moveBack = () => {
    setCurrent((current) => {
      const prev = current > 0 ? current - 1 : tourSize - 1;
      return prev;
    });
  };

  const speedUp = () => {
    setDelay(delay / 2);
  };

  const speedDown = () => {
    setDelay(delay * 2);
  };

  const reset = () => {
    setCurrent(0);
    setTimer(false);
  };

  const onSubmit = (data: SearchForm) => {
    const station = stationRepository.findStationByName(data.query);
    if (!station) {
      setSearchFound(false);
      return;
    }
    const index = tourRepository.getIndexByStationCode(station.station_code);
    if (!index) {
      setSearchFound(false);
      return;
    }
    setSearchFound(true);
    setCurrent(index);
  };

  const center: LatLngTuple = [station.lat, station.lon];
  const polyline: LatLngTuple[] =
    tourRepository.getCoordinates(stationRepository);

  const visitedStations = tourRepository.getVisitedStationsCount(current);
  const visitedStationsPercentage =
    tourRepository.getVisitedStationsPercentage(current);

  return (
    <div className={styles.map}>
      <MapContainer
        style={{
          height: '100%',
          minHeight: '100%',
        }}
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={[station.lat, station.lon]}>
          <Popup>{station.station_name}</Popup>
        </Marker>
        <Polyline
          pathOptions={{ color: 'blue', weight: 3, opacity: 0.5 }}
          positions={polyline}
        />
        <MoveMapCenter position={center} />
      </MapContainer>
      <div className={styles.information}>
        <div className={styles.description}>
          <div className={styles.station}>{station.station_name}駅</div>
          <ul className={styles.statusList}>
            <li className={styles.status}>{line.line_name}</li>
          </ul>
          <ul className={styles.statusList}>
            <li className={styles.status}>
              {station.prefecture}
              {station.address}
            </li>
          </ul>
          <ul className={styles.statusList}>
            <li className={styles.status}>移動回数：{current}</li>
          </ul>
          <ul className={styles.statusList}>
            <li className={styles.status}>
              訪問済みの駅：
              {`${visitedStations}（${visitedStationsPercentage.toFixed(2)}%）`}
            </li>
          </ul>
        </div>
        <div className={styles.control}>
          <button className={styles.button} onClick={() => moveNext()}>
            次の駅に進む
          </button>
          <button className={styles.button} onClick={() => moveBack()}>
            前の駅に戻る
          </button>
          <button className={styles.button} onClick={() => setTimer(true)}>
            自動で進む
          </button>
          <button className={styles.button} onClick={() => setTimer(false)}>
            止まる
          </button>
          <button className={styles.button} onClick={() => speedUp()}>
            加速する
          </button>
          <button className={styles.button} onClick={() => speedDown()}>
            減速する
          </button>
          <button className={styles.button} onClick={() => reset()}>
            最初に戻る
          </button>
        </div>
        <div className={styles.search}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              className={styles.input}
              {...register('query')}
              type='search'
              placeholder='駅名を検索する'
            />
          </form>
          {searchFound ? (
            ''
          ) : (
            <div className={styles.notFound}>見つかりませんでした</div>
          )}
        </div>
      </div>
    </div>
  );
}
