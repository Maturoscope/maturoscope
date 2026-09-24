"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { ManageTranslationsModal } from "@/components/languages/ManageTranslationsModal";
import {
  LanguagesService,
  LanguageCode,
  ServiceTranslationStatus,
} from "@/services/languages.service";

export default function ServicesPage() {
  const { t, i18n } = useTranslation("SERVICES");
  const { t: tDashboard } = useTranslation("DASHBOARD");
  const { user } = useUserContext();
  const currentLanguageCode = i18n.language?.toUpperCase().startsWith("FR") ? "FR" : "EN";

  const getTranslatedServiceName = (service: ServiceSummary | null): string => {
    if (!service) return "";
    if (currentLanguageCode === "FR") {
      return service.nameFr;
    }
    return service.nameEn;
  };
  const { services, loading, deleteService, toggleServiceActive, fetchServices } = useServices();
  const {
    searchQuery,
    setSearchQuery,
    scaleFilter,
    setScaleFilter,
    levelRangeFilter,
    setLevelRangeFilter,
    activeFilter,
    setActiveFilter,
    statusCounts,
    filteredServices,
  } = useServiceFilters(services);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  // Translation status per service + enabled secondary languages, for the
  // Translation column, the "Manage Translations" button and the per-service edit.
  const [translationStatus, setTranslationStatus] = useState<
    Record<string, ServiceTranslationStatus>
  >({});
  const [secondaryLanguages, setSecondaryLanguages] = useState<LanguageCode[]>([]);
  const [translationModal, setTranslationModal] = useState<{
    serviceId?: string;
    languages: LanguageCode[];
    initialLanguage?: LanguageCode;
  } | null>(null);

  const loadTranslationMeta = useCallback(async () => {
    try {
      const [statuses, langs] = await Promise.all([
        LanguagesService.getServicesStatus(),
        LanguagesService.getLanguages(),
      ]);
      setTranslationStatus(
        Object.fromEntries(statuses.map((s) => [s.serviceId, s])),
      );
      setSecondaryLanguages(
        langs.filter((l) => l.enabled && !l.isDefault).map((l) => l.code),
      );
    } catch {
      // Non-blocking: the table still renders without translation status.
    }
  }, []);

  useEffect(() => {
    loadTranslationMeta();
  }, [loadTranslationMeta, services]);

  const handleManageTranslations = () => {
    if (secondaryLanguages.length === 0) return;
    setTranslationModal({
      languages: secondaryLanguages,
      initialLanguage: secondaryLanguages[0],
    });
  };

  const handleTranslateService = (service: ServiceSummary) => {
    const st = translationStatus[service.id];
    const langs =
      st?.missingLanguages && st.missingLanguages.length > 0
        ? st.missingLanguages
        : secondaryLanguages;
    if (langs.length === 0) return;
    setTranslationModal({
      serviceId: service.id,
      languages: langs,
      initialLanguage: langs[0],
    });
  };
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceSummary | null>(null);
  
  // Toast states
  const [showCreatedToast, setShowCreatedToast] = useState(false);
  const [showUpdatedToast, setShowUpdatedToast] = useState(false);
  const [showDeletedToast, setShowDeletedToast] = useState(false);
  const [showDeactivateToast, setShowDeactivateToast] = useState(false);
  const [showReactivateToast, setShowReactivateToast] = useState(false);
  const [toastServiceName, setToastServiceName] = useState("");
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  const [toggledServiceId, setToggledServiceId] = useState<string | null>(null);
  const [toggledServiceName, setToggledServiceName] = useState("");

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
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewService = (service: ServiceSummary) => {
    setSelectedServiceId(service.id);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleEditFromView = () => {
    setIsViewMode(false);
  };

  const handleDeleteService = (service: ServiceSummary) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  // Raw toggle (optimistic + reverts on failure). Used directly by Undo so it
  // doesn't re-trigger a confirmation modal or another toast.
  const toggleActive = async (service: ServiceSummary, isActive: boolean) => {
    try {
      await toggleServiceActive(service.id, isActive);
    } catch (error) {
      console.error("Error toggling service active state:", error);
    }
  };

  // Called from the table (deactivation already confirmed via its modal).
  // Shows the matching toast only once the toggle actually succeeds.
  const handleToggleActive = async (
    service: ServiceSummary,
    isActive: boolean
  ) => {
    try {
      await toggleServiceActive(service.id, isActive);
      setToggledServiceId(service.id);
      setToggledServiceName(getTranslatedServiceName(service));
      if (isActive) {
        setShowDeactivateToast(false);
        setShowReactivateToast(true);
      } else {
        setShowReactivateToast(false);
        setShowDeactivateToast(true);
      }
    } catch (error) {
      console.error("Error toggling service active state:", error);
    }
  };

  const handleUndoToggle = (reactivate: boolean) => {
    if (toggledServiceId) {
      const service = services.find((s) => s.id === toggledServiceId);
      if (service) {
        toggleActive(service, reactivate);
      }
    }
    setShowDeactivateToast(false);
    setShowReactivateToast(false);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService(serviceToDelete.id);
      setToastServiceName(getTranslatedServiceName(serviceToDelete));
      setShowDeletedToast(true);
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleServiceSuccess = async (serviceName: string, newServiceId?: string) => {
    const isUpdate = !!selectedServiceId;
    await fetchServices();
    setToastServiceName(serviceName);
    if (isUpdate) {
      setShowUpdatedToast(true);
    } else {
      if (newServiceId) {
        setCreatedServiceId(newServiceId);
      }
      setShowCreatedToast(true);
    }
  };

  const handleUndoCreate = async () => {
    if (createdServiceId) {
      try {
        await deleteService(createdServiceId);
        await fetchServices();
        setCreatedServiceId(null);
        setShowCreatedToast(false);
      } catch (error) {
        console.error("Error undoing service creation:", error);
      }
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
          levelRangeFilter={levelRangeFilter}
          onLevelRangeChange={setLevelRangeFilter}
          activeFilter={activeFilter}
          onActiveFilterChange={setActiveFilter}
          statusCounts={statusCounts}
          onAddService={handleAddService}
          onManageTranslations={
            secondaryLanguages.length > 0 ? handleManageTranslations : undefined
          }
        />

      {/* Services Table */}
      <ServicesTable
        services={filteredServices}
        loading={loading}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
        onView={handleViewService}
        onToggleActive={handleToggleActive}
        activeFilter={activeFilter}
        translationStatus={translationStatus}
        onTranslate={handleTranslateService}
      />

      {/* Service Sheet */}
      <ServiceSheet
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsViewMode(false);
        }}
        serviceId={selectedServiceId}
        onSuccess={handleServiceSuccess}
        viewOnly={isViewMode}
        onEdit={handleEditFromView}
      />

      {/* Manage Translations modal (header button + per-service pencil) */}
      {translationModal && translationModal.languages.length > 0 && (
        <ManageTranslationsModal
          open={!!translationModal}
          onOpenChange={(open) => !open && setTranslationModal(null)}
          languages={translationModal.languages}
          initialLanguage={translationModal.initialLanguage}
          serviceId={translationModal.serviceId}
          mode="edit"
          onSaved={() => {
            loadTranslationMeta();
            fetchServices();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteServiceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        serviceName={getTranslatedServiceName(serviceToDelete)}
      />

      {/* Toast Notifications */}
      <Toast
        title={t("TOASTS.SERVICE_CREATED.TITLE")}
        description={t("TOASTS.SERVICE_CREATED.DESCRIPTION", {
          name: toastServiceName,
        })}
        isVisible={showCreatedToast}
        onClose={() => {
          setShowCreatedToast(false);
          setCreatedServiceId(null);
        }}
        onUndo={handleUndoCreate}
        undoText={t("TOASTS.UNDO")}
        showIcon={true}
      />

      <Toast
        title={t("TOASTS.SERVICE_UPDATED.TITLE")}
        description={t("TOASTS.SERVICE_UPDATED.DESCRIPTION", {
          name: toastServiceName,
        })}
        isVisible={showUpdatedToast}
        onClose={() => setShowUpdatedToast(false)}
        showIcon={true}
      />

      <Toast
        title={t("TOASTS.SERVICE_DELETED.TITLE")}
        description={t("TOASTS.SERVICE_DELETED.DESCRIPTION", {
          name: toastServiceName,
        })}
        isVisible={showDeletedToast}
        onClose={() => setShowDeletedToast(false)}
        showIcon={true}
      />

      <Toast
        title={t("TOASTS.SERVICE_DEACTIVATED.TITLE")}
        description={t("TOASTS.SERVICE_DEACTIVATED.DESCRIPTION", {
          name: toggledServiceName,
        })}
        isVisible={showDeactivateToast}
        onClose={() => setShowDeactivateToast(false)}
        onUndo={() => handleUndoToggle(true)}
        undoText={t("TOASTS.UNDO")}
        showIcon={false}
      />

      <Toast
        title={t("TOASTS.SERVICE_REACTIVATED.TITLE")}
        description={t("TOASTS.SERVICE_REACTIVATED.DESCRIPTION", {
          name: toggledServiceName,
        })}
        isVisible={showReactivateToast}
        onClose={() => setShowReactivateToast(false)}
        onUndo={() => handleUndoToggle(false)}
        undoText={t("TOASTS.UNDO")}
        showIcon={false}
      />
      </div>
    </>
  );
}
