"use client";

import { useCallback, useState } from "react";
import { BookingDialog } from "@/features/bookings/components/BookingDialog";
import { CallAction } from "@/features/dealership/components/CallAction";
import { WhatsAppAction } from "@/features/dealership/components/WhatsAppAction";
import type { Dealership } from "@/features/dealership/types";
import { EnquiryDialog } from "@/features/leads/components/EnquiryDialog";
import { ShareVehicleAction } from "@/features/vehicles/components/ShareVehicleAction";
import {
  availabilityNote,
  canBookViewing,
  canEnquireAboutVehicle,
  canRegisterInterest,
} from "@/features/vehicles/lib/availability";
import {
  buildInterestMessage,
  buildSimilarEnquiryMessage,
  buildVehicleEnquiryMessage,
  formatVehicleTitle,
} from "@/features/vehicles/lib/enquiryContext";
import type { VehicleRecord } from "@/features/vehicles/types";

type DialogMode = "enquiry" | "similar" | "interest" | "booking" | null;

export function VehicleConversion({
  record,
  dealership,
}: {
  record: VehicleRecord;
  dealership: Dealership;
}) {
  const [dialog, setDialog] = useState<DialogMode>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const status = record.vehicle.availability;
  const title = formatVehicleTitle(record);
  const note = availabilityNote(status);
  const whatsappMessage =
    status === "sold"
      ? buildSimilarEnquiryMessage(record, dealership)
      : status === "coming_soon"
        ? buildInterestMessage(record, dealership)
        : buildVehicleEnquiryMessage(record, dealership);

  return (
    <div>
      {note ? (
        <p className="mb-6 max-w-md text-sm leading-relaxed text-muted">{note}</p>
      ) : null}

      <div className="hidden flex-col gap-3 sm:flex">
        {canEnquireAboutVehicle(status) ? (
          <button
            type="button"
            className="collection-apply w-full sm:w-auto"
            onClick={() => setDialog("enquiry")}
          >
            Enquire about this vehicle
          </button>
        ) : null}
        {status === "sold" ? (
          <>
            <a href="#similar-vehicles" className="collection-apply inline-flex justify-center">
              Find similar
            </a>
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center border border-border px-7 text-[0.68rem] tracking-[0.28em] uppercase"
              onClick={() => setDialog("similar")}
            >
              Enquire about similar vehicles
            </button>
          </>
        ) : null}
        {canRegisterInterest(status) ? (
          <button
            type="button"
            className="collection-apply w-full sm:w-auto"
            onClick={() => setDialog("interest")}
          >
            Register interest
          </button>
        ) : null}
        {canBookViewing(status) ? (
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center border border-border px-7 text-[0.68rem] tracking-[0.28em] uppercase"
            onClick={() => setDialog("booking")}
          >
            Book a viewing
          </button>
        ) : null}
      </div>

      <div className="mt-6 hidden items-center gap-x-6 gap-y-3 sm:flex sm:flex-wrap">
        <WhatsAppAction
          dealership={dealership}
          message={whatsappMessage}
          vehicleId={record.vehicle.id}
        />
        <CallAction dealership={dealership} vehicleId={record.vehicle.id} />
        <ShareVehicleAction title={title} text={whatsappMessage} />
      </div>

      <div className="flex flex-col gap-4 sm:hidden">
        {canBookViewing(status) ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-[0.62rem] tracking-[0.28em] text-accent uppercase"
            onClick={() => setDialog("booking")}
          >
            Book a viewing
          </button>
        ) : null}
        <ShareVehicleAction title={title} text={whatsappMessage} />
        <CallAction dealership={dealership} vehicleId={record.vehicle.id} />
      </div>

      <div className="vehicle-sticky-bar sm:hidden">
        {status === "sold" ? (
          <>
            <a href="#similar-vehicles" className="collection-apply flex-1 text-center">
              Find similar
            </a>
            <button
              type="button"
              className="inline-flex min-h-12 flex-1 items-center justify-center border border-border px-4 text-[0.62rem] tracking-[0.2em] uppercase"
              onClick={() => setDialog("similar")}
            >
              Enquire
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="collection-apply flex-1"
              onClick={() =>
                setDialog(canRegisterInterest(status) ? "interest" : "enquiry")
              }
            >
              {canRegisterInterest(status) ? "Register" : "Enquire"}
            </button>
            <WhatsAppAction
              dealership={dealership}
              message={whatsappMessage}
              vehicleId={record.vehicle.id}
              variant="button"
            >
              WhatsApp
            </WhatsAppAction>
          </>
        )}
      </div>

      <EnquiryDialog
        key={dialog === "booking" || dialog === null ? "enquiry-idle" : dialog}
        open={dialog === "enquiry" || dialog === "similar" || dialog === "interest"}
        mode={
          dialog === "interest"
            ? "register_interest"
            : dialog === "similar"
              ? "similar_enquiry"
              : "vehicle_enquiry"
        }
        record={record}
        dealership={dealership}
        onClose={closeDialog}
      />
      <BookingDialog
        key={dialog === "booking" ? "booking-open" : "booking-idle"}
        open={dialog === "booking"}
        record={record}
        onClose={closeDialog}
      />
    </div>
  );
}
