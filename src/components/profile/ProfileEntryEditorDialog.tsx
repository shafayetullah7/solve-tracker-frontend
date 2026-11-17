import { createEffect, createSignal, Show } from "solid-js";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import {
  findEducationEntry,
  findWorkEntry,
} from "../../lib/profile/profile-mock.client";
import {
  MAX_EDUCATION_ENTRIES,
  profileEditorTitle,
  type ProfileEntryEditorTarget,
} from "../../lib/profile/profile-editor-target";
import type { EducationEntry, WorkEntry } from "../../lib/profile/profile-view.types";
import { FormAlert } from "../ui/FormAlert";
import { FormField } from "../ui/FormField";
import { ProfileEditorDialog } from "./ProfileEditorDialog";
import { ProfileFormFooter } from "./ProfileFormFooter";

function newEntryId() {
  return globalThis.crypto?.randomUUID?.() ?? `profile-${Date.now()}`;
}

export type ProfileEntryEditorDialogProps = {
  target: ProfileEntryEditorTarget | null;
  work: WorkEntry[];
  education: EducationEntry[];
  onClose: () => void;
  onSaveWork: (entry: WorkEntry) => Promise<void>;
  onSaveEducation: (entry: EducationEntry) => Promise<void>;
};

export function ProfileEntryEditorDialog(props: ProfileEntryEditorDialogProps) {
  const [organization, setOrganization] = createSignal("");
  const [role, setRole] = createSignal("");
  const [period, setPeriod] = createSignal("");
  const [institution, setInstitution] = createSignal("");
  const [program, setProgram] = createSignal("");
  const [endYear, setEndYear] = createSignal("");
  const [formError, setFormError] = createSignal<string | undefined>();
  const [staleEdit, setStaleEdit] = createSignal(false);
  const [pending, setPending] = createSignal(false);

  let seededTargetKey = "";

  createEffect(
    () => [props.target, props.work, props.education] as const,
    ([target]) => {
      if (!target) {
        seededTargetKey = "";
        setStaleEdit(false);
        return;
      }
      if (pending()) return;
      const key =
        target.kind === "work-edit" || target.kind === "education-edit"
          ? `${target.kind}-${target.id}`
          : target.kind;
      if (seededTargetKey === key) return;
      seededTargetKey = key;
      setFormError(undefined);
      setStaleEdit(false);

      if (target.kind === "work-add") {
        setOrganization("");
        setRole("");
        setPeriod("");
        return;
      }
      if (target.kind === "work-edit") {
        const entry = findWorkEntry(props.work, target.id);
        setStaleEdit(!entry);
        setOrganization(entry?.organization ?? "");
        setRole(entry?.role ?? "");
        setPeriod(entry?.period ?? "");
        return;
      }
      if (target.kind === "education-add") {
        setInstitution("");
        setProgram("");
        setEndYear("");
        return;
      }
      const entry = findEducationEntry(props.education, target.id);
      setStaleEdit(!entry);
      setInstitution(entry?.institution ?? "");
      setProgram(entry?.program ?? "");
      setEndYear(entry?.endYear ?? "");
    },
  );

  const open = () => props.target !== null;
  const isWork = () => {
    const kind = props.target?.kind;
    return kind === "work-add" || kind === "work-edit";
  };

  const titleId = "profile-entry-editor-title";
  const fieldDisabled = () => pending() || staleEdit();
  const submitDisabled = () => staleEdit();

  function requestClose() {
    if (pending()) return;
    props.onClose();
  }

  async function save(event: Event) {
    event.preventDefault();
    if (pending() || staleEdit()) return;
    const target = props.target;
    if (!target) return;

    if (isWork()) {
      const org = organization().trim();
      const roleValue = role().trim();
      if (!org) {
        setFormError("Organization is required.");
        return;
      }
      if (!roleValue) {
        setFormError("Role is required.");
        return;
      }
      const periodValue = period().trim();
      const id = target.kind === "work-edit" ? target.id : newEntryId();
      const entry: WorkEntry = {
        id,
        organization: org,
        role: roleValue,
        period: periodValue || undefined,
      };
      setPending(true);
      setFormError(undefined);
      try {
        await props.onSaveWork(entry);
        props.onClose();
      } catch (error) {
        setFormError(applyProfileApiError(error).banner);
      } finally {
        setPending(false);
      }
      return;
    }

    if (target.kind === "education-add" && props.education.length >= MAX_EDUCATION_ENTRIES) {
      setFormError(`You can add at most ${MAX_EDUCATION_ENTRIES} education entries.`);
      return;
    }

    const school = institution().trim();
    const programValue = program().trim();
    if (!school) {
      setFormError("Institution is required.");
      return;
    }
    if (!programValue) {
      setFormError("Program is required.");
      return;
    }
    const year = endYear().trim();
    const id = target.kind === "education-edit" ? target.id : newEntryId();
    const entry: EducationEntry = {
      id,
      institution: school,
      program: programValue,
      endYear: year || undefined,
    };
    setPending(true);
    setFormError(undefined);
    try {
      await props.onSaveEducation(entry);
      props.onClose();
    } catch (error) {
      setFormError(applyProfileApiError(error).banner);
    } finally {
      setPending(false);
    }
  }

  return (
    <ProfileEditorDialog
      open={open()}
      titleId={titleId}
      title={profileEditorTitle(props.target)}
      description="Changes are saved when you confirm. Profile APIs are still in preview."
      closeBlocked={pending()}
      onClose={() => props.onClose()}
      onRequestClose={requestClose}
    >
      <form
        class="space-y-4"
        onSubmit={(event) => void save(event)}
        aria-busy={pending() ? "true" : undefined}
      >
        <Show when={staleEdit()}>
          <FormAlert variant="error">This entry was removed.</FormAlert>
        </Show>
        <Show
          when={isWork()}
          fallback={
            <>
              <FormField id="profile-education-institution" label="Institution">
                <input
                  id="profile-education-institution"
                  class="ui-field"
                  type="text"
                  disabled={fieldDisabled()}
                  value={institution()}
                  onInput={(event) => {
                    setInstitution(event.currentTarget.value);
                    setFormError(undefined);
                  }}
                />
              </FormField>
              <FormField id="profile-education-program" label="Program">
                <input
                  id="profile-education-program"
                  class="ui-field"
                  type="text"
                  disabled={fieldDisabled()}
                  value={program()}
                  onInput={(event) => {
                    setProgram(event.currentTarget.value);
                    setFormError(undefined);
                  }}
                />
              </FormField>
              <FormField id="profile-education-end-year" label="End year (optional)">
                <input
                  id="profile-education-end-year"
                  class="ui-field"
                  type="text"
                  inputmode="numeric"
                  placeholder="e.g. 2026"
                  disabled={fieldDisabled()}
                  value={endYear()}
                  onInput={(event) => {
                    setEndYear(event.currentTarget.value);
                    setFormError(undefined);
                  }}
                />
              </FormField>
            </>
          }
        >
          <FormField id="profile-work-organization" label="Organization">
            <input
              id="profile-work-organization"
              class="ui-field"
              type="text"
              disabled={fieldDisabled()}
              value={organization()}
              onInput={(event) => {
                setOrganization(event.currentTarget.value);
                setFormError(undefined);
              }}
            />
          </FormField>
          <FormField id="profile-work-role" label="Role">
            <input
              id="profile-work-role"
              class="ui-field"
              type="text"
              disabled={fieldDisabled()}
              value={role()}
              onInput={(event) => {
                setRole(event.currentTarget.value);
                setFormError(undefined);
              }}
            />
          </FormField>
          <FormField id="profile-work-period" label="Period (optional)">
            <input
              id="profile-work-period"
              class="ui-field"
              type="text"
              placeholder="e.g. Summer 2025"
              disabled={fieldDisabled()}
              value={period()}
              onInput={(event) => {
                setPeriod(event.currentTarget.value);
                setFormError(undefined);
              }}
            />
          </FormField>
        </Show>
        <Show when={formError()}>
          <FormAlert variant="error">{formError()}</FormAlert>
        </Show>
        <ProfileFormFooter
          pending={pending()}
          submitDisabled={submitDisabled()}
          onCancel={requestClose}
        />
      </form>
    </ProfileEditorDialog>
  );
}