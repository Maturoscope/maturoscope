import { useState, useMemo } from 'react';
import { ServiceSummary, ScaleType, LevelRangeKey, LEVEL_RANGE_MAP } from '../types/service';

export type ActiveFilter = 'active' | 'inactive';

export function useServiceFilters(services: ServiceSummary[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scaleFilter, setScaleFilter] = useState<ScaleType | 'All'>('All');
  const [levelRangeFilter, setLevelRangeFilter] = useState<LevelRangeKey | null>(null);
  // Default to showing active services (matches the design's "Active (N)").
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active');

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter - search in translations
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        service.nameEn.toLowerCase().includes(searchLower) ||
        service.nameFr.toLowerCase().includes(searchLower) ||
        service.descriptionEn.toLowerCase().includes(searchLower) ||
        service.descriptionFr.toLowerCase().includes(searchLower);

      // Scale filter
      const matchesScale =
        scaleFilter === 'All' ||
        service.scales.some((scale) => scale.type === scaleFilter);

      // Level range filter
      const matchesLevelRange =
        levelRangeFilter === null ||
        service.scales.some((scale) =>
          scale.levels.some((level) => {
            const range = levelRangeFilter ? LEVEL_RANGE_MAP[levelRangeFilter] : null;
            if (!range) return true;
            return level >= range.min && level <= range.max;
          })
        );

      // Active/Inactive filter
      const matchesActive =
        activeFilter === 'active' ? service.isActive : !service.isActive;

      return matchesSearch && matchesScale && matchesLevelRange && matchesActive;
    });
  }, [services, searchQuery, scaleFilter, levelRangeFilter, activeFilter]);

  // Count services by active status (for the filter dropdown labels)
  const statusCounts = useMemo(() => {
    const active = services.filter((service) => service.isActive).length;
    return { active, inactive: services.length - active };
  }, [services]);

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
    levelRangeFilter,
    setLevelRangeFilter,
    activeFilter,
    setActiveFilter,
    filteredServices,
    scaleCounts,
    statusCounts,
  };
}

