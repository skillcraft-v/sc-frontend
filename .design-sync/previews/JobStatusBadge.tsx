import { JobStatusBadge } from "sc-frontend";

export const Funil = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <JobStatusBadge status="saved" />
    <JobStatusBadge status="applied" />
    <JobStatusBadge status="interviewing" />
    <JobStatusBadge status="offer" />
    <JobStatusBadge status="accepted" />
    <JobStatusBadge status="rejected" />
  </div>
);

export const Salva = () => <JobStatusBadge status="saved" />;

export const Entrevistando = () => <JobStatusBadge status="interviewing" />;
