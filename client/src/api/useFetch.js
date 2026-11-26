import { useCallback, useEffect, useState } from 'react';
import api, { apiMessage } from './http';

export default function useFetch(url, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (!enabled || !url) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    api
      .get(url)
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((err) => {
        if (active) setError(apiMessage(err, 'Could not load data'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, enabled, tick]);

  return { data, setData, loading, error, reload };
}
