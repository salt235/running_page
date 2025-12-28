import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  sortDateFunc,
  sortDateFuncReverse,
  convertMovingTime2Sec,
  Activity,
  RunIds,
} from '@/utils/utils';
import { IS_CHINESE, SHOW_ELEVATION_GAIN } from '@/utils/const';

import RunRow from './RunRow';
import styles from './style.module.css';

interface IRunTableProperties {
  runs: Activity[];
  locateActivity: (_runIds: RunIds) => void;
  setActivity: (_runs: Activity[]) => void;
  runIndex: number;
  setRunIndex: (_index: number) => void;
}

type SortFunc = (_a: Activity, _b: Activity) => number;

const RunTable = ({
  runs,
  locateActivity,
  setActivity,
  runIndex,
  setRunIndex,
}: IRunTableProperties) => {
  const [sortFuncInfo, setSortFuncInfo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 20;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(runs.length / PAGE_SIZE)),
    [runs.length]
  );

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  // Memoize sort functions to prevent recreating them on every render
  const sortFunctions = useMemo(() => {
    const sortKMFunc: SortFunc = (a, b) =>
      sortFuncInfo === 'KM' ? a.distance - b.distance : b.distance - a.distance;
    const sortElevationGainFunc: SortFunc = (a, b) =>
      sortFuncInfo === 'Elev'
        ? (a.elevation_gain ?? 0) - (b.elevation_gain ?? 0)
        : (b.elevation_gain ?? 0) - (a.elevation_gain ?? 0);
    const sortPaceFunc: SortFunc = (a, b) =>
      sortFuncInfo === 'Pace'
        ? a.average_speed - b.average_speed
        : b.average_speed - a.average_speed;
    const sortBPMFunc: SortFunc = (a, b) => {
      return sortFuncInfo === 'BPM'
        ? (a.average_heartrate ?? 0) - (b.average_heartrate ?? 0)
        : (b.average_heartrate ?? 0) - (a.average_heartrate ?? 0);
    };
    const sortRunTimeFunc: SortFunc = (a, b) => {
      const aTotalSeconds = convertMovingTime2Sec(a.moving_time);
      const bTotalSeconds = convertMovingTime2Sec(b.moving_time);
      return sortFuncInfo === 'Time'
        ? aTotalSeconds - bTotalSeconds
        : bTotalSeconds - aTotalSeconds;
    };
    const sortDateFuncClick =
      sortFuncInfo === 'Date' ? sortDateFunc : sortDateFuncReverse;

    const sortFuncMap = new Map([
      ['KM', sortKMFunc],
      ['Elev', sortElevationGainFunc],
      ['Pace', sortPaceFunc],
      ['BPM', sortBPMFunc],
      ['Time', sortRunTimeFunc],
      ['Date', sortDateFuncClick],
    ]);

    if (!SHOW_ELEVATION_GAIN) {
      sortFuncMap.delete('Elev');
    }

    return sortFuncMap;
  }, [sortFuncInfo]);

  const handleClick = useCallback<React.MouseEventHandler<HTMLElement>>(
    (e) => {
      const funcName = (e.target as HTMLElement).innerHTML;
      const f = sortFunctions.get(funcName);

      setRunIndex(-1);
      setSortFuncInfo(sortFuncInfo === funcName ? '' : funcName);
      setActivity(runs.slice().sort(f));
      setCurrentPage(1);
      locateActivity([]);
    },
    [
      sortFunctions,
      sortFuncInfo,
      runs,
      setRunIndex,
      setActivity,
      locateActivity,
    ]
  );

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRuns = useMemo(
    () => runs.slice(startIndex, startIndex + PAGE_SIZE),
    [runs, startIndex]
  );

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(totalPages, page));
      setCurrentPage(clamped);
      setRunIndex(-1);
      locateActivity([]);
    },
    [locateActivity, setRunIndex, totalPages]
  );

  return (
    <div className={styles.tableContainer}>
      <table className={styles.runTable} cellSpacing="0" cellPadding="0">
        <thead>
          <tr>
            <th />
            {Array.from(sortFunctions.keys()).map((k) => (
              <th key={k} onClick={handleClick}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRuns.map((run, elementIndex) => (
            <RunRow
              key={run.run_id}
              elementIndex={startIndex + elementIndex}
              locateActivity={locateActivity}
              run={run}
              runIndex={runIndex}
              setRunIndex={setRunIndex}
            />
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageButton}
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          {IS_CHINESE ? '上一页' : 'Prev'}
        </button>
        <span className={styles.pageInfo}>
          {IS_CHINESE
            ? `第 ${currentPage} / ${totalPages} 页`
            : `Page ${currentPage} / ${totalPages}`}
        </span>
        <button
          type="button"
          className={styles.pageButton}
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          {IS_CHINESE ? '下一页' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default RunTable;
