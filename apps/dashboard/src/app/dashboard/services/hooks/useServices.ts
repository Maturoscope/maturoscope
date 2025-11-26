import { useState, useEffect, useCallback } from 'react';
import { ServiceSummary, Service, ServiceScale, ScaleType } from '../types/service';

/**
 * Transform Service from backend to ServiceSummary for frontend
 */
function transformToServiceSummary(service: Service): ServiceSummary {
  // Group gap coverages by scale type
  const scalesMap = new Map<ScaleType, Set<number>>();

  const gapCoverages = Array.isArray(service.gapCoverages)
    ? service.gapCoverages
    : [];

  gapCoverages.forEach((coverage) => {
    if (!scalesMap.has(coverage.scaleType)) {
      scalesMap.set(coverage.scaleType, new Set());
    }
    scalesMap.get(coverage.scaleType)!.add(coverage.level);
  });

  // Convert to array of ServiceScale
  const scales: ServiceScale[] = Array.from(scalesMap.entries()).map(
    ([type, levelsSet]) => ({
      type,
      levels: Array.from(levelsSet).sort((a, b) => a - b),
    }),
  );

  return {
    id: service.id,
    name: service.name,
    description: service.description,
    url: service.url,
    mainContact: {
      firstName: service.mainContactFirstName || '',
      lastName: service.mainContactLastName || '',
      email: service.mainContactEmail || '',
    },
    secondaryContact: {
      firstName: service.secondaryContactFirstName || '',
      lastName: service.secondaryContactLastName || '',
      email: service.secondaryContactEmail || '',
    },
    scales,
  };
}

export function useServices() {
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching services:", data.message);
        setServices([]);
        return;
      }

      const transformedData = data.map(transformToServiceSummary);
      setServices(transformedData);
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const deleteService = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/services/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete service");
        }

        await fetchServices();
      } catch (err) {
        console.error("Error deleting service:", err);
        throw err;
      }
    },
    [fetchServices]
  );

  return {
    services,
    loading,
    deleteService,
    fetchServices,
  };
}
