// Hand-authored design-sync entry: the app has no library build, so this file
// is the bundle entry (cfg.entry). Re-export every synced component here.
import "./process-shim";

export { Alert } from "../src/components/ui/Alert";
export { Header } from "../src/components/ui/Header";
export { SessionProvider } from "../src/lib/auth/session";
export { Button } from "../src/components/ui/Button";
export { Checkbox } from "../src/components/ui/Checkbox";
export { Field } from "../src/components/ui/Field";
export { Select } from "../src/components/ui/Select";
export { Textarea } from "../src/components/ui/Textarea";
export { JobFilters } from "../src/components/jobs/JobFilters";
export { JobForm } from "../src/components/jobs/JobForm";
export { JobStatusBadge } from "../src/components/jobs/JobStatusBadge";
export { StatusChanger } from "../src/components/jobs/StatusChanger";
export { SkillFilters } from "../src/components/skills/SkillFilters";
export { SkillForm } from "../src/components/skills/SkillForm";
export { EvidenceManager } from "../src/components/skills/EvidenceManager";
export { CareerSection } from "../src/components/career/CareerSection";
export { CertificationForm } from "../src/components/career/CertificationForm";
export { CertificationItem } from "../src/components/career/CertificationItem";
export { EducationForm } from "../src/components/career/EducationForm";
export { EducationItem } from "../src/components/career/EducationItem";
export { ProjectForm } from "../src/components/career/ProjectForm";
export { ProjectSkillsManager } from "../src/components/career/ProjectSkillsManager";
export { AdaptTrigger } from "../src/components/adaptations/AdaptTrigger";
export { AdaptationResult } from "../src/components/adaptations/AdaptationResult";
export { ResumeDocuments } from "../src/components/adaptations/ResumeDocuments";
