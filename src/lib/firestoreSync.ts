import { isFirebaseAvailable, db, collection, onSnapshot } from './firebase';
import { Database } from './mockData';

type Setters = {
  setVehicles?: (v: any[]) => void;
  setDailyLogs?: (v: any[]) => void;
  setMonthlyLogs?: (v: any[]) => void;
  setSchedules?: (v: any[]) => void;
  setHistory?: (v: any[]) => void;
  setPartReplacements?: (v: any[]) => void;
  setNotifications?: (v: any[]) => void;
  setRequests?: (v: any[]) => void;
  setActivityLogs?: (v: any[]) => void;
};

export function startFirestoreListeners(setters: Setters) {
  if (!isFirebaseAvailable || !db) return [] as Array<() => void>;

  const mapping: [string, ((arr: any[]) => void) | undefined][] = [
    ['vehicles', setters.setVehicles],
    ['daily_logs', setters.setDailyLogs],
    ['monthly_logs', setters.setMonthlyLogs],
    ['schedules', setters.setSchedules],
    ['history', setters.setHistory],
    ['part_replacements', setters.setPartReplacements],
    ['notifications', setters.setNotifications],
    ['requests', setters.setRequests],
    ['activity_logs', setters.setActivityLogs]
  ];

  const unsubscribes: Array<() => void> = [];

  mapping.forEach(([colName, setter]) => {
    try {
      const colRef = collection(db, colName);
      const unsub = onSnapshot(colRef, (snap) => {
        const data = snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
        try {
          // Prevent write-back loop
          if (typeof window !== 'undefined') (window as any).__QLXE_SKIP_FIRESTORE_MIRROR = true;
          switch (colName) {
            case 'vehicles':
              Database.saveVehicles(data);
              setter && setter(data);
              break;
            case 'daily_logs':
              Database.saveDailyLogs(data);
              setter && setter(data);
              break;
            case 'monthly_logs':
              Database.saveMonthlyLogs(data);
              setter && setter(data);
              break;
            case 'schedules':
              Database.saveSchedules(data);
              setter && setter(data);
              break;
            case 'history':
              Database.saveHistory(data);
              setter && setter(data);
              break;
            case 'part_replacements':
              Database.savePartReplacements(data);
              setter && setter(data);
              break;
            case 'notifications':
              Database.saveNotifications(data);
              setter && setter(data);
              break;
            case 'requests':
              Database.saveRequests(data);
              setter && setter(data);
              break;
            case 'activity_logs':
              Database.saveActivityLogs(data);
              setter && setter(data);
              break;
            default:
              break;
          }
        } finally {
          if (typeof window !== 'undefined') (window as any).__QLXE_SKIP_FIRESTORE_MIRROR = false;
        }
      }, (err) => {
        console.warn('Firestore onSnapshot error for', colName, err);
      });
      unsubscribes.push(unsub);
    } catch (e) {
      console.warn('Failed to attach listener for', colName, e);
    }
  });

  return unsubscribes;
}
