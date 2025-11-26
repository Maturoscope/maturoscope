"use client";

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DynamicPageHeader } from "@/components/DynamicPageHeader";
import { useUserContext } from "@/app/hooks/contexts/UserProvider";
import { Toast } from "@/components/ui/toast";
import { ServicesHeader } from "./components/ServicesHeader";
import { ServicesTable } from "./components/ServicesTable";
import { ServiceSheet } from "./components/ServiceSheet";
import { DeleteServiceDialog } from "./components/DeleteServiceDialog";
import { useServices } from "./hooks/useServices";
import { useServiceFilters } from "./hooks/useServiceFilters";
import { ServiceSummary } from "./types/service";

export default function ServicesPage() {
  const { t } = useTranslation("SERVICES");
  const { t: tDashboard } = useTranslation("DASHBOARD");
  const { user } = useUserContext();
  const { services, loading, deleteService, fetchServices } = useServices();
  const {
    searchQuery,
    setSearchQuery,
    scaleFilter,
    setScaleFilter,
    filteredServices,
    scaleCounts,
  } = useServiceFilters(services);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceSummary | null>(null);
  
  // Toast states
  const [showCreatedToast, setShowCreatedToast] = useState(false);
  const [showUpdatedToast, setShowUpdatedToast] = useState(false);
  const [showDeletedToast, setShowDeletedToast] = useState(false);
  const [toastServiceName, setToastServiceName] = useState("");

  const breadcrumbs = useMemo(() => {
    const organizationName = user?.organization?.name || tDashboard("ORGANIZATION");
    return [{ label: organizationName }, { label: tDashboard("SERVICES") }];
  }, [user?.organization?.name, tDashboard]);

  const handleAddService = () => {
    setSelectedServiceId(undefined);
    setIsModalOpen(true);
  };

  const handleEditService = (service: ServiceSummary) => {
    setSelectedServiceId(service.id);
    setIsModalOpen(true);
  };

  const handleDeleteService = (service: ServiceSummary) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService(serviceToDelete.id);
      setToastServiceName(serviceToDelete.name);
      setShowDeletedToast(true);
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      // TODO: Show error toast
    }
  };

  const handleServiceSuccess = async (serviceName: string) => {
    // Determine if it was a create or update operation
    const isUpdate = !!selectedServiceId;
    
    // Refresh services list
    await fetchServices();
    
    // Show appropriate toast
    setToastServiceName(serviceName);
    if (isUpdate) {
      setShowUpdatedToast(true);
    } else {
      setShowCreatedToast(true);
    }
  };

  return (
    <>
      <DynamicPageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-6 px-6 pb-6 text-[#0A0A0A] mt-5">
        <ServicesHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          scaleFilter={scaleFilter}
          onScaleFilterChange={setScaleFilter}
          onAddService={handleAddService}
        />

      {/* Services Table */}
      <ServicesTable
        services={filteredServices}
        loading={loading}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
      />

      {/* Service Sheet */}
      <ServiceSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceId={selectedServiceId}
        onSuccess={handleServiceSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteServiceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        serviceName={serviceToDelete?.name || ""}
      />

      {/* Toast Notifications */}
      <Toast
        title={t("TOASTS.SERVICE_CREATED.TITLE")}
        description={t("TOASTS.SERVICE_CREATED.DESCRIPTION", {
          name: toastServiceName,
        })}
        isVisible={showCreatedToast}
        onClose={() => setShowCreatedToast(false)}
        showIcon={false}
        showCloseButton={false}
      />

      <Toast
        title={t("TOASTS.SERVICE_UPDATED.TITLE")}
        description={t("TOASTS.SERVICE_UPDATED.DESCRIPTION", {
          name: toastServiceName,
        })}
        isVisible={showUpdatedToast}
        onClose={() => setShowUpdatedToast(false)}
        showIcon={false}
        showCloseButton={false}
      />

      <Toast
        title={t("TOASTS.SERVICE_DELETED.TITLE")}
        description={t("TOASTS.SERVICE_DELETED.DESCRIPTION", {
          name: toastServiceName,
        })}
        isVisible={showDeletedToast}
        onClose={() => setShowDeletedToast(false)}
        showIcon={false}
        showCloseButton={false}
      />
      </div>
    </>
  );
}
