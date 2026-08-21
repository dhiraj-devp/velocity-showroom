export type VehicleInternal = {
  vehicleId: string;
  registrationNumber?: string;
  vinOrChassisNumber?: string;
  ownershipCount?: number;
  serviceHistoryAvailable: boolean;
  insuranceExpiry?: string;
  numberOfKeys?: number;
  purchasePrice?: number;
  purchaseSource?: string;
  internalNotes?: string;
};

export type VehicleInternalWriteInput = {
  registrationNumber?: string;
  vinOrChassisNumber?: string;
  ownershipCount?: number;
  serviceHistoryAvailable: boolean;
  insuranceExpiry?: string;
  numberOfKeys?: number;
  purchasePrice?: number;
  purchaseSource?: string;
  internalNotes?: string;
};

export function estimatedMargin(salePrice: number, purchasePrice?: number) {
  if (purchasePrice === undefined) return null;
  return salePrice - purchasePrice;
}
