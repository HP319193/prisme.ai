import { FC, useCallback, useMemo } from "react";
import { Event } from "../../api/types";
import { DataTable, DataTableRowClickEventParams } from "primereact/datatable";
import { Column } from "primereact/column";
import { useDateFormat } from "../../utils/dates";
import { useTranslation } from "next-i18next";
import { selectText } from "../../utils/dom";

interface EventsDetailsProps extends Event<Date> {}

export const EventDetails: FC<EventsDetailsProps> = (event) => {
  const { t } = useTranslation("workspaces");
  const formatDate = useDateFormat();
  const value = useMemo(
    () => [
      {
        name: "id",
        value: event.id,
      },
      {
        name: "type",
        value: event.type,
      },
      {
        name: "createdAt",
        value: formatDate(event.createdAt, { format: "yyyy-MM-dd hh:mm" }),
      },
      {
        name: "source.app",
        value: event.source.app,
      },
      {
        name: "source.userId",
        value: event.source.userId,
      },
      {
        name: "source.workspaceId",
        value: event.source.workspaceId,
      },
      {
        name: "source.host.service",
        value: event.source.host.service,
      },
      {
        name: "source.correlationId",
        value: event.source.correlationId,
      },
      {
        name: "payload",
        value: event.payload && (
          <pre>
            <code>{JSON.stringify(event.payload, null, " ")}</code>
          </pre>
        ),
      },
      {
        name: "error.error",
        value: event.error?.error,
      },
      {
        name: "error.message",
        value: event.error?.message,
      },
      {
        name: "error.details",
        value: event.error?.details && (
          <pre>
            <code>{JSON.stringify(event.error?.details, null, " ")}</code>
          </pre>
        ),
      },
    ],
    [event, formatDate]
  );
  const onRowClick = useCallback(
    ({ originalEvent: { target } }: DataTableRowClickEventParams) => {
      const valueTd = (
        target as HTMLTableRowElement
      ).parentNode?.querySelectorAll("td")[1]!;
      selectText(valueTd);
    },
    []
  );

  return (
    <DataTable value={value} onRowClick={onRowClick}>
      <Column field="name" header={t("events.details.name")} />
      <Column field="value" header={t("events.details.value")} />
    </DataTable>
  );
};

export default EventDetails;
