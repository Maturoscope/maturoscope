import { useState, useEffect, useCallback } from 'react';
import { ServiceSummary } from '../types/service';

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

      const servicesData: ServiceSummary[] = Array.isArray(data) ? data : [];
      
      const normalizedServices = servicesData.map((service) => ({
        id: service.id,
        nameEn: service.nameEn || '',
        nameFr: service.nameFr || '',
        descriptionEn: service.descriptionEn || '',
        descriptionFr: service.descriptionFr || '',
        url: service.url || '',
        mainContact: {
          firstName: service.mainContact?.firstName || '',
          lastName: service.mainContact?.lastName || '',
          email: service.mainContact?.email || '',
        },
        secondaryContact: {
          firstName: service.secondaryContact?.firstName || '',
          lastName: service.secondaryContact?.lastName || '',
          email: service.secondaryContact?.email || '',
        },
        scales: Array.isArray(service.scales) 
          ? service.scales.map((scale) => ({
              type: scale.type,
              levels: Array.isArray(scale.levels) 
                ? [...new Set(scale.levels)].sort((a, b) => a - b)
                : [],
            }))
          : [],
      }));

      setServices(normalizedServices);
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
