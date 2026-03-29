import { exportAllData } from './storage';

export function downloadDataExport(): void {
  const payload = exportAllData();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workout-data.json';
  a.click();
  URL.revokeObjectURL(url);
}
