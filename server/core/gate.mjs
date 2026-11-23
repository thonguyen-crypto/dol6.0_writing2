/* "Khóa bước" (pacing) — DOL Lesson App Kit 2.14 spec.
   control.gate     index (0-based, in lesson.steps order) of the last step students may open; null = Tự do.
   control.gateAuto when on, the gate follows the teacher's step forward.
   Teachers are never locked. */

/** Apply the gate-related part of a teacher's control patch. Returns an error string or null. */
export function applyGatePatch(c, patch, stepKeys) {
  const idx = (key) => stepKeys.indexOf(key);
  if (patch.gate !== undefined) {
    if (patch.gate !== null && (!Number.isInteger(patch.gate) || patch.gate < 0 || patch.gate >= stepKeys.length)) return 'Bước mở không hợp lệ.';
    c.gate = patch.gate;
  }
  if (typeof patch.gateAuto === 'boolean') c.gateAuto = patch.gateAuto;
  if (!Number.isInteger(c.gate)) return null;
  // "Tự mở theo bước GV đang chiếu": the teacher moved past the gate.
  // (also when the option is switched on while the teacher is already past the gate)
  if (c.gateAuto && (typeof patch.teacherStep === 'string' || patch.gateAuto === true) && idx(c.teacherStep) > c.gate) c.gate = idx(c.teacherStep);
  // "Mời lớp tới đây" opens the invited step too.
  if (typeof patch.invite === 'string' && idx(patch.invite) > c.gate) c.gate = idx(patch.invite);
  return null;
}

/** True when a student may not open / save work on this step. */
export function stepLockedForStudent(control, stepKeys, stepKey) {
  return Boolean(control) && Number.isInteger(control.gate) && stepKeys.indexOf(stepKey) > control.gate;
}
