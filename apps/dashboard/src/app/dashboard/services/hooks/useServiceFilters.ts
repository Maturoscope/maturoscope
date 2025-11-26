import { useState, useMemo } from 'react';
import { ServiceSummary, ScaleType } from '../types/service';

export function useServiceFilters(services: ServiceSummary[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scaleFilter, setScaleFilter] = useState<ScaleType | 'All'>('All');

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Scale filter
      const matchesScale =
        scaleFilter === 'All' ||
        service.scales.some((scale) => scale.type === scaleFilter);

      return matchesSearch && matchesScale;
    });
  }, [services, searchQuery, scaleFilter]);

  // Count services by scale
  const scaleCounts = useMemo(() => {
    const counts = {
      All: services.length,
      TRL: 0,
      MkRL: 0,
      MfRL: 0,
    };

    services.forEach((service) => {
      service.scales.forEach((scale) => {
        counts[scale.type]++;
      });
    });

    return counts;
  }, [services]);

  return {
    searchQuery,
    setSearchQuery,
    scaleFilter,
    setScaleFilter,
    filteredServices,
    scaleCounts,
  };
}

