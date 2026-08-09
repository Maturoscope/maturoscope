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
        // Default to active when the field is missing (older records / cache).
        isActive: service.isActive ?? true,
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

  const toggleServiceActive = useCallback(
    async (id: string, isActive: boolean) => {
      // Optimistic update for a snappy switch; revert if the request fails.
      setServices((prev) =>
        prev.map((service) =>
          service.id === id ? { ...service, isActive } : service
        )
      );

      try {
        const response = await fetch(`/api/services/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Failed to update service");
        }
      } catch (err) {
        console.error("Error toggling service:", err);
        setServices((prev) =>
          prev.map((service) =>
            service.id === id ? { ...service, isActive: !isActive } : service
          )
        );
        throw err;
      }
    },
    []
  );

  return {
    services,
    loading,
    deleteService,
    toggleServiceActive,
    fetchServices,
  };
}
