export const useWeekcrewSnapshot = <T,>(
  selector: (snapshot: WeekcrewStorageSnapshot) => T
): T => {
  const storage = getWeekcrewStorage();

  // 1) useSyncExternalStore подписывается на store
  // 2) getSnapshot / getServerSnapshot ничего не создают, просто отдают снапшот
  const snapshot = useSyncExternalStore(
    storage.subscribe,
    storage.getSnapshot,
    storage.getServerSnapshot
  );

  // 3) А уже тут, после того как React получил стабильный снапшот, применяем селектор
  return selector(snapshot);
};
