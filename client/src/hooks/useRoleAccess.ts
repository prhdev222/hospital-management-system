import { useAuth } from "./useAuth";

export type UserRole = "admin" | "doctor" | "nurse";

export interface RolePermissions {
  canViewPatients: boolean;
  canEditPatients: boolean;
  canDeletePatients: boolean;
  canViewAppointments: boolean;
  canEditAppointments: boolean;
  canViewTreatmentPlans: boolean;
  canEditTreatmentPlans: boolean;
  canViewLabResults: boolean;
  canEditLabResults: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canAccessDocumentLinks: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: true,
    canViewAppointments: true,
    canEditAppointments: true,
    canViewTreatmentPlans: true,
    canEditTreatmentPlans: true,
    canViewLabResults: true,
    canEditLabResults: true,
    canViewReports: true,
    canExportData: true,
    canAccessSettings: true,
    canManageUsers: true,
    canAccessDocumentLinks: true,
  },
  doctor: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: false,
    canViewAppointments: true,
    canEditAppointments: true,
    canViewTreatmentPlans: true,
    canEditTreatmentPlans: true,
    canViewLabResults: true,
    canEditLabResults: true,
    canViewReports: true,
    canExportData: true,
    canAccessSettings: false,
    canManageUsers: false,
    canAccessDocumentLinks: true,
  },
  nurse: {
    canViewPatients: true,
    canEditPatients: false,
    canDeletePatients: false,
    canViewAppointments: true,
    canEditAppointments: true,
    canViewTreatmentPlans: true,
    canEditTreatmentPlans: false,
    canViewLabResults: true,
    canEditLabResults: false,
    canViewReports: false,
    canExportData: false,
    canAccessSettings: false,
    canManageUsers: false,
    canAccessDocumentLinks: true,
  },
};

export function useRoleAccess() {
  const { user } = useAuth();
  
  const userRole = ((user as any)?.role as UserRole) || "doctor";
  const permissions = rolePermissions[userRole];

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case "admin": return "ผู้ดูแลระบบ";
      case "doctor": return "แพทย์";
      case "nurse": return "พยาบาล";
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 border-red-200";
      case "doctor": return "bg-blue-100 text-blue-800 border-blue-200";
      case "nurse": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return {
    userRole,
    permissions,
    hasPermission,
    getRoleDisplayName,
    getRoleColor,
  };
}